import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { routes } from './appRoutes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
}

describe('routes', () => {
  it('renders the design system page at /design', () => {
    renderAt('/design')

    expect(
      screen.getByRole('heading', { name: /^tokens$/i }),
    ).toBeInTheDocument()
  })

  it('renders the 404 page for unknown paths', () => {
    renderAt('/missing')

    expect(
      screen.getByRole('heading', { name: /page not found/i }),
    ).toBeInTheDocument()
  })
})
