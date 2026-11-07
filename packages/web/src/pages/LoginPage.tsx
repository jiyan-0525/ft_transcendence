import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Alert, Button, Card, Input } from '@/components/ui'
import { ApiError } from '@/lib/api'
import { validateEmail } from '@/lib/validation'
import { useAuthStore } from '@/stores/auth'

type LoginValues = {
  email: string
  password: string
}

type LoginErrors = Partial<Record<keyof LoginValues, string>>

const emptyValues: LoginValues = { email: '', password: '' }

/**
 * LoginPage — the sign-in form for /login.
 *
 * On success the store becomes authenticated and RequireGuest sends the user
 * back to the page they asked for, so this page does not navigate itself.
 */
export default function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const location = useLocation()
  const justRegistered = Boolean(
    (location.state as { registered?: boolean } | null)?.registered,
  )

  const [values, setValues] = useState<LoginValues>(emptyValues)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [oauthNotice, setOauthNotice] = useState(false)

  function handleChange(field: keyof LoginValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target

      setValues((current) => ({ ...current, [field]: value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
      setFormError(null)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: LoginErrors = {}
    const emailError = validateEmail(values.email)

    if (emailError) nextErrors.email = emailError
    // Login only needs a non-empty password: an existing account may predate
    // the current length rule, which belongs to registration.
    if (!values.password) nextErrors.password = 'Enter your password.'

    setErrors(nextErrors)
    setFormError(null)

    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await login({ email: values.email.trim(), password: values.password })
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full p-6 sm:p-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wider text-brand">
          Welcome back
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
          Log in
        </h1>
        <p className="mt-2 text-ink-muted">
          Pick up where you left off with your communities and friends.
        </p>
      </header>

      {justRegistered ? (
        <Alert tone="success" title="Account created" className="mt-6">
          You can log in now.
        </Alert>
      ) : null}

      {formError ? (
        <Alert tone="danger" title="Could not log in" className="mt-6">
          {formError}
        </Alert>
      ) : null}

      {oauthNotice ? (
        <Alert tone="info" title="OAuth not connected" className="mt-6">
          GitHub sign-in lands when the auth service is ready.
        </Alert>
      ) : null}

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
        aria-label="Log in"
      >
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange('email')}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange('password')}
          error={errors.password}
        />

        <Button type="submit" fullWidth loading={submitting}>
          Log in
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-ink-muted">
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
        or
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
      </div>

      <Button
        variant="secondary"
        fullWidth
        onClick={() => setOauthNotice(true)}
      >
        Continue with GitHub
      </Button>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New here?{' '}
        <Link
          to="/register"
          className="font-semibold text-brand-strong hover:underline"
        >
          Create an account
        </Link>
      </p>
    </Card>
  )
}
