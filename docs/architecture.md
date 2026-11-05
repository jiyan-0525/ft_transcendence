# Architecture

Technical reference for the Community & Content Platform. Product strategy and
scheduling live in [`../PLAN.md`](../PLAN.md); module evidence lives in
[`module-claims.md`](module-claims.md); decision records live in
[`decisions/`](decisions/).

**Status:** the backend foundation and the React scaffold exist. Business features,
authentication routes, the WebSocket hub and the production deployment are planned.
Sections that describe planned code name the intended location so the document can
be turned into tickets without pretending the code is already there.

---

## 1. System shape

The backend is a **modular monolith**: one FastAPI service, one PostgreSQL
database, and one deployable unit. Business capabilities are separated by module,
not by network boundary.

```
Browser (React 19 SPA)
   │  HTTPS / REST                    WSS (planned)
   ▼                                    ▼
Reverse proxy (Caddy, planned) ──▶ FastAPI / Uvicorn ──▶ PostgreSQL
                                        │
                                        ├── auth / users / friends
                                        ├── communities / content
                                        ├── events / marketplace
                                        ├── notifications / media
                                        ├── search
                                        └── WebSocket hub (planned)
```

In development the browser talks to Vite on `:5173`. Vite proxies `/api` and
`/ws` to FastAPI on `127.0.0.1:8000`, so the browser sees one origin and session
cookies work without cross-site configuration. In production Caddy terminates TLS
and routes `/api` and `/ws`; the React bundle is served as static files.

Why not microservices: event capacity, community membership, content visibility,
notifications and permissions often change together. A single database
transaction is simpler and safer than a distributed saga at this scale. FastAPI
routers and service modules still let a domain move out later if it ever needs to.

---

## 2. Responsibilities

| Layer | Owns | Does not own |
|---|---|---|
| React SPA | Rendering, form state, optimistic UI, reconnecting the socket | Authorisation, capacity, visibility or any business rule |
| FastAPI API | Validation, authorisation, transactions, persistence, search, file access | Presentation |
| WebSocket hub (planned) | Pushing already-persisted messages, notifications and presence | Being the record of truth |
| SQLAlchemy / Alembic | Model mapping, queries and schema history | Presentation or transport |
| PostgreSQL | Authoritative state, constraints, relations | Presentation or transport |
| Caddy (planned) | TLS termination, HTTP→HTTPS redirect, static routing | Application logic |

The server is authoritative for every write. A client may request an action; it
never supplies the resulting permission decision, capacity count or record state.

### Current implementation (verified 2026-11-05)

| Area | Exists today | Location |
|---|---|---|
| FastAPI app and health endpoint | Yes | `packages/server/app/main.py` |
| Settings from `.env` | Yes | `app/config.py` |
| Engine, session factory, `get_db` dependency | Yes | `app/database.py` |
| `User` and `AuthSession` models | Yes | `app/models.py` |
| Initial migration | Yes | `migrations/versions/88fd3dcf3c30_create_users_and_sessions.py` |
| Argon2id hashing and verification | Yes | `app/security.py` |
| Registration and user response schemas | Yes | `app/schemas.py` |
| Auth routes, dependency checks, cookies | No | planned |
| Business routers and services | No | planned |
| WebSocket hub | No | planned |
| React bootstrap shell | Yes | `packages/web/src/App.tsx` |
| React routes, stores, API client, components | No | planned |

---

## 3. Server modules

Current and planned layout:

```
packages/server/
├── alembic.ini
├── requirements.txt
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application and /api/health
│   ├── config.py        # pydantic-settings, reads the repository .env
│   ├── database.py      # engine, SessionLocal, get_db dependency
│   ├── models.py        # SQLAlchemy models (User, AuthSession)
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── security.py      # Argon2id hashing and verification
│   ├── routers/         # planned: one module per domain
│   ├── services/        # planned: transactions, permissions, domain rules
│   └── dependencies/    # planned: current user, role and session checks
├── migrations/
│   ├── env.py
│   └── versions/
└── tests/
    ├── test_database.py
    └── test_security.py
```

Planned domain modules mirror the product: `auth`, `users`, `friends`,
`communities`, `content`, `events`, `marketplace`, `chat`, `notifications`,
`media` and `search`. A module owns its router, service functions and tests.

Rules:

- A router validates input, resolves dependencies, calls a service and returns a
  response schema. It does not contain domain rules.
- A service performs authorisation and the transaction. Handlers do not reach
  into another module's tables.
- Cross-domain reads go through the owning module's service.
- Shared dependencies handle the current user, request IDs, structured errors and
  rate limits.
- Every module that writes data has its own tests, including negative permission
  cases.

### Request flow

```
HTTP request
  → Vite proxy (development) or Caddy (production, planned)
  → request ID + structured logging
  → FastAPI dependency: session/cookie authentication
  → router
  → Pydantic validation (shape, size, type)
  → authorisation check (platform / community / ownership)
  → service + SQLAlchemy transaction
  → Pydantic response DTO
```

Validation happens at the boundary. Authorisation happens inside the service, not
only in the router, so a second entry point cannot bypass it.

### Error shape

Target envelope, as defined in [`protocol.md`](protocol.md) §2.3:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not a member of this community.",
    "requestId": "req_01J..."
  }
}
```

Codes are stable and safe to show; internal details stay in server logs. FastAPI's
default `{"detail": ...}` response must be mapped to this envelope by an exception
handler. Until that exists, the React client normalises both shapes in
`packages/web/src/lib/api.ts`.

---

## 4. Frontend architecture

```
packages/web/src/
├── main.tsx             # React root
├── App.tsx              # bootstrap shell (current)
├── style.css            # global styles and planned design tokens
├── router/              # planned: React Router routes and guards
├── pages/               # planned: one component per route
├── components/          # planned: shared design system (10+)
├── stores/              # planned: Zustand auth and UI stores
├── lib/                 # planned: API client, WebSocket client, formatting
├── types/               # planned: API and WebSocket types
└── test/setup.ts        # Vitest + Testing Library setup
```

Planned responsibilities:

- **React Router 7** owns route matching, nested layouts and auth guards.
- **Zustand 5** owns session/UI state that is not server data.
- **TanStack Query 5** owns server state: caching, retries and invalidation.
- **`lib/api.ts`** is the only place that talks to FastAPI. It sends cookies with
  `credentials: "include"`, maps the backend's snake_case DTOs to camelCase
  domain models, and normalises errors into one `ApiError`.
- **`lib/ws.ts`** is the only place that opens the WebSocket. It reconnects with
  exponential backoff and jitter, sends heartbeats and closes on logout.

The frontend never decides permissions, capacity or visibility. It hides controls
for usability; the API enforces the rule.

---

## 5. Real-time

One WebSocket connection per tab carries all real-time domains. Messages use a
JSON envelope:

```json
{ "type": "chat:message", "payload": { "conversationId": "c1", "body": "Hi" } }
```

FastAPI/Starlette provides the WebSocket endpoint; the hub, presence registry and
reconnect handling are still planned.

### Principles

1. **Persist first, push second.** A message or notification is written before it
   is broadcast.
2. **The database is the replay log.** Reconnect fetches missed rows by cursor; it
   does not rely on an in-memory replay buffer.
3. **Presence is per user, not per socket.** Closing one of several tabs does not
   mark the user offline.
4. **Slow consumers are dropped.** A blocked socket must not block the hub.
5. **Every inbound frame is authenticated and validated.** The connection identity
   comes from the session cookie, never from a client-supplied user ID.

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

The implemented schema contains two tables:

```
users
  id, email (unique), username (unique), password_hash,
  role (USER | MODERATOR | ADMIN), is_active, created_at

users ──< sessions
  id, user_id → users.id (ON DELETE CASCADE, indexed),
  token_hash (unique), expires_at (indexed), revoked_at, created_at
```

The target schema adds the V1 domains. It is documented in
[`data-model.md`](data-model.md) and summarised here:

```
User ──< AuthSession
User ──< OAuthAccount (planned)
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

| Constraint / index | Purpose | Status |
|---|---|---|
| `users.email`, `users.username` unique | Identity | implemented |
| `users.role` check | Only `USER`, `MODERATOR`, `ADMIN` | implemented |
| `sessions.token_hash` unique | One session per hashed token | implemented |
| `sessions.user_id`, `sessions.expires_at` indexed | Lookup and expiry sweeps | implemented |
| `FriendRequest(requester, addressee)` unique | No duplicate pending requests | planned |
| `Friendship(userA, userB)` unique | One friendship per pair | planned |
| `Community.slug` unique | Stable community links | planned |
| `CommunityMember(community, user)` unique | One membership | planned |
| `EventParticipant(event, user)` unique | One RSVP per user | planned |
| `Content(published_at, visibility)` | Feed query | planned |
| `Listing(status, category, price_cents)` | Marketplace filters | planned |
| `Message(conversation, created_at)` | History pagination | planned |
| `Notification(recipient, read_at)` | Unread badge | planned |

Database naming stays snake_case (for example `password_hash`, `created_at`). The
React API client exposes camelCase domain models and performs the mapping once.

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

The `users.role` check constraint already enforces the platform role values. The
authorisation dependencies and community/ownership checks are planned.

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

Media storage is planned. The current repository has no upload model or route.

---

## 9. Search

Search is a read model over domain queries, not a second database:

1. Parse and validate the query, filters and pagination.
2. Ask each requested domain for visible candidates (or use an indexed query).
3. Apply the caller's visibility rules.
4. Merge, sort and paginate consistently.
5. Return only fields the caller is allowed to see.

Private messages and restricted community content never appear in results.
Search is reviewed with negative tests per role. Search is planned.

---

## 10. Deployment

Current local development uses two processes and one container:

```
Vite :5173 ──/api,/ws──▶ Uvicorn :8000 ──▶ PostgreSQL :5432
                                              (compose.db.yml)
```

Target production shape:

```
                    ┌──────────────┐
   browser ──HTTPS──▶     Caddy     │  automatic TLS, HTTP→HTTPS redirect
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌───────────────┐         ┌──────────────────┐
      │ web (static)  │         │ api (FastAPI)    │  REST + WebSocket
      │ React bundle  │         │ Uvicorn          │
      └───────────────┘         └────────┬─────────┘
                                         │
                                  ┌──────▼───────┐
                                  │ db (Postgres)│
                                  └──────┬───────┘
                                         │
                                  ┌──────▼───────┐
                                  │ uploads      │
                                  └──────────────┘
```

The current files are `compose.db.yml` (PostgreSQL only) and the Makefile targets
`setup`, `up`, `migrate`, `dev`, `test` and `web-*`. The full Compose stack,
Caddy configuration and multi-stage images are planned for the foundation
milestone. Secrets arrive through environment variables from `.env`, which is
git-ignored; `.env.example` is the committed template.

---

## 11. Testing strategy

| Level | What it protects | Status |
|---|---|---|
| `pytest` database tests | Connectivity and model/migration consistency | implemented (`tests/test_database.py`) |
| `pytest` security tests | Argon2id hashing and verification | implemented (`tests/test_security.py`) |
| FastAPI route tests | Status codes, dependency checks, error shape, JSON contracts | planned |
| Vitest + Testing Library | Components, guards, API mapping and permission-aware rendering | scaffolded (`src/App.test.tsx`) |
| Playwright smoke | Login, feed, one social action, console clean | planned |
| Manual demo | The account script in `README.md` and `PLAN.md` | planned |

CI runs two jobs: `backend` (PostgreSQL service, migrations, `alembic check`,
`pytest`) and `frontend` (`npm ci`, lint, typecheck, test, build).

Every module needs a test written by someone other than its author, plus a
negative test for at least one forbidden action.
