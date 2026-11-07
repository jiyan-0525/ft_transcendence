import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

// TODO(auth): replace with real session state once the API lands.
// A function, not a constant, so the guard reads like the final version.
function isAuthenticated() {
  return true
}

type RequireAuthProps = {
  children: ReactNode
}

/**
 * Route guard skeleton. Today it lets everyone through; once auth is
 * implemented only this function changes and route definitions stay the same.
 */
export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
