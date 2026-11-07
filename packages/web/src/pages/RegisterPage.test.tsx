import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'

function renderRegister() {
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  )
}

async function fillValidForm(password = 'correct horse battery') {
  await userEvent.type(screen.getByLabelText('Display name'), 'Ada Lovelace')
  await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com')
  await userEvent.type(screen.getByLabelText('Password'), password)
  await userEvent.type(
    screen.getByLabelText('Confirm password'),
    password,
  )
  await userEvent.click(screen.getByLabelText(/i agree to the community/i))
}

describe('RegisterPage', () => {
  it('renders the registration form', () => {
    renderRegister()

    expect(
      screen.getByRole('heading', { name: 'Create account' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Display name')).toBeInTheDocument()
  })

  it('requires a password of at least 12 characters', async () => {
    renderRegister()

    await userEvent.type(screen.getByLabelText('Password'), 'short')
    await userEvent.click(
      screen.getByRole('button', { name: 'Create account' }),
    )

    expect(
      screen.getByText('Use at least 12 characters.'),
    ).toBeInTheDocument()
  })

  it('rejects a mismatched password confirmation', async () => {
    renderRegister()

    await userEvent.type(screen.getByLabelText('Password'), 'correct horse battery')
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

  it('says the auth API is missing instead of faking a signup', async () => {
    renderRegister()

    await fillValidForm()
    await userEvent.click(
      screen.getByRole('button', { name: 'Create account' }),
    )

    expect(
      screen.getByText(/nothing was sent or saved/i),
    ).toBeInTheDocument()
  })
})
