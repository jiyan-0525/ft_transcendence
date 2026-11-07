# ft_transcendence — Project Plan

**Project:** Community & Content Platform
**Track:** 42 Heilbronn — Common Core, final project
**Team size:** 5
**Status:** Week 1 — backend foundation and React scaffold exist; product features planned
**Target:** 18 module points (6 Major + 6 Minor); 14 required

---

## 1. Vision

A social platform where people share photos and long-form writing, build friend
networks and interest communities, organise real-world events, and trade
second-hand gear in a lightweight marketplace. One account, one unified feed,
real-time chat and notifications, permission-aware search, and role-based
administration.

The product is deliberately a **social core plus Communities, Blog, Events and a
lightweight Marketplace**. Images, chat, search and notifications are shared
capabilities that cut across every domain rather than separate products.

### Success criteria

1. `docker compose up --build` gives a working, HTTPS-served app with a seeded
   database and no manual steps.
2. The Julie journey works end to end: register → complete profile → join a
   community → publish a photo → read a blog → RSVP to an event → receive a
   reschedule notification → contact a marketplace seller.
3. All 12 scoring modules are demonstrable end to end.
4. Permissions are enforced by the backend, including in search and file access.
5. The browser console stays clean during normal use.
6. All five members can explain the architecture and their own contribution.

### Non-goals (explicitly out of scope)

- Marketplace payments, shipping, refunds, orders and transaction reviews.
- Event waitlists, recurring events, ticketing and external calendar sync.
- A standalone photo gallery (the profile **Photos** tab covers v1).
- Video/voice calls, native mobile apps, SSR/SEO optimisation, a public developer
  API, blockchain and microservice decomposition.
- Rich-text/HTML authoring in the blog; Markdown is sufficient for v1.

---

## 2. Technical stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite | Typed SPA with fast HMR; the scaffold exists |
| Routing / state | React Router 7 + Zustand 5 + TanStack Query 5 | Explicit routing, local session/UI state and cached server state |
| Styling | Tailwind CSS 3.4 + custom component library | Responsive UI and the 10+ reusable components required by the design-system module |
| Backend | Python 3.12 + FastAPI (Uvicorn) | Typed request/response models, dependency injection, automatic API docs and a small explicit HTTP layer |
| Database | PostgreSQL 16 | Real relations, constraints and transactions for capacity, permissions and notifications |
| Data access | SQLAlchemy 2.0 + Alembic | Typed models, relationships and versioned migrations; claims the ORM minor module |
| Realtime | Native JSON WebSocket (FastAPI/Starlette) | One protocol for chat, notifications and presence; no polling fallback to maintain |
| Auth | Email/password + one OAuth provider, Argon2id, server-issued sessions | Requirement: secure password storage and external login |
| File storage | Docker persistent volume + file metadata in PostgreSQL | Requirement: durable uploads with validation and access control |
| Reverse proxy | Caddy, automatic HTTPS (planned) | "HTTPS everywhere" with minimal configuration |
| Packaging | Docker Compose, multi-stage builds (planned) | Requirement: single-command deployment |
| Tests | pytest, Vitest + Testing Library, Playwright smoke tests | API/domain tests, unit tests and an end-to-end console check |

### Why FastAPI

The backend is one deployable **modular monolith**. FastAPI gives typed Pydantic
requests and responses, dependency injection for the current user and database
session, and automatic OpenAPI documentation. SQLAlchemy and Alembic keep the
schema explicit and reviewable. Python's async support covers the WebSocket hub,
and business rules stay in services rather than route handlers.

### Why React 19

The team standardised on React in PR #15 after the initial scaffold. React 19 with
TypeScript gives a typed SPA, React Router handles routing and guards, Zustand
keeps session/UI state small, and TanStack Query owns cached server state. The
product design is unchanged by that choice: the framework module requires a
frontend framework and a backend framework, not a specific brand.

### Why PostgreSQL

Event capacity, community membership, content visibility, friend relationships
and notification fan-out all need relational integrity. PostgreSQL also gives us
the transactions that make "one seat left, two simultaneous RSVPs" correct.

---

## 3. Repository layout

```
ft_transcendence/
├── compose.db.yml                # PostgreSQL for local development
├── .env.example                  # committed template; real .env git-ignored
├── Makefile                      # setup / up / migrate / dev / test / web-*
├── README.md                     # graded entry point: roles, modules, demo
├── PLAN.md                       # this file
├── Social_Network.pdf            # 18-point module config, scoring boundaries, demo
├── docs/
│   ├── architecture.md           # diagrams, module boundaries, WebSocket protocol
│   ├── data-model.md             # implemented schema and proposed V1 entities
│   ├── protocol.md               # REST/WebSocket contract
│   ├── module-claims.md          # per-module evidence + demo script
│   ├── decisions/                # ADRs: stack, shared Content, permissions, realtime
│   └── legal/                    # Privacy Policy, Terms of Service
├── packages/
│   ├── server/                   # Python 3.12 + FastAPI
│   │   ├── alembic.ini
│   │   ├── requirements.txt
│   │   ├── app/
│   │   │   ├── main.py           # FastAPI app and /api/health (exists)
│   │   │   ├── config.py         # pydantic-settings (exists)
│   │   │   ├── database.py       # engine, SessionLocal, get_db (exists)
│   │   │   ├── models.py         # User, AuthSession (exists)
│   │   │   ├── schemas.py        # request/response schemas (exists)
│   │   │   ├── security.py       # Argon2id (exists)
│   │   │   ├── routers/          # planned: auth, users, friends, content, ...
│   │   │   ├── services/         # planned: transactions and domain rules
│   │   │   └── dependencies/     # planned: current user and role checks
│   │   ├── migrations/           # Alembic revisions
│   │   └── tests/                # pytest: database, security, routes
│   └── web/                      # React 19 + TypeScript + Vite
│       └── src/
│           ├── main.tsx          # React root (exists)
│           ├── App.tsx           # bootstrap shell (exists)
│           ├── pages/            # planned: Feed, Profile, Communities, Blog, ...
│           ├── components/       # planned: design system (10+ reusable)
│           ├── stores/           # planned: Zustand auth and UI stores
│           ├── lib/              # planned: API client, WebSocket client
│           └── router/           # planned: React Router routes and guards
```

The backend foundation and the React shell follow this layout. Domain routers,
services, the full Compose stack and Caddy configuration are Week 1 deliverables.

---

## 4. Architecture

The backend is a **modular monolith**: one deployable service, one database, and
strict package boundaries per business domain.

```
Browser (React SPA)
   │  HTTPS / REST                 WSS (planned)
   ▼                                 ▼
Caddy (planned) ──▶ FastAPI / Uvicorn ──▶ PostgreSQL
                         │
                         ├── auth / users / friends
                         ├── communities / content
                         ├── events / marketplace
                         ├── notifications / media
                         ├── search
                         └── WebSocket hub (planned)
```

### 4.1 Why a monolith

Event RSVP capacity, permissions, notifications and community membership need to
agree. Keeping one application and one database lets those operations share a
transaction. Microservices would add deployment, cross-service authentication and
debugging work without a product benefit at this scale.

### 4.2 Communication

| Path | Used for |
|---|---|
| **REST** | Registration, profile and admin CRUD, content publication, search, RSVP, message history |
| **WebSocket** | New messages, notifications, presence and reconnect events |
| **PostgreSQL** | The authoritative business state |

WebSocket delivery is **not** the record of truth. If a message or notification
is pushed while the user is offline, the persisted row is what they see on
reconnect. A single WebSocket connection carries all real-time domains; the
message envelope identifies the domain.

### 4.3 Content modelling

A shared `Content` row stores what every item has in common: author, optional
community, content type, visibility and publication time. `Post`, `Article`,
`Event` and `Listing` store their own business fields. Feed, comments, reactions
and attachments then work uniformly without forcing event registration and
marketplace sales into one business model.

This decision is confirmed in Week 1 against real query and permission
complexity. If the shared layer makes either harder, the domain tables stay
separate.

### 4.4 Permissions

Three independent layers:

| Layer | Roles / relationships | Scope |
|---|---|---|
| Platform | `ADMIN`, `MODERATOR`, `USER` | Platform users, roles and content |
| Community | `OWNER`, `MEMBER` | One community, its members and its content |
| Content ownership | Author, seller, organiser | The resources the user owns |

Every restricted operation goes through a server-side authorisation check.
Hiding a button is never treated as access control. Search results, message
history and file downloads reuse the same checks as normal reads.

### 4.5 Consistency and concurrency

- Event capacity is enforced with a transaction and a database constraint or row
  lock. Two simultaneous RSVPs for the last seat produce exactly one success.
- Friend requests are unique per pair and idempotent; accepting a request creates
  the friendship in the same transaction.
- Content publication, notification creation and feed visibility are written
  together so a notification never points at a missing row.
- Unique constraints protect usernames, emails, OAuth subject IDs, community
  memberships, event participants and conversation membership.

### 4.6 Real-time and reconnect

- One WebSocket connection per tab, registered against the authenticated user.
- Presence is per user, not per socket: closing one of several tabs does not mark
  the user offline.
- Messages and notifications are persisted first, then pushed.
- On reconnect the client requests the latest sequence/cursor per conversation
  and fetches missed notifications; it does not rely on a replay buffer.
- A slow consumer is dropped rather than allowed to block the hub.

### 4.7 Media

- Uploads are validated on both sides: size, extension and magic bytes; never
  trust the client MIME type.
- Files are stored outside the web root under random names.
- Access to restricted attachments is served through an authorised route.
- Replacing or deleting content deletes or orphans its metadata deliberately,
  never silently leaves a public file behind.

---

## 5. Data model

The full schema, constraints and migration workflow live in
[`docs/data-model.md`](docs/data-model.md). Summary:

| Domain | Core entities | Status |
|---|---|---|
| Users and relationships | `User`, `AuthSession`, `OAuthAccount`, `FriendRequest`, `Friendship` | `User` + `AuthSession` implemented; rest planned |
| Communities | `Community`, `CommunityMember` | planned |
| Content | `Content`, `Post`, `Article`, `Comment`, `Reaction` | planned |
| Events | `Event`, `EventParticipant` | planned |
| Marketplace | `Listing` | planned |
| Chat | `Conversation`, `ConversationMember`, `Message` | planned |
| Files | `MediaFile`, `ContentAttachment` | planned |
| Notifications | `Notification` | planned |

Implemented tables keep snake_case column names. The registration contract is
already enforced in `packages/server/app/schemas.py`: password 15–128 characters,
username 3–50 matching `^[A-Za-z0-9_]+$`, email normalised to lowercase. The
React client maps backend snake_case DTOs to camelCase domain models.

Indexes cover every foreign key and every column used in a filter or sort:
`content.published_at`, `content.visibility`, `listing.status`,
`listing.category`, `listing.price_cents`, `event.starts_at`,
`notification.recipient_id + read_at`, `message.conversation_id + created_at`.

---

## 6. Module plan

### 6.1 Committed — 18 points (6 Major + 6 Minor)

| # | Area | Module | Pts | Lead | Depends on |
|---|---|---|---|---|---|
| 1 | Web | Major — frontend and backend frameworks | 2 | A + B | W1 |
| 2 | Web | Major — real-time features (chat, notifications, presence, reconnect) | 2 | C | 1, W2 |
| 3 | User | Major — user interaction (profiles, friends, basic DMs) | 2 | A + C | 1, W2 |
| 4 | User | Major — standard user management (profile, avatar, friends, online status) | 2 | A + B | 1, W2 |
| 5 | User | Major — organization system (communities) | 2 | D | 1, W4 |
| 6 | User | Major — advanced permissions (platform, community, ownership) | 2 | B | 1, W4 |
| 7 | Web | Minor — ORM | 1 | B | 1, W1 |
| 8 | User | Minor — notification system | 1 | C | 2, W2 |
| 9 | Web | Minor — advanced search (keywords, filters, sort, pagination, visibility) | 1 | E | 4, W5 |
| 10 | Web | Minor — file upload and management | 1 | B | 1, W3 |
| 11 | Web | Minor — custom design system (10+ reusable components) | 1 | A | 1, W1–W3 |
| 12 | User | Minor — OAuth 2.0 (one external provider) | 1 | B | 1, W4 |

### 6.2 Scoring boundaries

The 18-point configuration lists two overlapping majors. Both must be
demonstrated in full:

- **User interaction (#3)** covers public profiles, the friend graph and basic
  one-to-one messaging.
- **Standard user management (#4)** covers registration/login, profile editing,
  avatar with a default, friends list and online status.
- **Organization system (#5)** covers community lifecycle, membership and
  community roles.
- **Advanced permissions (#6)** requires platform-wide user CRUD and role
  management. Editing your own post is ownership, not this module.
- Blog, Events and Marketplace are product features and do not add points in this
  configuration.
- Advanced chat (group chat, calls), AI and game modules are **not** part of the
  18 points.

### 6.3 Cut order (if behind schedule)

`#12 OAuth → #9 advanced search → #11 design-system extras`

The 18 claimed points leave four points above the 14-point requirement. Cut only
minors, and only after the core social loop works.

**Never cut:** #1 frameworks, #2 real-time, #3 user interaction, #4 user
management, #5 communities, #6 permissions, #10 file upload. These carry the
product, the Julie journey and the permission story; a partial major scores zero.

### 6.4 Definition of Done — per module, non-negotiable

An incomplete module scores **zero**. Every module must satisfy all six:

1. [ ] Runs from a clean `docker compose up --build` with no manual patches
2. [ ] Zero errors **and zero warnings** in the browser console
3. [ ] Validated on the frontend **and** the backend
4. [ ] Tested by a **second** team member, not just the author
5. [ ] README section + demo script of ≤5 steps in `docs/module-claims.md`
6. [ ] Merged to `main` via PR with at least one approving review

---

## 7. Roles and responsibilities

| Member | Development responsibility | Project role | Weeks |
|---|---|---|---|
| **A — Jiyan** | Frontend architecture, shared UI, design system, Profile, Feed, Blog UI and frontend integration | Product Owner + Developer | 1–6 |
| **B** | Backend foundation, auth, database, files, platform permissions, OAuth, deployment | Technical Lead + Developer | 1–6 |
| **C** | Friends, chat, presence, notifications, reconnect recovery | Project Manager / Scrum Master + Developer | 1–6 |
| **D** | Communities, member management, community content, Events integration | Developer | 4–6 |
| **E** | Marketplace, unified search, filters, sorting, pagination, contact seller | Developer | 4–6 |

### 7.1 Duties beyond code

- **A** — owns the backlog and its priority order; validates finished work
  against the design; is the single point of contact for evaluators.
- **B** — owns the architecture and this document; reviews every PR touching
  auth, permissions, storage or deployment; owns the Docker/HTTPS/CI pipeline.
- **C** — runs the weekly meeting, keeps the milestone board honest, maintains
  documentation and owns the legal-page deadline.
- **D** — owns community and event integration; contributes to the test suite and
  the demo rehearsal.
- **E** — owns marketplace and search; contributes to the end-to-end demo and
  search-permission checks.

### 7.2 Collaboration boundaries

- **A does not own all pages.** C, D and E implement the interfaces for their own
  domains using A's shared components.
- **B does not own all endpoints.** Each domain owner implements their handlers,
  migrations and tests against B's conventions.
- **C provides the notification mechanism.** Domain owners define triggers and
  recipient rules.
- **E provides unified search.** Domain owners provide visibility rules and query
  support.
- A, B and C keep the shared foundation running and help D/E ramp up in Week 4.
- Every module is developed by its owner and tested by a different member.

### 7.3 Working method

- Branch naming: `feat/communities-membership`, `fix/event-capacity-race`.
- Conventional Commits, scoped: `feat(events): enforce capacity in one transaction`.
  The git history is an evaluated deliverable.
- PR template: what it changes, which module it advances, how it was tested and
  which Definition-of-Done items are satisfied.
- Branch protection on `main`: one approval, green CI, no force pushes.
- Weekly 45-minute sync (C facilitates); decisions recorded as ADRs.
- End-of-week retro: what slipped, and does the cut order change?

---

## 8. Milestones

Weeks are relative: **Week 1 = shared foundation.** Dates are anchored once the
kickoff date is fixed.

### Week 1 — Shared foundation (A, B, C)

- Agree stack, repository layout, database schema and API contracts.
- PostgreSQL in `compose.db.yml`; full Compose stack with API, web and Caddy
  (dev and prod profiles) is the remaining foundation work.
- First migration exists; add seed script; `.env.example`; `.env` verified ignored.
- Auth foundation: registration schemas, Argon2id hashing and session model exist;
  registration, login, logout and session handling still need implementation.
- React page shell, routing, shared components and design tokens.
- README, PLAN, architecture, protocol, module claims and the data-model document
  aligned with React + FastAPI.

*Exit criteria: everyone can start the environment; two users can register and
log in through the UI; data persists across a restart; CI is green.*

### Week 2 — Social loop (A, B, C)

- Profile read/update, avatar upload and default avatar.
- Image posts, comments, likes.
- Friend requests: send, accept, reject, remove.
- One-to-one direct messages with persisted history and unread counts.
- Online status and the first real-time notifications.

*Exit criteria: two users become friends, publish a photo, comment, chat and
receive a notification; the flow survives a page reload.*

### Week 3 — Core stability and handover (A, B, C)

- Blog: Markdown editor, preview, drafts, publish, edit, delete.
- Complete file management: validation, progress, preview, access control,
  delete and replace.
- Design system consolidation: at least 10 reusable components.
- Real-time recovery: reconnect, missed messages, multi-tab presence.
- Start the event backend early: schema, CRUD, RSVP foundation.
- Prepare D/E interfaces, components, sample data and task packs.

*Exit criteria: core flows are demoable; D and E can start Week 4 without waiting
for contracts or scaffolding.*

### Week 4 — Five in parallel (all)

- D: community CRUD, membership, community roles, community posts.
- E: listing publish, browse, edit, delete, images, sale status, filters/sort/page.
- A/B/C: OAuth, platform user and role administration, core polish.
- A/B/C pair with D/E on integration.

*Exit criteria: community and listing flows run end to end; OAuth and platform
role management are usable.*

### Week 5 — Integration (all)

- Community events, RSVP, reschedule/cancel notifications and capacity checks.
- Unified search across users, content, communities, events and listings.
- Notification coverage for all triggers and notification settings.
- Share-to-feed from blog, event and marketplace creation.
- Seller contact opens a direct conversation with the listing attached.
- **Feature freeze at the end of the week.**

*Exit criteria: all 12 scoring modules are demoable; every module has a demo
script and a second-member test.*

### Week 6 — Delivery (all)

- Permissions, concurrency, reconnect, file and browser checks.
- Responsive and accessibility pass; console-warning sweep.
- Deployment verification from a clean clone.
- Privacy Policy and Terms of Service with real, product-specific content.
- README final pass and full demo rehearsal with timing.

*Exit criteria: a stable release candidate; all five members can explain the
project and their own contribution.*

---

## 9. Risk register

| # | Risk | Impact | Likelihood | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | D/E ramp-up stalls in Week 4 | High — two majors slip | High | Interfaces, components, sample data and task packs ready by end of Week 3; A/B/C pair during Week 4 | A |
| R2 | Permission leak through search, chat or file routes | **Critical** — security failure | Medium | Central authorisation helpers; negative tests per role; search and media reuse read checks | B |
| R3 | Event capacity race (two users, last seat) | High — data integrity | Medium | Transaction + row lock/constraint; explicit concurrency test | D |
| R4 | Reconnect or multi-tab presence inconsistency | High — kills real-time module | Medium | Persist first, push second; cursor-based catch-up; per-user connection registry | C |
| R5 | File upload attack (MIME spoofing, path traversal) | High — security | Low | Magic-byte validation, random storage keys, size limits, authorised download route | B |
| R6 | OAuth provider integration delays Week 4 | Medium | Medium | Isolate the provider behind one interface; email/password remains fully functional; cut OAuth if needed | B |
| R7 | Marketplace scope creep into payments/orders | Medium — schedule | Medium | Non-goals are explicit; "contact seller" is the v1 transaction boundary | E |
| R8 | Legal pages left to the end → rejection | **Critical — project rejected** | Medium | Hard Week 6 deadline; C tracks it as its own milestone; A and C sign off | C |
| R9 | Git history does not show five contributors | High — evaluated | Low | Each member commits under their own account; cross-review so history is interleaved | C |
| R10 | A module is "almost done" and scores zero | High | Medium | Definition-of-Done gate; demo rehearsal; cut minor scope rather than ship partial majors | C |
| R11 | Feed/search slow as seed data grows | Medium | Low | Pagination from day one; indexes from §5; query review in Week 5 | E |
| R12 | Documentation and config drift from the implementation | Medium | Medium | Treat docs and config as part of each PR; review the protocol before handlers; keep module evidence current | A |

---

## 10. Spec compliance checklist

| Requirement | How it is met | Verified in |
|---|---|---|
| Web app: frontend + backend + database | React 19 SPA · FastAPI API · PostgreSQL | Week 1 |
| Frontend and backend frameworks | React 19 + Vite; Python 3.12 + FastAPI | Week 1 |
| Git with clear commits from all members | Conventional Commits, one-review PR rule, protected `main` | §7.3 |
| Single-command containerised deployment | `docker compose up --build` | Week 1 |
| Latest stable Chrome | Vite build targets modern browsers | Week 6 |
| No console warnings or errors | Playwright smoke run checks console output | Week 6 |
| Privacy Policy + Terms of Service | Footer routes, real product-specific content | Week 6 |
| Multi-user and concurrency support | Transactions, constraints, WebSocket hub, presence | Weeks 2–5 |
| Responsive, accessible frontend | Tailwind responsive layout, keyboard/focus/contrast pass | Week 6 |
| CSS framework | Tailwind CSS | Week 1 |
| Secrets in ignored `.env` + `.env.example` | Template committed, real values ignored | Week 1 |
| Clear schema with relations | §5, migrations in Week 1 | Week 1 |
| Secure signup/login | Hashed + salted passwords, server-issued sessions | Week 1 |
| Frontend **and** backend input validation | Shared validation rules and boundary checks | Weeks 1–5 |
| HTTPS everywhere | Caddy with automatic certificates and HTTP→HTTPS redirect | Week 1 |
| At least 14 module points | 18 committed points, §6 | Weeks 1–5 |
| ORM | SQLAlchemy 2.0 models, Alembic migrations and relations | Week 1 |
| Real-time features | WebSocket chat, notifications, presence, reconnect | Weeks 2–3 |
| File upload management | Validation, preview, progress, access control, delete/replace | Week 3 |
| Advanced search | Keywords, filters, sorting, pagination, visibility checks | Week 5 |
| OAuth 2.0 | One external provider alongside email/password | Week 4 |
| Notification system | Persistent centre covering create/update/delete triggers | Weeks 2–5 |
| Custom design system | 10+ reusable components with shared tokens | Weeks 1–3 |
| Organization system | User-created and managed communities | Week 4 |

---

## 11. Open decisions

1. **Kickoff date** — anchors Weeks 1–6 to real calendar dates.
2. **OAuth provider** — 42 Intra, GitHub or Google. Choose one that can be
   demonstrated without a private account.
3. **Shared `Content` table** — confirm in Week 1 whether the shared layer
   simplifies Feed, comments and permissions or should be split per domain.
4. **Deletion policy** — hard delete versus soft delete for posts, articles and
   listings; affects retention statements in the Privacy Policy.
5. **Upload limits** — per-file size, allowed extensions and per-user quota.
6. **Notification defaults** — which events are on by default, and whether users
   can mute a community or a conversation.
7. **Moderation scope** — report, hide and ban are not claimed modules; decide
   whether moderators get a minimal hide/remove capability in Week 5.
8. **D/E task packs** — exact first tickets for Communities and Marketplace, ready
   by the end of Week 3.
