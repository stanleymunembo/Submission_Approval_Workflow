const express = require('express')
const { pool } = require('../config/db')
const { auth, requireRole } = require('../middleware/auth')
const {
  canEdit,
  canSubmit,
  needsComment,
  getReviewStatus,
  validateApplication,
} = require('../services/workflowService')

const router = express.Router()

// Helper: save a status change to audit_logs
async function saveAuditLog(applicationId, actorId, oldStatus, newStatus, comment) {
  await pool.query(
    `INSERT INTO audit_logs (application_id, actor_id, old_status, new_status, comment)
     VALUES ($1, $2, $3, $4, $5)`,
    [applicationId, actorId, oldStatus, newStatus, comment || null]
  )
}

// Helper: get audit history for one application
async function getAuditLogs(applicationId) {
  const result = await pool.query(
    `SELECT a.id, a.old_status, a.new_status, a.comment, a.created_at, u.full_name AS actor_name
     FROM audit_logs a
     JOIN users u ON u.id = a.actor_id
     WHERE a.application_id = $1
     ORDER BY a.created_at ASC`,
    [applicationId]
  )
  return result.rows
}

// GET /api/applications/mine  (applicant only)
router.get('/mine', auth, requireRole('applicant'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, category, description, amount, requested_date, status, created_at, submitted_at
       FROM applications
       WHERE owner_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    )

    res.json({ applications: result.rows })
  } catch (err) {
    console.error('Get mine error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/applications/queue  (reviewer only)
router.get('/queue', auth, requireRole('reviewer'), async (req, res) => {
  try {
    const status = req.query.status

    let query = `
      SELECT a.id, a.title, a.category, a.status, a.created_at, a.submitted_at, u.full_name AS owner_name
      FROM applications a
      JOIN users u ON u.id = a.owner_id
      WHERE a.status IN ('SUBMITTED', 'UNDER_REVIEW', 'RETURNED')
    `
    const values = []

    if (status) {
      query += ' AND a.status = $1'
      values.push(status)
    }

    query += ' ORDER BY a.submitted_at DESC NULLS LAST'

    const result = await pool.query(query, values)

    res.json({ applications: result.rows })
  } catch (err) {
    console.error('Get queue error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/applications/:id  (owner or reviewer)
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.full_name AS owner_name
       FROM applications a
       JOIN users u ON u.id = a.owner_id
       WHERE a.id = $1`,
      [req.params.id]
    )

    const application = result.rows[0]

    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const isOwner = req.user.role === 'applicant' && application.owner_id === req.user.id
    const isReviewer = req.user.role === 'reviewer'

    if (!isOwner && !isReviewer) {
      return res.status(403).json({ error: 'You do not have permission' })
    }

    const audit_logs = await getAuditLogs(application.id)

    res.json({ application, audit_logs })
  } catch (err) {
    console.error('Get one error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/applications  (applicant creates draft)
router.post('/', auth, requireRole('applicant'), async (req, res) => {
  try {
    const errors = validateApplication(req.body)

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const { title, category, description, amount, requested_date } = req.body

    const result = await pool.query(
      `INSERT INTO applications (owner_id, title, category, description, amount, requested_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT')
       RETURNING *`,
      [req.user.id, title.trim(), category, description || null, amount || null, requested_date || null]
    )

    res.status(201).json({ application: result.rows[0] })
  } catch (err) {
    console.error('Create error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/applications/:id  (applicant edits draft or returned)
router.put('/:id', auth, requireRole('applicant'), async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM applications WHERE id = $1', [req.params.id])
    const application = existing.rows[0]

    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    if (application.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission' })
    }

    if (!canEdit(application.status)) {
      return res.status(400).json({ error: 'You can only edit draft or returned applications' })
    }

    const errors = validateApplication(req.body)

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') })
    }

    const { title, category, description, amount, requested_date } = req.body

    const result = await pool.query(
      `UPDATE applications
       SET title = $1, category = $2, description = $3, amount = $4, requested_date = $5
       WHERE id = $6
       RETURNING *`,
      [title.trim(), category, description || null, amount || null, requested_date || null, req.params.id]
    )

    res.json({ application: result.rows[0] })
  } catch (err) {
    console.error('Update error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/applications/:id/submit  (applicant submits)
router.post('/:id/submit', auth, requireRole('applicant'), async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM applications WHERE id = $1', [req.params.id])
    const application = existing.rows[0]

    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    if (application.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission' })
    }

    if (!canSubmit(application.status)) {
      return res.status(400).json({ error: 'This application cannot be submitted' })
    }

    const oldStatus = application.status
    const newStatus = 'SUBMITTED'

    const result = await pool.query(
      `UPDATE applications
       SET status = $1, submitted_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [newStatus, req.params.id]
    )

    await saveAuditLog(application.id, req.user.id, oldStatus, newStatus, null)

    res.json({ application: result.rows[0] })
  } catch (err) {
    console.error('Submit error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/applications/:id/review  (reviewer actions)
router.post('/:id/review', auth, requireRole('reviewer'), async (req, res) => {
  try {
    const { action, comment } = req.body

    if (!action) {
      return res.status(400).json({ error: 'Action is required' })
    }

    if (needsComment(action) && (!comment || comment.trim() === '')) {
      return res.status(400).json({ error: 'Comment is required for reject and return' })
    }

    const existing = await pool.query('SELECT * FROM applications WHERE id = $1', [req.params.id])
    const application = existing.rows[0]

    if (!application) {
      return res.status(404).json({ error: 'Application not found' })
    }

    const newStatus = getReviewStatus(application.status, action)

    if (!newStatus) {
      return res.status(400).json({ error: 'This action is not allowed for the current status' })
    }

    const result = await pool.query(
      `UPDATE applications SET status = $1 WHERE id = $2 RETURNING *`,
      [newStatus, req.params.id]
    )

    await saveAuditLog(application.id, req.user.id, application.status, newStatus, comment || null)

    res.json({ application: result.rows[0] })
  } catch (err) {
    console.error('Review error:', err.message)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
