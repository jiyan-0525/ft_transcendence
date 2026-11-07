import type { RouteObject } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import DesignSystemPage from './pages/DesignSystemPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import RequireAuth from './routes/RequireAuth'

/**
 * Route table, kept separate from the browser router so tests can mount it
 * with createMemoryRouter instead of touching window.history.
 *
 * `/` is a layout route: AppShell renders once and its <Outlet /> receives
 * whichever child matches the current URL.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'design', element: <DesignSystemPage /> },
      {
        path: 'settings',
        element: (
          <RequireAuth>
            <section className="max-w-2xl">
              <h1 className="text-2xl font-semibold text-ink">Settings</h1>
              <p className="mt-2 text-ink-muted">
                Account settings land once authentication is implemented.
              </p>
            </section>
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
