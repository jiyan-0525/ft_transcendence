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
    usage: 'Primary actions',
  },
  {
    name: 'brand-strong',
    className: 'bg-brand-strong',
    variable: '--color-brand-strong',
    usage: 'Hover and pressed actions',
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
          Tokens
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          The single source of truth for color, shape and type. Each sample is
          rendered with the real utility, so this page cannot drift from the
          app.
        </p>
      </header>

      <section aria-labelledby="colors" className="mt-12">
        <h2 id="colors" className="text-2xl font-semibold text-ink">
          Color
        </h2>
        <p className="mt-1 text-ink-muted">
          Components use these semantic names — never a palette name such as
          <code className="mx-1 rounded-sm bg-surface-muted px-1">slate-900</code>
          directly.
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colorTokens.map((token) => (
            <li
              key={token.name}
              className="rounded-lg border border-line bg-surface p-4"
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
              className="rounded-lg border border-line bg-surface p-4"
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

      <section aria-labelledby="type" className="mt-12">
        <h2 id="type" className="text-2xl font-semibold text-ink">
          Type scale
        </h2>
        <p className="mt-1 text-ink-muted">
          Headings, body copy and captions in one ladder.
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
