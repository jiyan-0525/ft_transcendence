import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { resetMockAuth } from './lib/mock/auth'
import { routes } from './appRoutes'
import { useAuthStore } from './stores/auth'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
}

beforeEach(() => {
  resetMockAuth()
  useAuthStore.setState({ status: 'unknown', user: null })
})

describe('routes', () => {
  it('renders the home feed at /', () => {
    renderAt('/')

    expect(
      screen.getByRole('heading', { name: /your community, in one place/i }),
    ).toBeInTheDocument()
  })

  it('renders the login page at /login for a guest', async () => {
    renderAt('/login')

    expect(
      await screen.findByRole('heading', { name: /^log in$/i }),
    ).toBeInTheDocument()
  })

  it('renders the registration page at /register for a guest', async () => {
    renderAt('/register')

    expect(
      await screen.findByRole('heading', { name: /^create account$/i }),
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

  it('sets the document title per route', () => {
    renderAt('/design')

    expect(document.title).toBe('Design system · Social Network')
  })

  it('sets the 404 title for unknown paths', () => {
    renderAt('/missing')

    expect(document.title).toBe('Page not found · Social Network')
  })

  it('links to the legal pages from the footer', () => {
    renderAt('/')

    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute(
      'href',
      '/legal/privacy',
    )
    expect(screen.getByRole('link', { name: 'Terms' })).toHaveAttribute(
      'href',
      '/legal/terms',
    )
  })
})
