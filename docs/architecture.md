# Architecture

Technical reference for the Community & Content Platform. Product strategy and
scheduling live in [`../PLAN.md`](../PLAN.md); module evidence lives in
[`module-claims.md`](module-claims.md); decision records live in
[`decisions/`](decisions/).

---

## 1. System shape

The backend is a **modular monolith**: one Go service, one PostgreSQL database,
and one deployable unit. Business capabilities are separated by package, not by
network boundary.

```
Browser (Vue 3 SPA)
   │  HTTPS / REST                 WSS
   ▼                                 ▼
Caddy ──▶ Go + Echo API ──▶ PostgreSQL   WebSocket hub
              │                              │
              ├── auth / users / friends     ├── chat
              ├── communities / content      ├── notifications
              ├── events / marketplace       └── presence
              ├── notifications / media
              └── search
```

Why not microservices: event capacity, community membership, content visibility,
notifications and permissions often change together. A single database
transaction is simpler and safer than a distributed saga at this scale. The
package boundaries still let a domain move out later if it ever needs to.

---

## 2. Responsibilities

| Layer | Owns | Does not own |
|---|---|---|
| Vue SPA | Rendering, form state, optimistic UI, reconnecting the socket | Authorisation, capacity, visibility or any business rule |
| Go API | Validation, authorisation, transactions, persistence, search, file access | Presentation |
| WebSocket hub | Pushing already-persisted messages, notifications and presence | Being the record of truth |
| PostgreSQL | Authoritative state, constraints, relations | Presentation or transport |
| Caddy | TLS termination, HTTP→HTTPS redirect, routing | Application logic |

The server is authoritative for every write. A client may request an action; it
never supplies the resulting permission decision, capacity count or record state.

---

## 3. Domain packages

```
packages/server/internal/
├── auth/            registration, login, sessions, OAuth account linking
├── users/           profiles, avatars, platform roles
├── friends/         requests, friendships, friend lists
├── communities/     communities, membership, community roles
├── content/         posts, articles, comments, reactions, feed queries
├── events/          events, RSVP, capacity, status transitions
├── marketplace/     listings, images, sale status
├── chat/            conversations, messages, unread counts
├── notifications/   notification creation and read state
├── media/           upload, validation, storage, access checks
├── search/          unified query and visibility filtering
├── realtime/        WebSocket hub, per-user connections, presence
├── storage/         database connection, migrations, repositories
└── handler/         HTTP routing, middleware, error mapping
```

Rules:

- A domain exposes a small service interface; handlers do not reach into another
  domain's tables.
- Cross-domain reads go through the owning domain's service.
- Shared middleware handles authentication, request IDs, structured errors and
  rate limits.
- Every package that writes data has its own tests, including negative permission
  cases.

---

## 4. Request flow

```
HTTP request
  → Caddy (TLS)
  → request ID + structured logging
  → authentication middleware (session/JWT)
  → route handler
  → input validation (shape, size, type)
  → authorisation check (platform / community / ownership)
  → domain service
  → transaction (PostgreSQL)
  → response DTO
```

Validation happens at the boundary. Authorisation happens inside the domain
service, not only in the handler, so a second entry point cannot bypass it.

### Error shape

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not a member of this community.",
    "requestId": "req_01J..."
  }
}
```

Codes are stable and safe to show; internal details stay in server logs.

---

## 5. Real-time

One WebSocket connection per tab carries all real-time domains. Messages use a
JSON envelope:

```json
{ "type": "chat:message", "payload": { "conversationId": "c1", "body": "Hi" } }
```

### Principles

1. **Persist first, push second.** A message or notification is written before it
   is broadcast.
2. **The database is the replay log.** Reconnect fetches missed rows by cursor; it
   does not rely on an in-memory replay buffer.
3. **Presence is per user, not per socket.** Closing one of several tabs does not
   mark the user offline.
4. **Slow consumers are dropped.** A blocked socket must not block the hub.
5. **Every inbound frame is authenticated and validated.** The connection identity
   comes from the session, never from a client-supplied user ID.

### Reconnect

```
socket drops
   → client reconnects with the same session
   → server registers the socket against the user
   → client requests messages after its last cursor per conversation
   → client fetches unread notifications
   → presence is recomputed from active connections
```

A server restart loses no business data: messages, notifications and presence
intent are already in PostgreSQL or are recomputed from live connections.

---

## 6. Data model

```
User ──< Session
User ──< OAuthAccount
User ──< FriendRequest ──> User
User ──< Friendship ──> User

User ──< CommunityMember >── Community ──< Content
User ──< Content ──< Comment
Content ──< Reaction >── User

Content ──1 Event ──< EventParticipant >── User
Content ──1 Listing
Content ──< ContentAttachment >── MediaFile

Conversation ──< ConversationMember >── User
Conversation ──< Message

User ──< Notification
User ──< MediaFile
```

`Content` holds the common fields: author, optional community, type, visibility
and publication time. `Post`, `Article`, `Event` and `Listing` hold their own
business fields. This gives Feed, comments, reactions and attachments one shape
without forcing event registration and marketplace sales into the same model.

See [`decisions/0002-shared-content-model.md`](decisions/0002-shared-content-model.md).

### Constraints and indexes

| Constraint / index | Purpose |
|---|---|
| `User.email`, `User.username` unique | Identity |
| `FriendRequest(requester, addressee)` unique | No duplicate pending requests |
| `Friendship(userA, userB)` unique | One friendship per pair |
| `Community.slug` unique | Stable community links |
| `CommunityMember(community, user)` unique | One membership |
| `EventParticipant(event, user)` unique | One RSVP per user |
| `Content(publishedAt, visibility)` | Feed query |
| `Listing(status, category, priceCents)` | Marketplace filters |
| `Message(conversation, createdAt)` | History pagination |
| `Notification(recipient, readAt)` | Unread badge |
| every foreign key | Join performance and integrity |

### Transactions

- **Event RSVP:** lock the event row or use a capacity-safe conditional insert;
  two simultaneous requests for the last seat produce exactly one success.
- **Friend acceptance:** update the request and create the friendship in one
  transaction.
- **Content publish:** create the content row, attachment rows and notification
  rows together.
- **Account deletion:** resolve ownership and retention rules in one transaction
  and document what is anonymised versus deleted.

---

## 7. Permissions

Three independent layers:

| Layer | Roles / relationships | Examples |
|---|---|---|
| Platform | `ADMIN`, `MODERATOR`, `USER` | Assign roles, remove content, list users |
| Community | `OWNER`, `MEMBER` | Add/remove members, post community-only content |
| Ownership | Author, seller, organiser | Edit or delete a post, listing or event |

Rules:

- Platform roles are assigned by an Admin only.
- A community owner's power stops at that community.
- Ownership never overrides a platform ban or community restriction.
- Search, message history, feed and file downloads apply the same visibility
  rules as a direct read.
- A denied action returns `403`, not a hidden button and not an empty `200`.

See [`decisions/0003-permissions.md`](decisions/0003-permissions.md).

---

## 8. Media

- Validate size, extension and **magic bytes**; never trust the client MIME type.
- Store under a generated name outside the web root.
- Keep metadata in `MediaFile`; keep links in `ContentAttachment`.
- Serve restricted files through an authorised route with `Content-Disposition`
  and cache headers suitable for private content.
- Delete or replace through the owning domain so no public orphan is left behind.
- Upload limits come from `.env`; the frontend checks them for UX and the backend
  enforces them for security.

---

## 9. Search

Search is a read model over domain queries, not a second database:

1. Parse and validate the query, filters and pagination.
2. Ask each requested domain for visible candidates (or use an indexed query).
3. Apply the caller's visibility rules.
4. Merge, sort and paginate consistently.
5. Return only fields the caller is allowed to see.

Private messages and restricted community content never appear in results.
Search is reviewed with negative tests per role.

---

## 10. Deployment

```
                    ┌──────────────┐
   browser ──HTTPS──▶     Caddy     │  automatic TLS, HTTP→HTTPS redirect
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌───────────────┐         ┌──────────────┐
      │  web (nginx)  │         │  api (Go)    │  Echo + WebSocket
      │  static SPA   │         │              │
      └───────────────┘         └──────┬───────┘
                                       │
                                ┌──────▼───────┐
                                │ db (Postgres)│
                                └──────┬───────┘
                                       │
                                ┌──────▼───────┐
                                │ uploads      │
                                └──────────────┘
```

`docker compose up --build` is the only command. Development and production
profiles separate plain HTTP/hot reload from Caddy TLS and multi-stage images.
Secrets arrive through environment variables from `.env`, which is git-ignored;
`.env.example` is the committed template.

---

## 11. Testing strategy

| Level | What it protects |
|---|---|
| Go domain tests | Validation, permissions, capacity, transactions |
| Go handler tests | Status codes, error shape, JSON contracts |
| Vitest | Client stores, formatting and permission-aware rendering |
| Playwright smoke | Login, feed, one social action, console clean |
| Manual demo | The three-account script in `README.md` and `PLAN.md` |

Every module needs a test written by someone other than its author, plus a
negative test for at least one forbidden action.
