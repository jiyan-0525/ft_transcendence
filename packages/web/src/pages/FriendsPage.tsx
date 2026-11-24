import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from '@/components/ui'

type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

type FriendRequest = {
  id: number
  requesterId: number
  requester_username: string
  addresseeId: number
  addressee_username: string
  status: FriendRequestStatus
  createdAt: string
}

type FriendRequestList = {
    incoming: FriendRequest[]
    outgoing: FriendRequest[]
}

type Friend = {
  id: number
  username: string
  since: string
}

export default function FriendsPage() {
  const [friendRequests, setFriendRequests] = useState<FriendRequestList>({
    incoming: [],
    outgoing: [],
  })
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
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
      if (error instanceof Error) {
        setLoadError('Could not load friends. Refresh to try again.')
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadData(controller.signal)

    return () => {
      controller.abort()
    }
  }, [loadData])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Friend Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loadError && <Alert tone="danger">{loadError}</Alert>}
          {loading && <p>Loading...</p>}
          {!loading && !loadError && (
            <>
              {friendRequests.incoming.length === 0 && friendRequests.outgoing.length === 0 ? (
                <EmptyState title="No friend requests" />
              ) : (
                <>
                  {friendRequests.incoming.length > 0 && (
                    <div>
                      <h3 className="font-semibold">Incoming Requests</h3>
                      <ul className="space-y-2">
                        {friendRequests.incoming.map((request) => (
                          <li key={request.id}>
                            {request.requester_username} - {request.status}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {friendRequests.outgoing.length > 0 && (
                    <div>
                      <h3 className="font-semibold">Outgoing Requests</h3>
                      <ul className="space-y-2">
                        {friendRequests.outgoing.map((request) => (
                          <li key={request.id}>
                            {request.addressee_username} - {request.status}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Friends</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading...</p>}
          {!loading && friends.length === 0 && <EmptyState title="No friends yet" />}
          {!loading && friends.length > 0 && (
            <ul className="space-y-2">
              {friends.map((friend) => (
                <li key={friend.id}>
                  Friend ID: {friend.username} - Since: {new Date(friend.since).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}