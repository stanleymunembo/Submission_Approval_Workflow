import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  fetchApplication,
  submitApplication,
} from '../../api/applications'
import ApplicantLayout from '../../components/ApplicantLayout'
import StatusBadge from '../../components/StatusBadge'
import type { Application, AuditLog } from '../../types/application'
import { canEditApplication, canSubmitApplication } from '../../types/application'

function formatDateTime(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function formatAmount(amount: string | null): string {
  if (!amount) return '—'
  return `$${Number(amount).toLocaleString()}`
}

export default function ApplicationDetailPage() {
  const { id } = useParams()

  const [application, setApplication] = useState<Application | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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

  async function handleSubmit() {
    if (!application) return

    const confirmed = window.confirm(
      'Submit this application for review? You will not be able to edit it until it is returned.'
    )
    if (!confirmed) return

    setError('')
    setSubmitting(true)

    try {
      const updated = await submitApplication(application.id)
      setApplication(updated)
      const refreshed = await fetchApplication(application.id)
      setAuditLogs(refreshed.audit_logs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ApplicantLayout title="Application details">
      <p className="breadcrumb">
        <Link to="/applicant/applications">← Back to list</Link>
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
            <div className="detail-actions">
              {canEditApplication(application.status) && (
                <Link
                  to={`/applicant/applications/${application.id}/edit`}
                  className="primary-link"
                >
                  Edit
                </Link>
              )}
              {canSubmitApplication(application.status) && (
                <button type="button" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit for review'}
                </button>
              )}
            </div>
          </div>

          <dl className="detail-grid">
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
              <dt>Created</dt>
              <dd>{formatDateTime(application.created_at)}</dd>
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
                    {log.comment && <span className="audit-comment"> — {log.comment}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {!loading && !application && !error && (
        <p className="muted">
          Application not found.{' '}
          <Link to="/applicant/applications">Return to list</Link>
        </p>
      )}
    </ApplicantLayout>
  )
}
