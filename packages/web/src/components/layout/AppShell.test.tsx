import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from '../../appRoutes'
import { useAuthStore } from '../../stores/auth'
import type { User } from '../../types/models'

function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
}

const member: User = {
  id: 1,
  email: 'ada@example.com',
  username: 'ada_lovelace',
  role: 'USER',
  isActive: true,
  createdAt: new Date(),
}

beforeEach(() => {
  useAuthStore.setState({ status: 'guest', user: null })
})

describe('AppShell auth entry points', () => {
  it('links to login and registration when signed out', () => {
    renderApp()

    const loginHrefs = screen
      .getAllByRole('link', { name: 'Log in' })
      .map((link) => link.getAttribute('href'))
    const registerHrefs = screen
      .getAllByRole('link', { name: 'Create account' })
      .map((link) => link.getAttribute('href'))

    expect(loginHrefs).toContain('/login')
    expect(registerHrefs).toContain('/register')
    expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull()
  })

  it('shows an account menu with the username when signed in', () => {
    useAuthStore.setState({ status: 'authenticated', user: member })

    renderApp()

    expect(
      screen.getByRole('button', { name: 'Account menu for @ada_lovelace' }),
    ).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryAllByRole('link', { name: 'Log in' }),
    ).toHaveLength(0)
  })

  it('lists the account actions inside the menu', async () => {
    const user = userEvent.setup()
    useAuthStore.setState({ status: 'authenticated', user: member })
    renderApp()

    await user.click(
      screen.getByRole('button', { name: 'Account menu for @ada_lovelace' }),
    )

    const menu = screen.getByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument()
    expect(within(menu).queryByRole('menuitem', { name: 'Admin' })).toBeNull()
  })

  it('signs out from the account menu and returns to the login page', async () => {
    const user = userEvent.setup()
    useAuthStore.setState({ status: 'authenticated', user: member })
    renderApp()

    await user.click(
      screen.getByRole('button', { name: 'Account menu for @ada_lovelace' }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }))

    expect(
      await screen.findByRole('heading', { name: /^log in$/i }),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().status).toBe('guest')
  })
})

describe('AppShell mobile navigation', () => {
  it('opens the menu with the toggle button', async () => {
    const user = userEvent.setup()
    renderApp()

    const toggle = screen.getByRole('button', { name: /open menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes on Escape and restores focus to the toggle', async () => {
    const user = userEvent.setup()
    renderApp()

    const toggle = screen.getByRole('button', { name: /open menu/i })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard('{Escape}')

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })
})
