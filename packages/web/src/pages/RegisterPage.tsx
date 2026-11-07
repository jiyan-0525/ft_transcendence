import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Input } from '@/components/ui'
import {
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validatePassword,
} from '@/lib/validation'

type RegisterValues = {
  displayName: string
  email: string
  password: string
  confirmPassword: string
  accepted: boolean
}

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>

const emptyValues: RegisterValues = {
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  accepted: false,
}

/**
 * RegisterPage — client-side form for /register.
 *
 * Mirrors the rules the server will enforce: a display name, a valid email,
 * a password of at least 12 characters, a matching confirmation, and explicit
 * consent. Nothing is sent yet, so a valid submit says so instead of faking
 * success.
 */
export default function RegisterPage() {
  const [values, setValues] = useState<RegisterValues>(emptyValues)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [submitted, setSubmitted] = useState(false)

  function handleChange(field: Exclude<keyof RegisterValues, 'accepted'>) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target

      setValues((current) => ({ ...current, [field]: value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
      setSubmitted(false)
    }
  }

  function handleConsent(event: ChangeEvent<HTMLInputElement>) {
    const { checked } = event.target

    setValues((current) => ({ ...current, accepted: checked }))
    setErrors((current) => ({ ...current, accepted: undefined }))
    setSubmitted(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: RegisterErrors = {}
    const name = values.displayName.trim()

    if (!name) {
      nextErrors.displayName = 'Enter a display name.'
    } else if (name.length < 2) {
      nextErrors.displayName = 'Use at least 2 characters.'
    }

    const emailError = validateEmail(values.email)
    if (emailError) nextErrors.email = emailError

    const passwordError = validatePassword(values.password)
    if (passwordError) nextErrors.password = passwordError

    if (!values.confirmPassword) {
      nextErrors.confirmPassword = 'Repeat your password.'
    } else if (values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (!values.accepted) {
      nextErrors.accepted = 'Accept the community guidelines to continue.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false)
      return
    }

    setSubmitted(true)
  }

  return (
    <Card className="w-full p-6 sm:p-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wider text-brand">
          Join the network
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
          Create account
        </h1>
        <p className="mt-2 text-ink-muted">
          Share posts, follow communities and keep in touch with friends.
        </p>
      </header>

      {submitted ? (
        <Alert tone="info" title="Auth API not connected" className="mt-6">
          Your details passed validation, but the backend is not running yet —
          nothing was sent or saved.
        </Alert>
      ) : null}

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
        aria-label="Create account"
      >
        <Input
          label="Display name"
          name="displayName"
          autoComplete="nickname"
          placeholder="How friends will see you"
          value={values.displayName}
          onChange={handleChange('displayName')}
          error={errors.displayName}
        />

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
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange('password')}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          error={errors.password}
        />

        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
        />

        <div>
          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="accepted"
              checked={values.accepted}
              onChange={handleConsent}
              aria-invalid={errors.accepted ? true : undefined}
              aria-describedby={errors.accepted ? 'terms-error' : undefined}
              className="mt-0.5 h-4 w-4 rounded border-line accent-brand"
            />
            <span>I agree to the community guidelines and terms of service.</span>
          </label>

          {errors.accepted ? (
            <p
              id="terms-error"
              role="alert"
              className="mt-1 text-sm font-medium text-danger"
            >
              {errors.accepted}
            </p>
          ) : null}
        </div>

        <Button type="submit" fullWidth>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-brand-strong hover:underline"
        >
          Log in
        </Link>
      </p>
    </Card>
  )
}
