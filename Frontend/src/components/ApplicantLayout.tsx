import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function ApplicantLayout({ title, subtitle, children }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="page dashboard">
      <div className="card wide">
        <header className="header">
          <div>
            <h1>{title}</h1>
            <p className="subtitle">
              {subtitle ?? `Welcome, ${user?.full_name}`}
            </p>
          </div>
          <div className="header-actions">
            <Link to="/applicant/applications" className="link-button">
              My applications
            </Link>
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}
