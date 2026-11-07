import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <p className="bg-aurora bg-clip-text font-display text-6xl font-extrabold tracking-tight text-transparent">
        404
      </p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
        Page not found
      </h1>
      <p className="mt-4 text-lg text-ink-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-full bg-aurora px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </section>
  )
}
