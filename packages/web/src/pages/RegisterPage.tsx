import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Input } from '@/components/ui'
import { ApiError } from '@/lib/api'
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/lib/validation'
import { useAuthStore } from '@/stores/auth'
import type { RegisterRequest } from '@/types/api'

type RegisterValues = RegisterRequest & {
  confirmPassword: string
  accepted: boolean
}

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>

const emptyValues: RegisterValues = {
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  accepted: false,
}

/**
 * RegisterPage — the sign-up form for /register.
 *
 * Fields match RegisterRequest exactly. The confirmation and consent fields
 * are UI-only and never sent. A successful registration does not sign the
 * user in: they are sent to /login with a notice (protocol D10).
 */
export default function RegisterPage() {
  const register = useAuthStore((state) => state.register)
  const navigate = useNavigate()

  const [values, setValues] = useState<RegisterValues>(emptyValues)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(
    field: Exclude<keyof RegisterValues, 'accepted'>,
  ) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target

      setValues((current) => ({ ...current, [field]: value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
      setFormError(null)
    }
  }

  function handleConsent(event: ChangeEvent<HTMLInputElement>) {
    const { checked } = event.target

    setValues((current) => ({ ...current, accepted: checked }))
    setErrors((current) => ({ ...current, accepted: undefined }))
    setFormError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: RegisterErrors = {}

    const emailError = validateEmail(values.email)
    if (emailError) nextErrors.email = emailError

    const usernameError = validateUsername(values.username)
    if (usernameError) nextErrors.username = usernameError

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
    setFormError(null)

    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await register({
        email: values.email.trim(),
        username: values.username.trim(),
        password: values.password,
      })
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (error) {
      if (error instanceof ApiError && error.code === 'CONFLICT') {
        // Show the conflict next to the field it refers to, when we can tell.
        const field = /email/i.test(error.message)
          ? 'email'
          : /username/i.test(error.message)
            ? 'username'
            : undefined

        if (field) {
          setErrors((current) => ({ ...current, [field]: error.message }))
        } else {
          setFormError(error.message)
        }
      } else {
        setFormError(
          error instanceof ApiError
            ? error.message
            : 'Something went wrong. Please try again.',
        )
      }
    } finally {
      setSubmitting(false)
    }
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

      {formError ? (
        <Alert tone="danger" title="Could not create the account" className="mt-6">
          {formError}
        </Alert>
      ) : null}

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-6 space-y-4"
        aria-label="Create account"
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
          label="Username"
          name="username"
          autoComplete="username"
          placeholder="letters, numbers, _"
          value={values.username}
          onChange={handleChange('username')}
          hint="3–50 characters: letters, numbers and underscores."
          error={errors.username}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange('password')}
          hint="Use 8–128 characters with uppercase, lowercase, a number and a special character."
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

        <Button type="submit" fullWidth loading={submitting}>
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
