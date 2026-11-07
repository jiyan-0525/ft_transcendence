export default function FeedPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Hero */}
      <section className="rounded-lg bg-aurora p-6 text-white shadow-soft sm:p-8">
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
      </section>

      {/* Composer */}
      <section className="rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5">
        <label htmlFor="composer" className="sr-only">
          Write a post
        </label>
        <textarea
          id="composer"
          rows={3}
          placeholder="What's on your mind?"
          className="w-full resize-none bg-transparent text-ink placeholder:text-ink-muted focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-ink-muted">
            Photo upload lands with the feed API.
          </span>
          <button
            type="button"
            disabled
            className="rounded-full bg-aurora px-5 py-2 text-sm font-semibold text-white opacity-60"
          >
            Post
          </button>
        </div>
      </section>

      {/* Empty state */}
      <section className="rounded-lg border border-line bg-surface p-8 text-center shadow-card">
        <span
          aria-hidden="true"
          className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface-muted text-lg font-bold text-brand"
        >
          #
        </span>
        <p className="mt-4 font-display text-lg font-semibold text-ink">
          No posts yet
        </p>
        <p className="mt-1 text-ink-muted">
          When posts are implemented, the newest ones appear here.
        </p>
      </section>
    </div>
  )
}
