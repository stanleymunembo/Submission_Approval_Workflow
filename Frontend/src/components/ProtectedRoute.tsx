import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/user'

interface Props {
  children: ReactNode
  role: UserRole
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== role) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
