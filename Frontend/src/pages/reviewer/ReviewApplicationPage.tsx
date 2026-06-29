import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  fetchApplication,
  reviewApplication,
} from '../../api/applications'
import ReviewerLayout from '../../components/ReviewerLayout'
import StatusBadge from '../../components/StatusBadge'
import type { Application, AuditLog, ReviewAction } from '../../types/application'
import { reviewActionNeedsComment } from '../../types/application'

function formatDateTime(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function formatAmount(amount: string | null): string {
  if (!amount) return '—'
  return `$${Number(amount).toLocaleString()}`
}

export default function ReviewApplicationPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [application, setApplication] = useState<Application | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    fetchApplication(Number(id))
      .then((data) => {
        setApplication(data.application)
        setAuditLogs(data.audit_logs)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleReview(action: ReviewAction) {
    if (!application) return

    if (reviewActionNeedsComment(action) && comment.trim() === '') {
      setError('A comment is required for reject and return.')
      return
    }

    setError('')
    setActing(true)

    try {
      await reviewApplication(application.id, action, comment)
      if (action === 'approve' || action === 'reject') {
        navigate('/reviewer/queue')
        return
      }

      const refreshed = await fetchApplication(application.id)
      setApplication(refreshed.application)
      setAuditLogs(refreshed.audit_logs)
      setComment('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review action failed')
    } finally {
      setActing(false)
    }
  }

  const status = application?.status

  return (
    <ReviewerLayout title="Review application">
      <p className="breadcrumb">
        <Link to="/reviewer/queue">← Back to queue</Link>
      </p>

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && application && (
        <>
          <div className="detail-header">
            <div>
              <h2 className="detail-title">{application.title}</h2>
              <StatusBadge status={application.status} />
            </div>
          </div>

          <dl className="detail-grid">
            <div>
              <dt>Applicant</dt>
              <dd>{application.owner_name ?? '—'}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{application.category}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{formatAmount(application.amount)}</dd>
            </div>
            <div>
              <dt>Requested date</dt>
              <dd>{application.requested_date ?? '—'}</dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>{formatDateTime(application.submitted_at)}</dd>
            </div>
          </dl>

          {application.description && (
            <section className="detail-section">
              <h3>Description</h3>
              <p>{application.description}</p>
            </section>
          )}

          <section className="detail-section">
            <h3>Review actions</h3>

            {status === 'SUBMITTED' && (
              <div className="review-actions">
                <button
                  type="button"
                  onClick={() => handleReview('start_review')}
                  disabled={acting}
                >
                  {acting ? 'Working...' : 'Start review'}
                </button>
              </div>
            )}

            {status === 'UNDER_REVIEW' && (
              <>
                <label className="review-comment">
                  Comment (required for reject or return)
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Add feedback for the applicant..."
                  />
                </label>
                <div className="review-actions">
                  <button
                    type="button"
                    className="btn-success"
                    onClick={() => handleReview('approve')}
                    disabled={acting}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleReview('reject')}
                    disabled={acting}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="btn-warning"
                    onClick={() => handleReview('return')}
                    disabled={acting}
                  >
                    Return to applicant
                  </button>
                </div>
              </>
            )}

            {status === 'RETURNED' && (
              <p className="muted">
                This application was returned to the applicant. Waiting for them to
                resubmit.
              </p>
            )}

            {status !== 'SUBMITTED' &&
              status !== 'UNDER_REVIEW' &&
              status !== 'RETURNED' && (
                <p className="muted">No review actions available for this status.</p>
              )}
          </section>

          <section className="detail-section">
            <h3>Audit trail</h3>
            {auditLogs.length === 0 ? (
              <p className="muted">No status changes yet.</p>
            ) : (
              <ul className="audit-list">
                {auditLogs.map((log) => (
                  <li key={log.id}>
                    <strong>{formatDateTime(log.created_at)}</strong>
                    {' — '}
                    {log.actor_name}: {log.old_status ?? 'NEW'} → {log.new_status}
                    {log.comment && (
                      <span className="audit-comment"> — {log.comment}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {!loading && !application && !error && (
        <p className="muted">
          Application not found. <Link to="/reviewer/queue">Return to queue</Link>
        </p>
      )}
    </ReviewerLayout>
  )
}
