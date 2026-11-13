import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { register as mockRegister, resetMockAuth } from '@/lib/mock/auth'
import { useAuthStore } from '@/stores/auth'
import LoginPage from './LoginPage'

const account = {
  email: 'ada@example.com',
  username: 'ada_lovelace',
  password: 'Example1!',
}

function renderLogin() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  resetMockAuth()
  useAuthStore.setState({ status: 'guest', user: null })
})

describe('LoginPage', () => {
  it('renders the email and password fields', () => {
    renderLogin()

    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('rejects an empty submit without contacting the server', async () => {
    renderLogin()

    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('guest')
  })

  it('rejects an invalid email', async () => {
    renderLogin()

    await userEvent.type(screen.getByLabelText('Email'), 'ada@')
    await userEvent.type(screen.getByLabelText('Password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
  })

  it('signs the user in with valid credentials', async () => {
    await mockRegister(account)
    renderLogin()

    await userEvent.type(screen.getByLabelText('Email'), account.email)
    await userEvent.type(screen.getByLabelText('Password'), account.password)
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() =>
      expect(useAuthStore.getState().status).toBe('authenticated'),
    )
    expect(useAuthStore.getState().user?.username).toBe('ada_lovelace')
  })

  it('shows the server error for a wrong password', async () => {
    await mockRegister(account)
    renderLogin()

    await userEvent.type(screen.getByLabelText('Email'), account.email)
    await userEvent.type(screen.getByLabelText('Password'), 'wrong password here')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(
      await screen.findByText('Invalid email or password.'),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('guest')
  })

  it('explains that OAuth is not connected yet', async () => {
    renderLogin()

    await userEvent.click(
      screen.getByRole('button', { name: /continue with github/i }),
    )

    expect(screen.getByText(/github sign-in lands/i)).toBeInTheDocument()
  })
})
