/**
 * Form validation rules shared by the auth pages.
 *
 * They live here rather than inside a component so the login and register
 * forms agree on what a valid email or password is, and so the rules can be
 * unit-tested without rendering a form.
 */

/** Minimum password length used by registration and shown in the hint. */
export const MIN_PASSWORD_LENGTH = 12

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
  if (!isValidEmail(email)) return 'Enter a valid email address.'

  return undefined
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Enter your password.'
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  return undefined
}
