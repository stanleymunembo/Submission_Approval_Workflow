const {
  canEdit,
  canSubmit,
  needsComment,
  getReviewStatus,
  validateApplication,
} = require('../src/services/workflowService')

// --- canEdit ---
describe('canEdit', () => {
  test('allows edit when status is DRAFT', () => {
    expect(canEdit('DRAFT')).toBe(true)
  })

  test('allows edit when status is RETURNED', () => {
    expect(canEdit('RETURNED')).toBe(true)
  })

  test('blocks edit when status is SUBMITTED', () => {
    expect(canEdit('SUBMITTED')).toBe(false)
  })

  test('blocks edit when status is APPROVED', () => {
    expect(canEdit('APPROVED')).toBe(false)
  })
})

// --- canSubmit ---
describe('canSubmit', () => {
  test('allows submit when status is DRAFT', () => {
    expect(canSubmit('DRAFT')).toBe(true)
  })

  test('allows submit when status is RETURNED', () => {
    expect(canSubmit('RETURNED')).toBe(true)
  })

  test('blocks submit when status is UNDER_REVIEW', () => {
    expect(canSubmit('UNDER_REVIEW')).toBe(false)
  })
})

// --- needsComment ---
describe('needsComment', () => {
  test('reject needs a comment', () => {
    expect(needsComment('reject')).toBe(true)
  })

  test('return needs a comment', () => {
    expect(needsComment('return')).toBe(true)
  })

  test('approve does not need a comment', () => {
    expect(needsComment('approve')).toBe(false)
  })
})

// --- getReviewStatus (legal transitions) ---
describe('getReviewStatus - legal transitions', () => {
  test('SUBMITTED + start_review becomes UNDER_REVIEW', () => {
    expect(getReviewStatus('SUBMITTED', 'start_review')).toBe('UNDER_REVIEW')
  })

  test('UNDER_REVIEW + approve becomes APPROVED', () => {
    expect(getReviewStatus('UNDER_REVIEW', 'approve')).toBe('APPROVED')
  })

  test('UNDER_REVIEW + reject becomes REJECTED', () => {
    expect(getReviewStatus('UNDER_REVIEW', 'reject')).toBe('REJECTED')
  })

  test('UNDER_REVIEW + return becomes RETURNED', () => {
    expect(getReviewStatus('UNDER_REVIEW', 'return')).toBe('RETURNED')
  })
})

// --- getReviewStatus (illegal transitions) ---
describe('getReviewStatus - illegal transitions', () => {
  test('DRAFT cannot be approved', () => {
    expect(getReviewStatus('DRAFT', 'approve')).toBe(null)
  })

  test('SUBMITTED cannot be approved directly', () => {
    expect(getReviewStatus('SUBMITTED', 'approve')).toBe(null)
  })

  test('APPROVED cannot be reviewed again', () => {
    expect(getReviewStatus('APPROVED', 'approve')).toBe(null)
  })
})

// --- validateApplication ---
describe('validateApplication', () => {
  test('passes with valid data', () => {
    const errors = validateApplication({
      title: 'Laptop',
      category: 'Equipment',
      amount: 500,
    })

    expect(errors.length).toBe(0)
  })

  test('fails when title is missing', () => {
    const errors = validateApplication({
      title: '',
      category: 'Equipment',
      amount: 500,
    })

    expect(errors).toContain('Title is required')
  })

  test('fails when category is invalid', () => {
    const errors = validateApplication({
      title: 'Laptop',
      category: 'Invalid',
      amount: 500,
    })

    expect(errors).toContain('Category must be Travel, Equipment, Training, or Other')
  })

  test('fails when amount and requested_date are both missing', () => {
    const errors = validateApplication({
      title: 'Laptop',
      category: 'Equipment',
    })

    expect(errors).toContain('Amount or requested date is required')
  })
})
