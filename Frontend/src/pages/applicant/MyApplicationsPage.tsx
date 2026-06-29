import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyApplications } from '../../api/applications'
import ApplicantLayout from '../../components/ApplicantLayout'
import StatusBadge from '../../components/StatusBadge'
import type { Application } from '../../types/application'
import { canEditApplication } from '../../types/application'

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

function formatAmount(amount: string | null): string {
  if (!amount) return '—'
  return `$${Number(amount).toLocaleString()}`
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyApplications()
      .then(setApplications)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ApplicantLayout title="My Applications">
      <div className="toolbar">
        <Link to="/applicant/applications/new" className="primary-link">
          + New application
        </Link>
      </div>

      {loading && <p className="muted">Loading applications...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && applications.length === 0 && (
        <p className="muted">No applications yet. Create your first one.</p>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.title}</td>
                  <td>{app.category}</td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td>{formatAmount(app.amount)}</td>
                  <td>{formatDate(app.created_at)}</td>
                  <td className="actions-cell">
                    <Link to={`/applicant/applications/${app.id}`}>View</Link>
                    {canEditApplication(app.status) && (
                      <Link to={`/applicant/applications/${app.id}/edit`}>Edit</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ApplicantLayout>
  )
}
