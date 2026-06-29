import { createContext, useContext, useState, type ReactNode } from 'react'
import { apiFetch, clearAuth, getSavedUser, saveUser, setToken } from '../api/client'
import type { User } from '../types/user'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSavedUser<User>())

  async function login(email: string, password: string): Promise<User> {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    setToken(data.token)
    saveUser(data.user)
    setUser(data.user)
    return data.user
  }

  function logout() {
    clearAuth()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
