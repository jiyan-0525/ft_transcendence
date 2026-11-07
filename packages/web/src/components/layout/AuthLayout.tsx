import { Link, Outlet } from 'react-router-dom'

/**
 * Layout for signed-out pages (login, register). It deliberately has no
 * channel navigation: the product area is not reachable until signed in.
 */
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-brand"
          >
            Social Network
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 items-start justify-center px-4 py-16">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-sm text-ink-muted">
          Social Network — ft_transcendence
        </div>
      </footer>
    </div>
  )
}
