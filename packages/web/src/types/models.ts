import type { UserRole } from './api'

/**
 * Domain model used by components. Camel case, parsed values.
 * The wire shape (`UserResponse`) is mapped to this in lib/mappers.ts.
 */
export type User = {
  id: number
  email: string
  username: string
  role: UserRole
  isActive: boolean
  createdAt: Date
}
