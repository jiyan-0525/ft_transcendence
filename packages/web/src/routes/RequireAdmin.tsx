import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Alert } from '@/components/ui'
import { selectIsAdmin, useAuthStatus, useAuthStore } from '@/stores/auth'
import SessionChecking from './SessionChecking'

type GuardProps = {
  children: ReactNode
}

/**
 * Admin-only pages. Guests go to /login. Signed-in users without the ADMIN
 * role see an explicit "access denied" message rather than a silent redirect.
 *
 * This is a UI guard only. The server must enforce the same rule on every
 * /api/admin route (protocol §13).
 */
export default function RequireAdmin({ children }: GuardProps) {
  const status = useAuthStatus()
  const isAdmin = useAuthStore(selectIsAdmin)
  const location = useLocation()

  if (status === 'unknown') return <SessionChecking />

  if (status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!isAdmin) {
    return (
      <Alert tone="danger" title="Access denied" className="max-w-xl">
        Only platform administrators can open this page.
      </Alert>
    )
  }

  return <>{children}</>
}
