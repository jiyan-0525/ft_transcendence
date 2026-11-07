type Post = {
  id: string
  author: string
  handle: string
  time: string
  initials: string
  avatarClass: string
  body: string
  mediaClass: string
  likes: number
  comments: number
}

const posts: Post[] = [
  {
    id: 'p1',
    author: 'Ethan Brooks',
    handle: '@ethan',
    time: '2h',
    initials: 'EB',
    avatarClass: 'bg-brand',
    body: 'Just wrapped up an amazing hike at Lake Serenity. The view was unreal — grateful for moments like these.',
    mediaClass: 'bg-gradient-to-br from-brand via-accent to-warning',
    likes: 128,
    comments: 24,
  },
  {
    id: 'p2',
    author: 'Sophia Ramirez',
    handle: '@sophia',
    time: '4h',
    initials: 'SR',
    avatarClass: 'bg-brand-strong',
    body: 'Excited to join our community clean-up day this Saturday! Let’s come together and make a difference.',
    mediaClass: 'bg-gradient-to-br from-mint via-brand to-accent',
    likes: 96,
    comments: 18,
  },
]

const suggestions = [
  {
    name: 'Photography Lovers',
    members: '8.2K members',
    initials: 'PL',
    className: 'bg-brand',
  },
  {
    name: 'Hiking Hearts',
    members: '5.7K members',
    initials: 'HH',
    className: 'bg-brand-strong',
  },
  {
    name: 'Sustainable Living',
    members: '12.4K members',
    initials: 'SL',
    className: 'bg-ink',
  },
]

const trends = [
  { tag: '#CommunityCleanUpDay', posts: '2,140 posts' },
  { tag: '#SunsetPhotography', posts: '1,890 posts' },
  { tag: '#LocalFarmersMarket', posts: '985 posts' },
]

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.6 1.1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.7-.8L3 21l1.9-5.3A8.4 8.4 0 1 1 21 11.5Z" />
    </svg>
  )
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <span
          aria-hidden="true"
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${post.avatarClass}`}
        >
          {post.initials}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <p className="font-semibold text-ink">{post.author}</p>
            <p className="text-sm text-ink-muted">
              {post.handle} · {post.time}
            </p>
          </div>
          <p className="mt-2 text-ink">{post.body}</p>
        </div>

        <button
          type="button"
          aria-label={`More options for ${post.author}`}
          className="rounded-full px-2 py-1 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <span aria-hidden="true">⋯</span>
        </button>
      </div>

      <div aria-hidden="true" className={`h-56 w-full sm:h-64 ${post.mediaClass}`} />

      <div className="flex items-center gap-6 border-t border-line px-4 py-3 text-sm text-ink-muted sm:px-5">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-accent"
        >
          <HeartIcon />
          <span>{post.likes}</span>
          <span className="sr-only"> likes</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-brand"
        >
          <CommentIcon />
          <span>{post.comments}</span>
          <span className="sr-only"> comments</span>
        </button>
      </div>
    </article>
  )
}

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
          <section className="rounded-lg border border-line bg-surface p-4 shadow-card sm:p-5">
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
                Preview data — posting is not wired yet.
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

          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
            <h2 className="font-display text-base font-semibold text-ink">
              Suggested for you
            </h2>
            <ul className="mt-4 space-y-4">
              {suggestions.map((item) => (
                <li key={item.name} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${item.className}`}
                  >
                    {item.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{item.name}</p>
                    <p className="text-sm text-ink-muted">{item.members}</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-brand px-3 py-1 text-sm font-semibold text-brand transition-colors hover:bg-surface-muted"
                  >
                    Join
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-4 text-sm font-semibold text-brand hover:underline"
            >
              See all communities
            </button>
          </section>

          <section className="rounded-lg border border-line bg-surface p-5 shadow-card">
            <h2 className="font-display text-base font-semibold text-ink">
              What’s trending
            </h2>
            <ul className="mt-4 space-y-3">
              {trends.map((trend) => (
                <li key={trend.tag}>
                  <button
                    type="button"
                    className="w-full rounded-md px-2 py-2 text-left transition-colors hover:bg-surface-muted"
                  >
                    <p className="font-medium text-ink">{trend.tag}</p>
                    <p className="text-sm text-ink-muted">{trend.posts}</p>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
