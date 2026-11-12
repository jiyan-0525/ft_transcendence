import { api } from '@/lib/api'
import { mapUser } from '@/lib/mappers'
import * as mock from '@/lib/mock/auth'
import type { LoginRequest, RegisterRequest, UserResponse } from '@/types/api'
import type { User } from '@/types/models'

/**
 * The auth operations the UI uses. Components depend on this shape only,
 * never on fetch or on the mock module directly.
 */
export type AuthClient = {
  register(input: RegisterRequest): Promise<User>
  login(input: LoginRequest): Promise<User>
  logout(): Promise<void>
  me(): Promise<User>
}

const realClient: AuthClient = {
  async register(input) {
    return mapUser(await api.post<UserResponse>('/auth/register', input))
  },
  async login(input) {
    return mapUser(await api.post<UserResponse>('/auth/login', input))
  },
  async logout() {
    await api.post<void>('/auth/logout')
  },
  async me() {
    return mapUser(await api.get<UserResponse>('/auth/me'))
  },
}

const mockClient: AuthClient = {
  async register(input) {
    return mapUser(await mock.register(input))
  },
  async login(input) {
    return mapUser(await mock.login(input))
  },
  async logout() {
    await mock.logout()
  },
  async me() {
    return mapUser(await mock.me())
  },
}

// Mocks stay on unless VITE_USE_MOCKS is explicitly 'false', so a missing
// variable never sends real traffic to an API that may not exist yet.
export const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

export const authClient: AuthClient = useMocks ? mockClient : realClient
