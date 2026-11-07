import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

type NavItem = {
  to: string
  label: string
  end?: boolean
}

/**
 * Primary navigation. `end: true` on "/" stops the Home link from staying
 * highlighted on every route (React Router matches "/" as a prefix otherwise).
 */
const navigation: NavItem[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/design', label: 'Design' },
  { to: '/settings', label: 'Settings' },
]

const baseLink = 'rounded-sm px-3 py-2 text-sm font-medium transition-colors'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? `${baseLink} bg-surface-muted text-brand`
    : `${baseLink} text-ink-muted hover:text-ink`
}

function mobileNavLinkClass({ isActive }: { isActive: boolean }) {
  const base =
    'block rounded-sm px-3 py-2 text-base font-medium transition-colors'
  return isActive
    ? `${base} bg-surface-muted text-brand`
    : `${base} text-ink-muted hover:text-ink`
}

/**
 * AppShell — the outer frame every page renders inside.
 *
 * It is a *layout route*: React Router renders it once and swaps only the
 * <Outlet /> content as the user navigates, so the header/footer stay mounted.
 */
export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Close the menu after any navigation.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Escape closes the menu and puts focus back on the toggle.
  useEffect(() => {
    if (!menuOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* Keyboard/screen-reader users can jump straight past the header. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-surface"
      >
        Skip to content
      </a>

      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:h-16 sm:py-0">
          <NavLink
            to="/"
            end
            className="text-lg font-semibold tracking-tight text-brand"
          >
            Community
          </NavLink>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden sm:block">
            <ul className="flex items-center gap-1">
              {navigation.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={navLinkClass}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile toggle */}
          <button
            ref={menuButtonRef}
            type="button"
            className="inline-flex items-center rounded-sm border border-line px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:hidden"
            aria-expanded={menuOpen}
            aria-controls="primary-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">
              {menuOpen ? 'Close menu' : 'Open menu'}
            </span>
            <span aria-hidden="true">{menuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>

        {/* Mobile panel */}
        <div id="primary-menu" className={menuOpen ? 'block sm:hidden' : 'hidden'}>
          <nav aria-label="Primary mobile">
            <ul className="space-y-1 border-t border-line px-4 py-3">
              {navigation.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={mobileNavLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-ink-muted">
          ft_transcendence — Week 1 foundation
        </div>
      </footer>
    </div>
  )
}
