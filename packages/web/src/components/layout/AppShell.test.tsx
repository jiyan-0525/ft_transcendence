import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from '../../appRoutes'

function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
}

describe('AppShell auth entry points', () => {
  it('links to login and registration from the header', () => {
    renderApp()

    const loginHrefs = screen
      .getAllByRole('link', { name: 'Log in' })
      .map((link) => link.getAttribute('href'))
    const registerHrefs = screen
      .getAllByRole('link', { name: 'Create account' })
      .map((link) => link.getAttribute('href'))

    expect(loginHrefs).toContain('/login')
    expect(registerHrefs).toContain('/register')
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
