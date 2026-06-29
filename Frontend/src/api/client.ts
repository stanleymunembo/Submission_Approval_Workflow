const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string): void {
  localStorage.setItem('token', token)
}

export function clearAuth(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function saveUser(user: object): void {
  localStorage.setItem('user', JSON.stringify(user))
}

export function getSavedUser<T>(): T | null {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    clearAuth()
    return null
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}
