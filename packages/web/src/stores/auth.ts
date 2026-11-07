import { useEffect } from 'react'
import { create } from 'zustand'
import { authClient } from '@/lib/auth'
import type { LoginRequest, RegisterRequest } from '@/types/api'
import type { User } from '@/types/models'

/**
 * unknown:       the server has not been asked yet (the page just loaded)
 * authenticated: the server confirmed a session
 * guest:         there is no session, or the check failed
 */
export type AuthStatus = 'unknown' | 'authenticated' | 'guest'

type AuthState = {
  status: AuthStatus
  user: User | null
  restore: () => Promise<void>
  login: (input: LoginRequest) => Promise<void>
  register: (input: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'unknown',
  user: null,

  async restore() {
    try {
      const user = await authClient.me()
      set({ status: 'authenticated', user })
    } catch {
      // Any failure counts as signed out for now. A broken API must not
      // leave the user stuck on a loading screen.
      set({ status: 'guest', user: null })
    }
  },

  async login(input) {
    const user = await authClient.login(input)
    set({ status: 'authenticated', user })
  },

  // Registration never signs the user in (protocol D10).
  async register(input) {
    await authClient.register(input)
  },

  async logout() {
    try {
      await authClient.logout()
    } finally {
      set({ status: 'guest', user: null })
    }
  },
}))

export const selectIsAdmin = (state: AuthState) =>
  state.user?.role === 'ADMIN'

/**
 * Returns the session status and asks the server once, on first use, whether
 * a session exists. Guards call this so a signed-in user never sees the login
 * page flash before the check finishes.
 */
export function useAuthStatus(): AuthStatus {
  const status = useAuthStore((state) => state.status)
  const restore = useAuthStore((state) => state.restore)

  useEffect(() => {
    if (status === 'unknown') void restore()
  }, [status, restore])

  return status
}
