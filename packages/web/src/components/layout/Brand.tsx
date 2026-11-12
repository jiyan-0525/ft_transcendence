import { Link } from 'react-router-dom'

/**
 * Gradient wordmark used by both the product shell and the auth layout.
 * The "SN" mark is decorative, so it is hidden from assistive technology.
 */
export default function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="grid h-9 w-9 place-items-center rounded-md bg-aurora font-display text-sm font-bold text-white shadow-soft"
      >
        SN
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-ink">
        Social Network
      </span>
    </Link>
  )
}
