import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '@/lib/api'
import { useMocks } from '@/lib/auth'
import { useAuthStatus } from '@/stores/auth'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from '@/components/ui'

type Post = {
  id: number
  author_username: string
  body: string
}

export default function FeedPage() {
  const status = useAuthStatus()
  const canPost = status === 'authenticated' && !useMocks
  const [posts, setPosts] = useState<Post[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!canPost) return

    const controller = new AbortController()
    let active = true
    setLoading(true)
    setLoadError('')
    void api.get<Post[]>('/posts', { signal: controller.signal })
      .then((items) => {
        if (active) setPosts(items)
      })
      .catch(() => {
        if (active) setLoadError('Could not load posts. Refresh to try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [canPost])

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canPost || loading || submitting || !body.trim()) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const post = await api.post<Post>('/posts', { body: body.trim() })
      setPosts((current) => [post, ...current].slice(0, 30))
      setBody('')
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'Could not publish the post.')
    } finally {
      setSubmitting(false)
    }
  }

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
          <form onSubmit={publish}>
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
                  maxLength={2000}
                  value={body}
                  disabled={!canPost || submitting}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Share something with your community..."
                  className="min-h-11 w-full resize-none bg-transparent pt-2 text-ink placeholder:text-ink-muted focus:outline-none"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <span className="text-sm text-ink-muted">
                  {useMocks ? 'Start the real API to publish posts.' :
                    status === 'guest' ? 'Log in to read and publish posts.' : ''}
                </span>
                <Button type="submit" disabled={!canPost || loading || submitting || !body.trim()}>
                  {submitting ? 'Publishing…' : 'Post'}
                </Button>
              </div>
            </Card>

          </form>
          {submitError && <p role="alert">{submitError}</p>}
          {canPost && loading && <p role="status">Loading posts…</p>}
          {canPost && loadError && <p role="alert">{loadError}</p>}
          {canPost && posts.map((post) => (
            <Card key={post.id} className="p-4">
              <p className="font-semibold">{post.author_username}</p>
              <p className="whitespace-pre-wrap break-words">{post.body}</p>
            </Card>
          ))}
          {(!canPost || (!loading && !loadError && posts.length === 0)) && (
            <EmptyState
              title="No posts yet"
              description={canPost ? 'Publish the first post.' : 'Log in to see the feed.'}
              icon={<span className="text-lg font-bold">#</span>}
            />
          )}
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
