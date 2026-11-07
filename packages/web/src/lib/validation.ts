/**
 * Form validation rules shared by the auth pages.
 *
 * These mirror `packages/server/app/schemas.py`. The server stays the source
 * of truth; the client only catches obvious mistakes before a request is sent.
 */

/** Matches `RegisterRequest.password` in schemas.py (min_length=15). */
export const MIN_PASSWORD_LENGTH = 15
/** Matches `RegisterRequest.password` (max_length=128). */
export const MAX_PASSWORD_LENGTH = 128
/** Matches `Username` in schemas.py. */
export const MIN_USERNAME_LENGTH = 3
export const MAX_USERNAME_LENGTH = 50
const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/
/** Matches `RegisterRequest.email` (max_length=254). */
const MAX_EMAIL_LENGTH = 254

/**
 * Deliberately simple: something, an `@`, something, a dot, something.
 * The server must still validate — this only catches obvious mistakes early.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim()

  if (!email) return 'Enter your email address.'
  if (!isValidEmail(email) || email.length > MAX_EMAIL_LENGTH) {
    return 'Enter a valid email address.'
  }

  return undefined
}

export function validateUsername(value: string): string | undefined {
  const username = value.trim()

  if (!username) return 'Choose a username.'
  if (username.length < MIN_USERNAME_LENGTH) {
    return `Use at least ${MIN_USERNAME_LENGTH} characters.`
  }
  if (username.length > MAX_USERNAME_LENGTH) {
    return `Use at most ${MAX_USERNAME_LENGTH} characters.`
  }
  if (!USERNAME_PATTERN.test(username)) {
    return 'Use only letters, numbers and underscores.'
  }

  return undefined
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Enter your password.'
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (value.length > MAX_PASSWORD_LENGTH) {
    return `Use at most ${MAX_PASSWORD_LENGTH} characters.`
  }

  return undefined
}
