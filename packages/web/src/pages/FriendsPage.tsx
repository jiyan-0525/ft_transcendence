import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api } from '@/lib/api'
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from '@/components/ui'

type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

type FriendRequest = {
  id: number
  requester_id: number
  requester_username: string
  addressee_id: number
  addressee_username: string
  status: FriendRequestStatus
  created_at: string
}

type FriendRequestList = {
  incoming: FriendRequest[]
  outgoing: FriendRequest[]
}

type Friend = {
  user_id: number
  username: string
  since: string
}

export default function FriendsPage() {
  const [friendRequests, setFriendRequests] = useState<FriendRequestList>({
    incoming: [],
    outgoing: [],
  })
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [userId, setUserId] = useState('')
  const [loadError, setLoadError] = useState('')

  const loadData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setLoadError('')
    try {
      const [requests, friends] = await Promise.all([
        api.get<FriendRequestList>('/friends/requests', { signal }),
        api.get<Friend[]>('/friends', { signal }),
      ])
      setFriendRequests(requests)
      setFriends(friends)
    } catch (error) {
      if (!signal?.aborted && error instanceof Error) {
        setLoadError('Could not load friends. Refresh to try again.')
      }
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadData(controller.signal)
    return () => controller.abort()
  }, [loadData])

  async function runAction(action: () => Promise<unknown>) {
    setBusy(true)
    setLoadError('')
    try {
      await action()
      setUserId('')
      await loadData()
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not complete the action.')
    } finally {
      setBusy(false)
    }
  }

  function sendRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const targetId = Number(userId)
    if (!Number.isInteger(targetId) || targetId <= 0) return
    void runAction(() => api.post('/friends/requests', { user_id: targetId }))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add a friend</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendRequest} className="flex flex-wrap items-end gap-3">
            <div className="flex-1">
              <label htmlFor="friend-user-id" className="block text-sm font-medium">
                User ID
              </label>
              <input
                id="friend-user-id"
                type="number"
                min="1"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="e.g. 2"
                className="mt-1 w-full rounded border border-line bg-surface px-3 py-2"
              />
            </div>
            <Button type="submit" disabled={busy || !userId.trim()}>
              Send request
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Friend Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadError ? <Alert tone="danger">{loadError}</Alert> : null}

          {loading ? (
            <p role="status">Loading…</p>
          ) : friendRequests.incoming.length === 0 && friendRequests.outgoing.length === 0 ? (
            <EmptyState title="No friend requests" />
          ) : (
            <div className="space-y-4">
              {friendRequests.incoming.length > 0 ? (
                <div>
                  <h3 className="font-semibold">Incoming Requests</h3>
                  <ul className="mt-2 space-y-2">
                    {friendRequests.incoming.map((request) => (
                      <li
                        key={request.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded border border-line px-3 py-2"
                      >
                        <span>
                          <strong>{request.requester_username}</strong> wants to be your friend.
                        </span>
                        <span className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              void runAction(() =>
                                api.post(`/friends/requests/${request.id}/accept`),
                              )
                            }
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={busy}
                            onClick={() =>
                              void runAction(() =>
                                api.post(`/friends/requests/${request.id}/reject`),
                              )
                            }
                          >
                            Reject
                          </Button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {friendRequests.outgoing.length > 0 ? (
                <div>
                  <h3 className="font-semibold">Outgoing Requests</h3>
                  <ul className="mt-2 space-y-2">
                    {friendRequests.outgoing.map((request) => (
                      <li key={request.id}>
                        Request sent to <strong>{request.addressee_username}</strong> ({request.status})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Friends</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p role="status">Loading…</p>
          ) : friends.length === 0 ? (
            <EmptyState
              title="No friends yet"
              description="Send a request using a user ID to get started."
            />
          ) : (
            <ul className="space-y-2">
              {friends.map((friend) => (
                <li
                  key={friend.user_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded border border-line px-3 py-2"
                >
                  <span>
                    <strong>{friend.username}</strong> · since{' '}
                    {new Date(friend.since).toLocaleDateString()}
                  </span>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busy}
                    onClick={() =>
                      void runAction(() => api.delete(`/friends/${friend.user_id}`))
                    }
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
