import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStatus } from '@/stores/auth'
import SessionChecking from './SessionChecking'

type GuardProps = {
  children: ReactNode
}

/**
 * Only for signed-out pages (login, register). A signed-in user is sent back
 * to the page they originally asked for, or to the feed.
 */
export default function RequireGuest({ children }: GuardProps) {
  const status = useAuthStatus()
  const location = useLocation()

  if (status === 'unknown') return <SessionChecking />

  if (status === 'authenticated') {
    const from = (location.state as { from?: { pathname?: string } } | null)
      ?.from?.pathname

    return <Navigate to={from ?? '/'} replace />
  }

  return <>{children}</>
}
