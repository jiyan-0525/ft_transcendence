import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-brand">
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
        className="mt-8 inline-flex rounded bg-brand px-4 py-2 text-sm font-medium text-surface transition-colors hover:bg-brand-strong"
      >
        Back to home
      </Link>
    </section>
  )
}
