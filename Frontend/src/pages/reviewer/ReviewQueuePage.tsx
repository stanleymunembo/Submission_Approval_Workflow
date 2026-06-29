import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchReviewQueue } from '../../api/applications'
import ReviewerLayout from '../../components/ReviewerLayout'
import StatusBadge from '../../components/StatusBadge'
import type { ReviewQueueItem } from '../../types/application'

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Under review', value: 'UNDER_REVIEW' },
  { label: 'Returned', value: 'RETURNED' },
]

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

export default function ReviewQueuePage() {
  const [applications, setApplications] = useState<ReviewQueueItem[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')

    fetchReviewQueue(statusFilter || undefined)
      .then(setApplications)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <ReviewerLayout title="Review Queue">
      <div className="toolbar filter-bar">
        <label className="filter-label">
          Filter by status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className="muted">Loading queue...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && applications.length === 0 && (
        <p className="muted">No applications in the queue for this filter.</p>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Applicant</th>
                <th>Category</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.title}</td>
                  <td>{app.owner_name}</td>
                  <td>{app.category}</td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td>{formatDate(app.submitted_at)}</td>
                  <td className="actions-cell">
                    <Link to={`/reviewer/applications/${app.id}`}>Review</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReviewerLayout>
  )
}
