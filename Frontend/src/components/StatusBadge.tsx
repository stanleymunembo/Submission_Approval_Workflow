import type { ApplicationStatus } from '../types/application'

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  DRAFT: 'status-draft',
  SUBMITTED: 'status-submitted',
  UNDER_REVIEW: 'status-review',
  APPROVED: 'status-approved',
  REJECTED: 'status-rejected',
  RETURNED: 'status-returned',
}

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`status-badge ${STATUS_CLASS[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
