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
    <section className="max-w-2xl">
      <p className="text-sm font-medium uppercase tracking-wider text-brand">
        Planned
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-3 text-lg text-ink-muted">{description}</p>
    </section>
  )
}
