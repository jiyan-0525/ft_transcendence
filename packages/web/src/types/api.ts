/**
 * Shapes of the auth API, as defined by packages/server/app/schemas.py and
 * docs/protocol.md §4 and §2.3.
 *
 * Wire types (request/response bodies) stay snake_case, exactly as the server
 * sends them. Mapping to camelCase models happens in lib/api.ts, not here.
 */

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN'

/** POST /api/auth/register — RegisterRequest (extra fields are rejected). */
export type RegisterRequest = {
  email: string
  username: string
  password: string
}

/** POST /api/auth/login */
export type LoginRequest = {
  email: string
  password: string
}

/** Response body for register and me — UserResponse. */
export type UserResponse = {
  id: number
  email: string
  username: string
  role: UserRole
  is_active: boolean
  created_at: string
}

/** Stable error codes from protocol.md §2.3. */
export type ApiErrorCode =
  | 'INVALID_PAYLOAD'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL'

/**
 * Target error envelope from protocol.md §2.3. Until the backend maps
 * FastAPI's default `{"detail": ...}` onto this shape, lib/api.ts must
 * accept both.
 */
export type ApiErrorEnvelope = {
  error: {
    code: ApiErrorCode
    message: string
    requestId: string
  }
}
