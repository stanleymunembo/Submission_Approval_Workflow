export type UserRole = 'applicant' | 'reviewer'

export interface User {
  id: number
  email: string
  full_name: string
  role: UserRole
}
