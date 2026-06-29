// Set secret before loading the app
process.env.JWT_SECRET = 'test_secret_for_jest'

const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../src/app')

// Fake tokens for testing (no database needed for these tests)
const applicantToken = jwt.sign(
  { id: 1, email: 'applicant@demo.com', role: 'applicant' },
  process.env.JWT_SECRET
)

const reviewerToken = jwt.sign(
  { id: 2, email: 'reviewer@demo.com', role: 'reviewer' },
  process.env.JWT_SECRET
)

describe('Authorization on API routes', () => {
  test('applicant cannot review an application (403)', async () => {
    const response = await request(app)
      .post('/api/applications/1/review')
      .set('Authorization', `Bearer ${applicantToken}`)
      .send({ action: 'approve' })

    expect(response.status).toBe(403)
    expect(response.body.error).toBe('You do not have permission')
  })

  test('reviewer cannot view applicant-only list (403)', async () => {
    const response = await request(app)
      .get('/api/applications/mine')
      .set('Authorization', `Bearer ${reviewerToken}`)

    expect(response.status).toBe(403)
    expect(response.body.error).toBe('You do not have permission')
  })

  test('applicant cannot view reviewer queue (403)', async () => {
    const response = await request(app)
      .get('/api/applications/queue')
      .set('Authorization', `Bearer ${applicantToken}`)

    expect(response.status).toBe(403)
    expect(response.body.error).toBe('You do not have permission')
  })

  test('request without token is rejected (401)', async () => {
    const response = await request(app).get('/api/applications/mine')

    expect(response.status).toBe(401)
    expect(response.body.error).toBe('Not logged in')
  })
})
