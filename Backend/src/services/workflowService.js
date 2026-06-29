// Allowed categories for applications
const CATEGORIES = ['Travel', 'Equipment', 'Training', 'Other']

// Check if applicant can edit this application
function canEdit(status) {
  return status === 'DRAFT' || status === 'RETURNED'
}

// Check if applicant can submit this application
function canSubmit(status) {
  return status === 'DRAFT' || status === 'RETURNED'
}

// Check if reject or return needs a comment
function needsComment(action) {
  return action === 'reject' || action === 'return'
}

// Get the new status after a reviewer action
function getReviewStatus(currentStatus, action) {
  if (action === 'start_review' && currentStatus === 'SUBMITTED') {
    return 'UNDER_REVIEW'
  }

  if (currentStatus === 'UNDER_REVIEW') {
    if (action === 'approve') return 'APPROVED'
    if (action === 'reject') return 'REJECTED'
    if (action === 'return') return 'RETURNED'
  }

  return null
}

// Simple validation for create/update
function validateApplication(body) {
  const errors = []

  if (!body.title || body.title.trim() === '') {
    errors.push('Title is required')
  }

  if (!body.category || !CATEGORIES.includes(body.category)) {
    errors.push('Category must be Travel, Equipment, Training, or Other')
  }

  if (!body.amount && !body.requested_date) {
    errors.push('Amount or requested date is required')
  }

  return errors
}

module.exports = {
  CATEGORIES,
  canEdit,
  canSubmit,
  needsComment,
  getReviewStatus,
  validateApplication,
}
