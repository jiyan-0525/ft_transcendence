import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Brand from './Brand'

type NavItem = {
  to: string
  label: string
  end?: boolean
  /** Hidden in the desktop header below `xl`, still present in the mobile menu. */
  desktopOnly?: boolean
}

/**
 * Primary channels from Social_Network.pdf §"Pages to build".
 * `/design` is a development page for the design-system module and is kept
 * out of the product navigation.
 */
const channels: NavItem[] = [
  { to: '/', label: 'Feed', end: true },
  { to: '/communities', label: 'Communities' },
  { to: '/blog', label: 'Blog' },
  { to: '/events', label: 'Events' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/messages', label: 'Messages' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/search', label: 'Search' },
]

const accountLinks: NavItem[] = [
  // Temporary entry points: there is no session store yet, so signed-out
  // pages must be reachable from the product header. Once auth state exists
  // these move to a signed-out header and the account links below move into
  // the avatar menu.
  { to: '/login', label: 'Log in' },
  { to: '/register', label: 'Create account' },
  { to: '/profile/me', label: 'Profile', desktopOnly: true },
  { to: '/settings', label: 'Settings', desktopOnly: true },
  { to: '/admin', label: 'Admin', desktopOnly: true },
]

const baseLink = 'rounded-full px-3 py-2 text-sm font-medium transition-colors'

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? `${baseLink} bg-brand text-white shadow-soft`
    : `${baseLink} text-ink-muted hover:bg-surface-muted hover:text-ink`
}

/** The signup entry point is the only call to action in the header. */
function ctaLinkClass() {
  return `${baseLink} bg-aurora text-white shadow-soft hover:opacity-90`
}

function mobileNavLinkClass({ isActive }: { isActive: boolean }) {
  const base =
    'block rounded-md px-3 py-2 text-base font-medium transition-colors'
  return isActive
    ? `${base} bg-brand text-white`
    : `${base} text-ink-muted hover:bg-surface-muted hover:text-ink`
}

function mobileCtaLinkClass() {
  return 'block rounded-md bg-aurora px-3 py-2 text-base font-semibold text-white'
}

/**
 * AppShell — the outer frame for the authenticated product area.
 * It is a layout route: React Router renders it once and swaps only the
 * <Outlet /> content, so the header and footer stay mounted.
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

      <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:h-16 sm:py-0">
          <Brand />

          {/* Desktop account links */}
          <nav aria-label="Account" className="hidden sm:block">
            <ul className="flex items-center gap-1">
              {accountLinks.map((item) => (
                <li
                  key={item.to}
                  className={item.desktopOnly ? 'hidden xl:block' : undefined}
                >
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={
                      item.to === '/register' ? ctaLinkClass : navLinkClass
                    }
                  >
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
            className="inline-flex items-center rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink sm:hidden"
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

        {/* Desktop channel navigation */}
        <nav aria-label="Primary" className="hidden border-t border-line sm:block">
          <ul className="mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5">
            {channels.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={navLinkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile panel */}
        <div
          id="primary-menu"
          className={menuOpen ? 'block bg-surface sm:hidden' : 'hidden'}
        >
          <nav aria-label="Primary mobile">
            <ul className="space-y-1 border-t border-line px-4 py-3">
              {channels.map((item) => (
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

          <nav aria-label="Account mobile">
            <ul className="space-y-1 border-t border-line px-4 py-3">
              {accountLinks.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={
                      item.to === '/register'
                        ? mobileCtaLinkClass
                        : mobileNavLinkClass
                    }
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

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
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
