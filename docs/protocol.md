# Client–Server Protocol (Draft v0.2)

**Status:** health, database readiness, session authentication and the text-post API reflect the Week 1 implementation. Other domain endpoints and the WebSocket contract are proposals.

**Stack:** React 19 + TypeScript frontend (React Router 7, Zustand 5, TanStack
Query 5); Python 3.12 + FastAPI backend; PostgreSQL with SQLAlchemy 2.0 and
Alembic; native JSON WebSocket.

---

## 1. Scope

- REST for ordinary reads and writes: accounts, profiles, friends, communities,
  content, events, marketplace, search, uploads and administration.
- One authenticated WebSocket for chat, notifications and presence.
- PostgreSQL is the authoritative store. A WebSocket frame is never the only
  record of a message or notification.

---

## 2. Conventions

### 2.1 Content type

All requests and responses are UTF-8 JSON unless they are file uploads or file
downloads.

### 2.2 Authentication

Protected REST routes validate the HttpOnly `session` cookie issued at login. The default server-side lifetime is 24 hours and can be changed with `AUTH_SESSION_HOURS`. The cookie uses `SameSite=Lax` and is Secure in production mode. The WebSocket handshake is planned.

Clients never send a user ID to identify themselves for authorisation. The server
derives identity from the session.

### 2.3 Errors

The error envelope is:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not a member of this community.",
    "requestId": "req_01J..."
  }
}
```

Stable codes: `INVALID_PAYLOAD`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`,
`CONFLICT`, `RATE_LIMITED`, `INTERNAL`.

FastAPI and validation errors use the same envelope. The response header `X-Request-ID` matches `error.requestId`. The React client exposes errors as `ApiError`.

### 2.4 Pagination

Planned cursor pagination for the unified feed, messages and notifications:

```json
{
  "items": [],
  "nextCursor": "eyJpZCI6IjEyMyJ9",
  "hasMore": true
}
```

Limit is capped server-side (default 20, maximum 100). Invalid cursors return
`INVALID_PAYLOAD`.

### 2.5 Validation

Every payload is validated on the server: required fields, lengths, enum values,
IDs, file type and file size. Client validation is for usability only.

---

## 3. Health

### `GET /api/health`

**Response:** `200 application/json`

```json
{ "status": "ok", "service": "community-api" }
```

This is a liveness check. `GET /api/status` checks PostgreSQL and returns `200` with `{"status":"ok","database":"ok"}` or `503` if the database is unavailable.

---

## 4. Authentication

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account (email, username, password) |
| `POST` | `/api/auth/login` | Email/password login; sets the session cookie |
| `POST` | `/api/auth/logout` | Revoke the current session |
| `GET` | `/api/auth/me` | Current user profile and role |
| `GET` | `/api/auth/oauth/:provider/start` | Begin OAuth 2.0 authorisation |
| `GET` | `/api/auth/oauth/:provider/callback` | Complete OAuth and create/link the account |
| `POST` | `/api/auth/oauth/:provider/link` | Link a provider to an existing account |
| `DELETE` | `/api/auth/oauth/:provider` | Unlink a provider |

Passwords are hashed with Argon2id (`argon2-cffi`, `Type.ID`). Raw passwords are
never logged, stored or returned. The registration contract already implemented in
`packages/server/app/schemas.py` is:

- `email`: valid address, at most 254 characters, normalised to lowercase.
- `username`: 3–50 characters, `^[A-Za-z0-9_]+$`, unique.
- `password`: 8–128 characters, with at least one ASCII uppercase letter, lowercase letter,
  digit and punctuation character. Sent as a secret and stored only as an Argon2id
  hash.

`UserResponse` uses snake_case: `id`, `email`, `username`, `role`, `is_active`,
`created_at`.

Status codes agreed with the frontend (details in `docs/handoff/auth-frontend.md`):

- `register` → `201` with `UserResponse`. Registration does **not** sign the user
  in and sets no cookie. Duplicate email or username → `409 CONFLICT`, with a message naming the conflicting field.
- `login` → `200` with `UserResponse` and the session cookie. Wrong credentials →
  `401 UNAUTHENTICATED`. The login form checks only that the password is present.
- `logout` → `204` and the cookie is cleared.
- `me` → `200` with `UserResponse`, or `401 UNAUTHENTICATED` without a valid session.

---

## 5. Users and friendships (planned)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/users/:id` | Public profile, respecting visibility |
| `PATCH` | `/api/users/me` | Update username, bio, locale |
| `PUT` | `/api/users/me/avatar` | Upload or replace the avatar |
| `DELETE` | `/api/users/me/avatar` | Reset to the default avatar |
| `GET` | `/api/users/:id/content` | Published content by this user |
| `GET` | `/api/friends` | Accepted friends |
| `GET` | `/api/friends/requests` | Incoming and outgoing pending requests |
| `POST` | `/api/friends/requests` | Send a request `{ "userId": "..." }` |
| `POST` | `/api/friends/requests/:id/accept` | Accept |
| `POST` | `/api/friends/requests/:id/reject` | Reject |
| `DELETE` | `/api/friends/:userId` | Remove a friend |

Friend requests are unique per pair and idempotent. Accepting a request creates
the friendship in one transaction.

---

## 6. Communities

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/communities` | Browse/search communities |
| `POST` | `/api/communities` | Create a community; caller becomes owner |
| `GET` | `/api/communities/:id` | Community detail and membership |
| `PATCH` | `/api/communities/:id` | Owner edits description, visibility |
| `DELETE` | `/api/communities/:id` | Owner deletes the community |
| `POST` | `/api/communities/:id/join` | Join |
| `DELETE` | `/api/communities/:id/leave` | Leave (owner must transfer or delete) |
| `GET` | `/api/communities/:id/members` | Member list |
| `POST` | `/api/communities/:id/members` | Owner adds a member |
| `DELETE` | `/api/communities/:id/members/:userId` | Owner removes a member |
| `GET` | `/api/communities/:id/content` | Community-scoped feed |

Community visibility is checked for every read and write. A non-member requesting
a restricted community by ID receives `403` or `404` according to the visibility
policy, not a partial response.

---

## 7. Content

### Implemented Week 1 text posts

All four routes require an active session. Create and update accept only `{"body":"Hello"}`, with 1–2,000 characters after trimming. Returned posts contain `id`, `author_id`, `author_username`, `body` and `created_at`.

| Method | Route | Result |
|---|---|---|
| GET | `/api/posts` | 200 with a newest-first array. `limit` defaults to 30 and accepts 1–100. |
| POST | `/api/posts` | 201 with the new post. The session supplies the author. |
| PATCH | `/api/posts/{id}` | 200 with the updated post. Author only. |
| DELETE | `/api/posts/{id}` | 204. Author, Moderator or Admin. |

### Planned content API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/feed` | Chronological feed; filters `all`, `friends`, `communities` |
| `POST` | `/api/articles` | Create an article (title, summary, cover, Markdown, tags) |
| `GET` | `/api/content/:id` | Read one item, subject to visibility |
| `PATCH` | `/api/content/:id` | Author edits |
| `DELETE` | `/api/content/:id` | Author (or platform moderator) deletes |
| `POST` | `/api/content/:id/publish` | Move a draft to published |
| `GET` | `/api/content/:id/comments` | Comment list |
| `POST` | `/api/content/:id/comments` | Add a comment |
| `DELETE` | `/api/comments/:id` | Author or moderator deletes |
| `PUT` | `/api/content/:id/reactions/:kind` | Add a reaction (like, etc.) |
| `DELETE` | `/api/content/:id/reactions/:kind` | Remove a reaction |

Creating content may include `shareToFeed: true`. That choice controls whether the
item appears in the unified feed; edits to a listing do not re-share it.

---

## 8. Events

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/events` | Upcoming events, filters by community and date |
| `POST` | `/api/events` | Create an event |
| `GET` | `/api/events/:id` | Event detail, attendee count and caller's RSVP |
| `PATCH` | `/api/events/:id` | Organiser edits time, place, description or capacity |
| `DELETE` | `/api/events/:id` | Organiser cancels the event |
| `POST` | `/api/events/:id/rsvp` | RSVP `GOING` |
| `DELETE` | `/api/events/:id/rsvp` | Cancel RSVP |
| `GET` | `/api/events/:id/attendees` | Attendee list, subject to privacy |

Status transitions: `UPCOMING → CANCELLED` or `UPCOMING → COMPLETED`. Capacity is
enforced transactionally; the response is `409 CONFLICT` when no seat remains.
Editing the time or place, or cancelling, notifies every attendee.

---

## 9. Marketplace

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/listings` | Browse with category, price, condition, status and cursor |
| `POST` | `/api/listings` | Create a listing with images |
| `GET` | `/api/listings/:id` | Listing detail |
| `PATCH` | `/api/listings/:id` | Seller edits |
| `DELETE` | `/api/listings/:id` | Seller deletes |
| `POST` | `/api/listings/:id/status` | Set `AVAILABLE`, `RESERVED` or `SOLD` |
| `POST` | `/api/listings/:id/contact` | Open a conversation with the seller |

The first version has no payment, shipping, refund, order or review endpoints.
`contact` creates a conversation and attaches the listing link.

---

## 10. Chat

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/conversations` | Conversations with unread counts |
| `POST` | `/api/conversations` | Start a conversation with one user |
| `GET` | `/api/conversations/:id/messages` | Paginated history (cursor) |
| `POST` | `/api/conversations/:id/messages` | Persist a message and push it |
| `POST` | `/api/conversations/:id/read` | Advance the read cursor |

Only conversation members may read or write. The server derives the sender from
the session.

---

## 11. Notifications

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/notifications` | Paginated notification centre |
| `GET` | `/api/notifications/unread-count` | Badge count |
| `POST` | `/api/notifications/:id/read` | Mark one read |
| `POST` | `/api/notifications/read-all` | Mark all read |
| `GET` | `/api/notifications/settings` | Per-type preferences |
| `PATCH` | `/api/notifications/settings` | Update preferences |

Triggers: friend request received/accepted, comment or reaction on owned content,
added to/removed from a community, attended event modified/cancelled, and a new
event in a followed community.

---

## 12. Search and media

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/search` | `q`, `type`, filters, sort, cursor |
| `POST` | `/api/media` | Multipart upload; returns metadata and a signed/authorised URL |
| `GET` | `/api/media/:id` | Download or stream with an access check |
| `DELETE` | `/api/media/:id` | Delete an owned, unreferenced file |

Search applies the same visibility rules as direct reads. Media access is checked
per request; a URL alone is not authorisation.

---

## 13. Administration

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/admin/users` | List/search users (Admin, Moderator) |
| `PATCH` | `/api/admin/users/:id/role` | Assign `USER`, `MODERATOR` or `ADMIN` (Admin only) |
| `DELETE` | `/api/admin/users/:id` | Disable or delete an account (Admin only) |
| `GET` | `/api/admin/content` | Moderation queue (Admin, Moderator) |
| `POST` | `/api/admin/content/:id/hide` | Hide content (Admin, Moderator) |

Regular users receive `403` for every admin route.

---

## 14. WebSocket (planned)

### 14.1 Connection

**Endpoint:** `GET /ws` (upgrade; `ws://` locally, `wss://` behind HTTPS).

The handshake requires a valid session cookie. The server rejects unauthenticated
upgrades with `401`. One connection per tab is normal; the hub tracks all sockets
for a user and computes presence per user.

### 14.2 Envelope

```json
{ "type": "chat:send", "payload": { "conversationId": "c1", "body": "Hi" } }
```

Both fields are required. Unknown types and invalid payloads are rejected with
`ws:error` and never crash the hub.

### 14.3 Client → server

| Type | Payload | Notes |
|---|---|---|
| `chat:send` | `{ conversationId, body, clientId }` | Persisted before broadcast |
| `chat:read` | `{ conversationId, messageId }` | Advance the read cursor |
| `typing:start` / `typing:stop` | `{ conversationId }` | Ephemeral, not persisted |
| `presence:subscribe` | `{ userIds }` | Friends or visible profiles only |
| `notifications:ack` | `{ notificationId }` | Mark delivered/read according to the endpoint used |

### 14.4 Server → client

| Type | Payload | Notes |
|---|---|---|
| `chat:message` | `{ conversationId, message }` | Persisted message |
| `chat:read` | `{ conversationId, userId, messageId }` | Read receipt |
| `notification:new` | `{ notification }` | Persisted notification |
| `presence:update` | `{ userId, online }` | Per-user presence |
| `community:member_changed` | `{ communityId, userId, action }` | Optional live update |
| `event:changed` | `{ eventId, action }` | Optional live update |
| `ws:error` | `{ code, message }` | Invalid frame or forbidden action |

### 14.5 Reconnect

1. The client reconnects with the same session.
2. It sends its last message cursor per conversation.
3. The server returns rows after the cursor (or the client fetches them over REST).
4. The client fetches the unread notification count.
5. Presence is recomputed from active sockets.

No message is lost because every message and notification is persisted before it
is pushed.

---

## 15. Open decisions

1. Session cookie versus bearer-only for the SPA; both may be supported.
2. Final visibility policy for `COMMUNITY` content: `403` versus `404` for
   non-members.
3. Whether typing indicators and read receipts are in scope for Week 2 or Week 3.
4. Signed media URLs versus authenticated streaming for large files.
5. API versioning (`/api/v1`) before the first public demo.
