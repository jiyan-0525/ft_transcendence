import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { register as mockRegister, resetMockAuth } from '@/lib/mock/auth'
import { useAuthStore } from '@/stores/auth'
import RegisterPage from './RegisterPage'

function renderRegister() {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function fillValidForm(
  { email = 'ada@example.com', username = 'ada_lovelace' } = {},
  password = 'correct horse battery',
) {
  await userEvent.type(screen.getByLabelText('Email'), email)
  await userEvent.type(screen.getByLabelText('Username'), username)
  await userEvent.type(screen.getByLabelText('Password'), password)
  await userEvent.type(screen.getByLabelText('Confirm password'), password)
  await userEvent.click(screen.getByLabelText(/i agree to the community/i))
}

beforeEach(() => {
  resetMockAuth()
  useAuthStore.setState({ status: 'guest', user: null })
})

describe('RegisterPage', () => {
  it('renders the registration form with the server fields', () => {
    renderRegister()

    expect(
      screen.getByRole('heading', { name: 'Create account' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.queryByLabelText('Display name')).not.toBeInTheDocument()
  })

  it('requires a password of at least 15 characters', async () => {
    renderRegister()

    await userEvent.type(screen.getByLabelText('Password'), 'fourteenchars1')
    await userEvent.click(
      screen.getByRole('button', { name: 'Create account' }),
    )

    expect(screen.getByText('Use at least 15 characters.')).toBeInTheDocument()
  })

  it('rejects usernames with characters the server does not allow', async () => {
    renderRegister()

    await userEvent.type(screen.getByLabelText('Username'), 'ada lovelace!')
    await userEvent.click(
      screen.getByRole('button', { name: 'Create account' }),
    )

    expect(
      screen.getByText('Use only letters, numbers and underscores.'),
    ).toBeInTheDocument()
  })

  it('rejects a mismatched password confirmation', async () => {
    renderRegister()

    await userEvent.type(
      screen.getByLabelText('Password'),
      'correct horse battery',
    )
    await userEvent.type(
      screen.getByLabelText('Confirm password'),
      'correct horse batteru',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Create account' }),
    )

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
  })

  it('requires consent to the guidelines', async () => {
    renderRegister()

    await fillValidForm()
    await userEvent.click(screen.getByLabelText(/i agree to the community/i))
    await userEvent.click(
      screen.getByRole('button', { name: 'Create account' }),
    )

    expect(
      screen.getByText('Accept the community guidelines to continue.'),
    ).toBeInTheDocument()
  })

  it('creates the account and sends the user to login without signing in', async () => {
    renderRegister()

    await fillValidForm({}, 'fifteenchars123')
    await userEvent.click(
      screen.getByRole('button', { name: 'Create account' }),
    )

    expect(await screen.findByText('Login page')).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('guest')
  })

  it('shows a taken email next to the email field', async () => {
    await mockRegister({
      email: 'ada@example.com',
      username: 'someone_else',
      password: 'correct horse battery',
    })
    renderRegister()

    await fillValidForm({ username: 'ada_lovelace' })
    await userEvent.click(
      screen.getByRole('button', { name: 'Create account' }),
    )

    expect(
      await screen.findByText('This email is already registered.'),
    ).toBeInTheDocument()
  })
})
