import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from '@/components/ui'

export default function FeedPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero with decorative aurora waves */}
      <section className="relative overflow-hidden rounded-lg bg-aurora px-6 py-10 text-white shadow-soft sm:px-10 sm:py-14">
        <svg
          aria-hidden="true"
          viewBox="0 0 800 400"
          className="pointer-events-none absolute -right-24 -top-10 h-[150%] w-[70%] text-white/10"
          fill="none"
        >
          <path
            d="M0 300 C 150 200, 250 380, 400 260 S 650 120, 800 220 L 800 400 L 0 400 Z"
            fill="currentColor"
          />
          <path
            d="M0 340 C 180 260, 300 420, 460 300 S 700 200, 800 280 L 800 400 L 0 400 Z"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>

        <div className="relative max-w-xl">
          <p className="text-sm font-medium uppercase tracking-wider text-white/80">
            Home feed
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Your community, in one place.
          </h1>
          <p className="mt-3 max-w-lg text-white/90">
            Share a photo or a thought, catch up with friends and follow the
            communities you care about.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Composer */}
          <Card className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-aurora text-sm font-semibold text-white"
              >
                SN
              </span>
              <label htmlFor="composer" className="sr-only">
                Write a post
              </label>
              <textarea
                id="composer"
                rows={2}
                placeholder="Share something with your community..."
                className="min-h-11 w-full resize-none bg-transparent pt-2 text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <span className="text-sm text-ink-muted">
                Posting lands with the feed API.
              </span>
              <Button disabled>Post</Button>
            </div>
          </Card>

          <EmptyState
            title="No posts yet"
            description="When the content API is connected, the newest posts appear here."
            icon={<span className="text-lg font-bold">#</span>}
          />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Suggested for you</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm text-ink-muted">
                Community suggestions appear here once the communities API
                lands.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What’s trending</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-sm text-ink-muted">
                Trending topics appear here once search and content APIs land.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
