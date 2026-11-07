type PlaceholderPageProps = {
  title: string
  description: string
}

/**
 * Temporary page for routes that exist in the information architecture but
 * whose feature is not implemented yet. Keeping the route real now means the
 * navigation, guards and tests do not have to change when the feature lands.
 */
export default function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <section className="max-w-2xl rounded-lg border border-line bg-surface p-6 shadow-card sm:p-8">
      <span className="inline-flex rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
        Planned
      </span>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-3 text-lg text-ink-muted">{description}</p>
    </section>
  )
}
