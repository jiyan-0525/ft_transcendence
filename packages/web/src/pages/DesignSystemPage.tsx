import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Spinner,
  Textarea,
} from '@/components/ui'

type ColorToken = {
  name: string
  className: string
  variable: string
  usage: string
}

/**
 * /design — the living style guide for A1.
 *
 * Every swatch below is painted with the real Tailwind utility, so if a token
 * changes in `style.css` this page changes with it. That makes it honest
 * documentation instead of a screenshot that drifts out of date.
 */

const colorTokens: ColorToken[] = [
  {
    name: 'canvas',
    className: 'bg-canvas',
    variable: '--color-canvas',
    usage: 'Page background',
  },
  {
    name: 'surface',
    className: 'bg-surface',
    variable: '--color-surface',
    usage: 'Cards, header and footer',
  },
  {
    name: 'surface-muted',
    className: 'bg-surface-muted',
    variable: '--color-surface-muted',
    usage: 'Subtle fills and hover rows',
  },
  {
    name: 'line',
    className: 'bg-line',
    variable: '--color-line',
    usage: 'Borders and dividers',
  },
  {
    name: 'ink',
    className: 'bg-ink',
    variable: '--color-ink',
    usage: 'Primary text',
  },
  {
    name: 'ink-muted',
    className: 'bg-ink-muted',
    variable: '--color-ink-muted',
    usage: 'Secondary text',
  },
  {
    name: 'brand',
    className: 'bg-brand',
    variable: '--color-brand',
    usage: 'Primary actions and links',
  },
  {
    name: 'brand-strong',
    className: 'bg-brand-strong',
    variable: '--color-brand-strong',
    usage: 'Hover and pressed actions',
  },
  {
    name: 'accent',
    className: 'bg-accent',
    variable: '--color-accent',
    usage: 'Likes, mentions, highlights',
  },
  {
    name: 'mint',
    className: 'bg-mint',
    variable: '--color-accent-2',
    usage: 'Online status and success accents',
  },
  {
    name: 'success',
    className: 'bg-success',
    variable: '--color-success',
    usage: 'Success states',
  },
  {
    name: 'warning',
    className: 'bg-warning',
    variable: '--color-warning',
    usage: 'Warnings',
  },
  {
    name: 'danger',
    className: 'bg-danger',
    variable: '--color-danger',
    usage: 'Errors and destructive actions',
  },
]

const radiusTokens = [
  { name: 'rounded-sm', className: 'rounded-sm', variable: '--radius-sm' },
  { name: 'rounded', className: 'rounded', variable: '--radius-md' },
  { name: 'rounded-md', className: 'rounded-md', variable: '--radius-md' },
  { name: 'rounded-lg', className: 'rounded-lg', variable: '--radius-lg' },
]

const elevationTokens = [
  { name: 'shadow-soft', className: 'shadow-soft', variable: '--shadow-soft' },
  { name: 'shadow-card', className: 'shadow-card', variable: '--shadow-card' },
]

const typeScale = [
  { name: 'text-xs', className: 'text-xs' },
  { name: 'text-sm', className: 'text-sm' },
  { name: 'text-base', className: 'text-base' },
  { name: 'text-lg', className: 'text-lg' },
  { name: 'text-2xl', className: 'text-2xl' },
  { name: 'text-4xl', className: 'text-4xl' },
]

export default function DesignSystemPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <header className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-wider text-brand">
          Design system
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
          Aurora tokens
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          The single source of truth for color, shape, elevation and type. Each
          sample is rendered with the real utility, so this page cannot drift
          from the app.
        </p>
      </header>

      <section aria-labelledby="colors" className="mt-12">
        <h2 id="colors" className="text-2xl font-semibold text-ink">
          Color
        </h2>
        <p className="mt-1 text-ink-muted">
          Components use these semantic names — never a palette name such as
          <code className="mx-1 rounded-sm bg-surface-muted px-1">purple-600</code>
          directly.
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colorTokens.map((token) => (
            <li
              key={token.name}
              className="rounded-lg border border-line bg-surface p-4 shadow-card"
            >
              <div
                className={`h-12 w-full rounded border border-line ${token.className}`}
              />
              <p className="mt-3 font-medium text-ink">{token.name}</p>
              <p className="text-sm text-ink-muted">{token.usage}</p>
              <code className="mt-2 block break-all text-xs text-ink-muted">
                var({token.variable})
              </code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="gradient" className="mt-12">
        <h2 id="gradient" className="text-2xl font-semibold text-ink">
          Gradient
        </h2>
        <p className="mt-1 text-ink-muted">
          Reserved for the wordmark, hero panels and primary calls to action.
        </p>
        <div className="mt-6 flex min-h-24 items-end rounded-lg bg-aurora p-5 shadow-soft">
          <code className="text-sm text-white/90">
            background-image: var(--gradient-brand)
          </code>
        </div>
      </section>

      <section aria-labelledby="components" className="mt-12">
        <h2 id="components" className="text-2xl font-semibold text-ink">
          Components
        </h2>
        <p className="mt-1 text-ink-muted">
          Reusable primitives built on the tokens above. Pages compose these
          instead of restyling raw HTML, so a change here reaches every screen.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="font-display text-base font-semibold text-ink">
              Button
            </h3>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-base font-semibold text-ink">
              Badge
            </h3>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(
                [
                  'neutral',
                  'brand',
                  'accent',
                  'mint',
                  'success',
                  'warning',
                  'danger',
                ] as const
              ).map((tone) => (
                <Badge key={tone} tone={tone}>
                  {tone}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-base font-semibold text-ink">
              Form fields
            </h3>
            <div className="mt-4 space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                hint="We never share your email."
              />
              <Input
                label="Password"
                type="password"
                error="Use at least 12 characters."
              />
              <Textarea
                label="Bio"
                placeholder="Tell people about yourself"
              />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-base font-semibold text-ink">
              Feedback
            </h3>
            <div className="mt-4 space-y-3">
              <Alert tone="info" title="Heads up">
                Scheduled maintenance on Sunday at 02:00 UTC.
              </Alert>
              <Alert tone="success" title="Saved">
                Your profile changes are live.
              </Alert>
              <Alert tone="warning" title="Slow connection">
                Some images may load late.
              </Alert>
              <Alert tone="danger" title="Could not save">
                Check your connection and try again.
              </Alert>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-6 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" /> Small
              </span>
              <span className="inline-flex items-center gap-2">
                <Spinner size="md" /> Medium
              </span>
              <span className="inline-flex items-center gap-2">
                <Spinner size="lg" /> Large
              </span>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Card</CardTitle>
              <CardDescription>
                Header, content and footer parts share one border and shadow.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm text-ink-muted">
                Cards add no padding on their own, so a plain
                <code className="mx-1 rounded-sm bg-surface-muted px-1">
                  Card className=&quot;p-5&quot;
                </code>
                works for simple content. Use the compound parts when a card
                needs a title and an action row.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Primary action</Button>
              <Button size="sm" variant="secondary">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section aria-labelledby="radius" className="mt-12">
        <h2 id="radius" className="text-2xl font-semibold text-ink">
          Radius
        </h2>
        <p className="mt-1 text-ink-muted">
          One shape language for cards, inputs and buttons.
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {radiusTokens.map((token) => (
            <li
              key={token.name}
              className="rounded-lg border border-line bg-surface p-4 shadow-card"
            >
              <div
                className={`h-16 w-full border border-line bg-surface-muted ${token.className}`}
              />
              <p className="mt-3 font-medium text-ink">{token.name}</p>
              <code className="text-xs text-ink-muted">
                var({token.variable})
              </code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="elevation" className="mt-12">
        <h2 id="elevation" className="text-2xl font-semibold text-ink">
          Elevation
        </h2>
        <p className="mt-1 text-ink-muted">
          Soft violet glow for interactive surfaces, neutral shadow for cards.
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {elevationTokens.map((token) => (
            <li
              key={token.name}
              className="rounded-lg border border-line bg-surface p-4"
            >
              <div
                className={`h-24 w-full rounded bg-surface-muted ${token.className}`}
              />
              <p className="mt-3 font-medium text-ink">{token.name}</p>
              <code className="text-xs text-ink-muted">
                var({token.variable})
              </code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="type" className="mt-12">
        <h2 id="type" className="text-2xl font-semibold text-ink">
          Type scale
        </h2>
        <p className="mt-1 text-ink-muted">
          Plus Jakarta Sans for headings, Inter for body copy.
        </p>

        <ul className="mt-6 divide-y divide-line">
          {typeScale.map((token) => (
            <li
              key={token.name}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <code className="w-24 shrink-0 text-sm text-ink-muted">
                {token.name}
              </code>
              <span className={`${token.className} text-ink`}>
                {token.name} — The quick brown fox
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
