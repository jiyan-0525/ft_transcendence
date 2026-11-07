import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { resetMockAuth } from '@/lib/mock/auth'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/models'
import RequireAdmin from './RequireAdmin'
import RequireAuth from './RequireAuth'
import RequireGuest from './RequireGuest'

const member: User = {
  id: 1,
  email: 'ada@example.com',
  username: 'ada_lovelace',
  role: 'USER',
  isActive: true,
  createdAt: new Date(),
}

const admin: User = { ...member, id: 2, username: 'root', role: 'ADMIN' }

function renderRoutes(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/login"
          element={
            <RequireGuest>
              <p>Login page</p>
            </RequireGuest>
          }
        />
        <Route path="/" element={<p>Home page</p>} />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <p>Settings page</p>
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <p>Admin page</p>
            </RequireAdmin>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  resetMockAuth()
  useAuthStore.setState({ status: 'unknown', user: null })
})

describe('route guards', () => {
  it('sends a guest from a protected page to login', async () => {
    renderRoutes('/settings')

    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })

  it('lets a signed-in user open a protected page', async () => {
    useAuthStore.setState({ status: 'authenticated', user: member })

    renderRoutes('/settings')

    expect(screen.getByText('Settings page')).toBeInTheDocument()
  })

  it('sends a signed-in user away from the login page', () => {
    useAuthStore.setState({ status: 'authenticated', user: member })

    renderRoutes('/login')

    expect(screen.getByText('Home page')).toBeInTheDocument()
  })

  it('shows an access-denied message to a signed-in non-admin', () => {
    useAuthStore.setState({ status: 'authenticated', user: member })

    renderRoutes('/admin')

    expect(screen.getByText('Access denied')).toBeInTheDocument()
    expect(screen.queryByText('Admin page')).not.toBeInTheDocument()
  })

  it('lets an administrator open the admin page', () => {
    useAuthStore.setState({ status: 'authenticated', user: admin })

    renderRoutes('/admin')

    expect(screen.getByText('Admin page')).toBeInTheDocument()
  })
})
