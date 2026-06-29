export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'

export const CATEGORIES = ['Travel', 'Equipment', 'Training', 'Other'] as const
export type ApplicationCategory = (typeof CATEGORIES)[number]

export interface Application {
  id: number
  title: string
  category: ApplicationCategory
  description: string | null
  amount: string | null
  requested_date: string | null
  status: ApplicationStatus
  created_at: string
  submitted_at: string | null
  owner_id?: number
  owner_name?: string
}

export interface AuditLog {
  id: number
  old_status: ApplicationStatus | null
  new_status: ApplicationStatus
  comment: string | null
  created_at: string
  actor_name: string
}

export interface ApplicationFormData {
  title: string
  category: ApplicationCategory
  description: string
  amount: string
  requested_date: string
}

export function canEditApplication(status: ApplicationStatus): boolean {
  return status === 'DRAFT' || status === 'RETURNED'
}

export function canSubmitApplication(status: ApplicationStatus): boolean {
  return status === 'DRAFT' || status === 'RETURNED'
}

export type ReviewAction = 'start_review' | 'approve' | 'reject' | 'return'

export interface ReviewQueueItem {
  id: number
  title: string
  category: ApplicationCategory
  status: ApplicationStatus
  created_at: string
  submitted_at: string | null
  owner_name: string
}

export function reviewActionNeedsComment(action: ReviewAction): boolean {
  return action === 'reject' || action === 'return'
}
