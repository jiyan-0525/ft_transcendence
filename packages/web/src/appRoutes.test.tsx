import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from './appRoutes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
}

describe('routes', () => {
  it('renders the home feed at /', () => {
    renderAt('/')

    expect(
      screen.getByRole('heading', { name: /your community, in one place/i }),
    ).toBeInTheDocument()
  })

  it('renders the login page at /login', () => {
    renderAt('/login')

    expect(
      screen.getByRole('heading', { name: /^log in$/i }),
    ).toBeInTheDocument()
  })

  it('renders the registration page at /register', () => {
    renderAt('/register')

    expect(
      screen.getByRole('heading', { name: /^create account$/i }),
    ).toBeInTheDocument()
  })

  it('renders the design system page at /design', () => {
    renderAt('/design')

    expect(
      screen.getByRole('heading', { name: /aurora tokens/i }),
    ).toBeInTheDocument()
  })

  it('renders the 404 page for unknown paths', () => {
    renderAt('/missing')

    expect(
      screen.getByRole('heading', { name: /page not found/i }),
    ).toBeInTheDocument()
  })
})
