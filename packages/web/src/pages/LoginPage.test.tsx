import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

function renderLogin() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('renders the email and password fields', () => {
    renderLogin()

    expect(
      screen.getByRole('heading', { name: 'Log in' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('rejects an empty submit without contacting anything', async () => {
    renderLogin()

    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(screen.getByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(
      screen.queryByText(/auth api not connected/i),
    ).not.toBeInTheDocument()
  })

  it('rejects an invalid email', async () => {
    renderLogin()

    await userEvent.type(screen.getByLabelText('Email'), 'ada@')
    await userEvent.type(screen.getByLabelText('Password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
  })

  it('says the auth API is missing instead of faking a login', async () => {
    renderLogin()

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(
      screen.getByText(/credentials were not sent anywhere/i),
    ).toBeInTheDocument()
  })

  it('explains that OAuth is not connected yet', async () => {
    renderLogin()

    await userEvent.click(
      screen.getByRole('button', { name: /continue with github/i }),
    )

    expect(
      screen.getByText(/github sign-in lands/i),
    ).toBeInTheDocument()
  })
})
