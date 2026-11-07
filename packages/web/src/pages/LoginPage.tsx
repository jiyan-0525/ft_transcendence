import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Input } from '@/components/ui'
import { validateEmail } from '@/lib/validation'

type LoginValues = {
  email: string
  password: string
}

type LoginErrors = Partial<Record<keyof LoginValues, string>>

type Status = 'api-missing' | 'oauth-missing' | null

const emptyValues: LoginValues = { email: '', password: '' }

/**
 * LoginPage — client-side form for /login.
 *
 * The auth API does not exist yet, so a valid submit does not pretend to sign
 * anyone in. It shows an explicit "not connected" message instead. Validation
 * runs on submit and clears per field as the user types.
 */
export default function LoginPage() {
  const [values, setValues] = useState<LoginValues>(emptyValues)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [status, setStatus] = useState<Status>(null)

  function handleChange(field: keyof LoginValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target

      setValues((current) => ({ ...current, [field]: value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
      setStatus(null)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: LoginErrors = {}
    const emailError = validateEmail(values.email)

    if (emailError) nextErrors.email = emailError
    // Login only needs a non-empty password: an existing account may predate
    // the current length rule, which belongs to registration.
    if (!values.password) nextErrors.password = 'Enter your password.'

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setStatus(null)
      return
    }

    setStatus('api-missing')
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

      {status === 'api-missing' ? (
        <Alert tone="info" title="Auth API not connected" className="mt-6">
          The backend is not running yet, so these credentials were not sent
          anywhere.
        </Alert>
      ) : null}

      {status === 'oauth-missing' ? (
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

        <Button type="submit" fullWidth>
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
        onClick={() => setStatus('oauth-missing')}
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
