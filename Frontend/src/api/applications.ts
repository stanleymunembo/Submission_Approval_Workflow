import { apiFetch } from './client'
import type {
  Application,
  ApplicationFormData,
  AuditLog,
  ReviewAction,
  ReviewQueueItem,
} from '../types/application'

export async function fetchMyApplications(): Promise<Application[]> {
  const data = await apiFetch('/api/applications/mine')
  return data.applications
}

export async function fetchReviewQueue(status?: string): Promise<ReviewQueueItem[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  const data = await apiFetch(`/api/applications/queue${query}`)
  return data.applications
}

export async function fetchApplication(id: number): Promise<{
  application: Application
  audit_logs: AuditLog[]
}> {
  return apiFetch(`/api/applications/${id}`)
}

function toPayload(form: ApplicationFormData) {
  return {
    title: form.title.trim(),
    category: form.category,
    description: form.description.trim() || null,
    amount: form.amount ? Number(form.amount) : null,
    requested_date: form.requested_date || null,
  }
}

export async function createApplication(form: ApplicationFormData): Promise<Application> {
  const data = await apiFetch('/api/applications', {
    method: 'POST',
    body: JSON.stringify(toPayload(form)),
  })
  return data.application
}

export async function updateApplication(
  id: number,
  form: ApplicationFormData
): Promise<Application> {
  const data = await apiFetch(`/api/applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toPayload(form)),
  })
  return data.application
}

export async function submitApplication(id: number): Promise<Application> {
  const data = await apiFetch(`/api/applications/${id}/submit`, {
    method: 'POST',
  })
  return data.application
}

export async function reviewApplication(
  id: number,
  action: ReviewAction,
  comment?: string
): Promise<Application> {
  const data = await apiFetch(`/api/applications/${id}/review`, {
    method: 'POST',
    body: JSON.stringify({ action, comment: comment?.trim() || null }),
  })
  return data.application
}
