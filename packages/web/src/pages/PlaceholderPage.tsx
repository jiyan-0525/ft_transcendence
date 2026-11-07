import { Badge, Card } from '@/components/ui'

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
    <Card className="max-w-2xl p-6 sm:p-8">
      <Badge tone="brand">Planned</Badge>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">
        {title}
      </h1>
      <p className="mt-3 text-lg text-ink-muted">{description}</p>
    </Card>
  )
}
