# Friendships handoff

The [protocol](../protocol.md#5-users-and-friendships) is the contract for friend requests and friendships. Routes live in `packages/server/app/friends.py` and the tests in `packages/server/tests/test_friends.py`.

- Request bodies and responses use snake_case, like the post API: `{ "user_id": 7 }`. Map them in `lib/mappers.ts` as usual.
- `GET /api/friends/requests` returns `incoming` and `outgoing` lists with both usernames, so the page can show "anna wants to be your friend" without extra lookups.
- Show Accept and Reject only for `incoming` requests. The server returns `403` if anyone else tries.
- A `409` on send has two meanings: already friends, or the other user already asked you. Show the server message and refresh the request list.
- There is no user search or profile endpoint yet. Until `GET /api/users/:id` exists, the feed's `author_id` is the easiest place for an "Add friend" button.

## Verify locally

1. Run `make up`, `make migrate` and `make test`, then `make dev` and `make web-dev`.
2. Register two users. As A, send a request to B's id. As B, check that it appears under `incoming` and accept it.
3. Both users now see each other in `GET /api/friends`. Remove the friendship as either user and check that both lists are empty.

Friend request notifications and live updates are follow-up work for the notification and WebSocket modules.
