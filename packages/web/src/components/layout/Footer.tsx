import { Link } from 'react-router-dom'

/** Shared footer for both layouts; exposes the legal pages from every screen. */
export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Social Network — ft_transcendence</p>
        <ul className="flex items-center gap-4">
          <li>
            <Link className="hover:text-ink" to="/legal/privacy">
              Privacy
            </Link>
          </li>
          <li>
            <Link className="hover:text-ink" to="/legal/terms">
              Terms
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  )
}
