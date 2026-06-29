import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createApplication,
  fetchApplication,
  updateApplication,
} from '../../api/applications'
import ApplicantLayout from '../../components/ApplicantLayout'
import {
  CATEGORIES,
  type ApplicationFormData,
} from '../../types/application'

const emptyForm: ApplicationFormData = {
  title: '',
  category: 'Travel',
  description: '',
  amount: '',
  requested_date: '',
}

export default function ApplicationFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<ApplicationFormData>(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    fetchApplication(Number(id))
      .then(({ application }) => {
        setForm({
          title: application.title,
          category: application.category,
          description: application.description ?? '',
          amount: application.amount ?? '',
          requested_date: application.requested_date ?? '',
        })
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  function updateField<K extends keyof ApplicationFormData>(
    field: K,
    value: ApplicationFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (isEdit && id) {
        await updateApplication(Number(id), form)
        navigate(`/applicant/applications/${id}`)
      } else {
        const created = await createApplication(form)
        navigate(`/applicant/applications/${created.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ApplicantLayout
      title={isEdit ? 'Edit application' : 'New application'}
      subtitle="Fill in the details below. Amount or requested date is required."
    >
      {loading && <p className="muted">Loading...</p>}

      {!loading && (
        <form onSubmit={handleSubmit} className="form">
          <label>
            Title *
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />
          </label>

          <label>
            Category *
            <select
              value={form.category}
              onChange={(e) =>
                updateField('category', e.target.value as ApplicationFormData['category'])
              }
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
            />
          </label>

          <label>
            Amount ($)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => updateField('amount', e.target.value)}
            />
          </label>

          <label>
            Requested date
            <input
              type="date"
              value={form.requested_date}
              onChange={(e) => updateField('requested_date', e.target.value)}
            />
          </label>

          <p className="hint">Provide an amount or a requested date (at least one).</p>

          {error && <p className="error">{error}</p>}

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create application'}
            </button>
            <Link to={isEdit && id ? `/applicant/applications/${id}` : '/applicant/applications'}>
              Cancel
            </Link>
          </div>
        </form>
      )}
    </ApplicantLayout>
  )
}
