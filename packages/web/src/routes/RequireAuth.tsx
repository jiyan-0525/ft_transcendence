import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStatus } from '@/stores/auth'
import SessionChecking from './SessionChecking'

type GuardProps = {
  children: ReactNode
}

/**
 * Lets signed-in users through. Guests are sent to /login and the attempted
 * URL is remembered, so login can send them back.
 */
export default function RequireAuth({ children }: GuardProps) {
  const status = useAuthStatus()
  const location = useLocation()

  if (status === 'unknown') return <SessionChecking />

  if (status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
