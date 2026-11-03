# ft_transcendence — Community & Content Platform

A social platform where people share photos and long-form writing, build friend
networks and interest communities, organise real-world events, and trade
second-hand gear in a lightweight marketplace. Accounts come with a unified feed,
real-time chat and notifications, full-text search, and role-based administration.

> **Status:** early development — Week 1 (foundation). Module claims are locked;
> this README and the per-module evidence are updated as each module is completed.

---

## Table of contents

- [Product scope](#product-scope)
- [Core user journey](#core-user-journey)
- [Modules claimed](#modules-claimed)
- [Feature design](#feature-design)
- [Permissions model](#permissions-model)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Data model](#data-model)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Delivery plan](#delivery-plan)
- [Demo](#demo)
- [Documentation](#documentation)
- [Subject compliance](#subject-compliance)
- [Legal](#legal)

---

## Product scope

The platform is organised around **channels** (top-level feature entries) and
**communities** (user-created groups). A page on its own is not an organization
system; the Communities module is what provides user-created, user-managed groups.

| Page | What users can do | First-version scope |
|---|---|---|
| **Home / Feed** | Browse posts, photos, articles and shared events | Chronological; filters for All, Friends, My Communities |
| **Profile** | View personal information and published content | Avatar, bio, friends, online status, content list |
| **Friends** | Build the social graph | Send, accept and reject requests; remove friends |
| **Communities** | Create and join interest groups | Description, member management, community posts and events |
| **Blog** | Publish longer articles | Title, cover, body, tags, draft and publish |
| **Events** | Create events and RSVP | Time, place, capacity, RSVP, edit and cancel |
| **Marketplace** | Publish and browse second-hand items | Images, price, category, condition, sale status, contact seller |
| **Messages** | Real-time conversations | One-to-one chat, message history, unread counts |
| **Notifications** | See changes that concern you | Friend requests, reactions, community and event notifications |
| **Search** | Find content and people | Keywords, filters, sorting, pagination |
| **Administration** | Manage users and content by role | Admins view, edit and delete users and assign roles; moderators manage content; regular users cannot enter admin pages |
| **Settings / Legal** | Manage the account and read the policies | Profile and account settings, Privacy Policy and Terms of Service |

Images are introduced through the flows that need them first: avatars, post
images, blog covers, event covers and listing photos. A standalone gallery is
deferred; a **Photos** tab on the profile is enough for the first version.

Terminology:

- **Channel** — a platform feature entry point: Feed, Blog, Events, Marketplace.
- **Community / Group** — a user-created and user-joined group: Photography,
  42 Students, Music.

---

## Core user journey

1. Julie registers and completes her avatar and bio.
2. She joins the **Photography** community.
3. She publishes a photo to her profile and the feed.
4. She reads a friend's **Blog** article.
5. She RSVPs to a weekend photo walk on **Events**.
6. The organiser reschedules; Julie receives a **Notification**.
7. She finds a used lens in the **Marketplace**.
8. She messages the seller and arranges the handover.

This journey is the acceptance thread for the first five weeks: every module has
to support it end to end.

---

## Modules claimed

**18 points — 6 Major + 6 Minor.**

| # | Area | Module | Points | Lead | Status |
|---|---|---|---|---|---|
| 1 | Web | Major — frontend and backend frameworks | 2 | A + B | 🔄 scaffold |
| 2 | Web | Major — real-time features | 2 | C | ⬜ |
| 3 | User | Major — user interaction (profiles, friends, basic DMs) | 2 | A + C | ⬜ |
| 4 | User | Major — standard user management | 2 | A + B | ⬜ |
| 5 | User | Major — organization system (communities) | 2 | D | ⬜ |
| 6 | User | Major — advanced permissions | 2 | B | ⬜ |
| 7 | Web | Minor — ORM | 1 | B | ⬜ |
| 8 | User | Minor — notification system | 1 | C | ⬜ |
| 9 | Web | Minor — advanced search | 1 | E | ⬜ |
| 10 | Web | Minor — file upload and management | 1 | B | ⬜ |
| 11 | Web | Minor — custom design system | 1 | A | ⬜ |
| 12 | User | Minor — OAuth 2.0 authentication | 1 | B | ⬜ |

> **Scoring boundaries:** #3 (user interaction) and #4 (standard user management)
> overlap but must both be demonstrated in full. #6 (advanced permissions) requires
> platform-wide user CRUD and role management; editing your own post is ownership,
> not this module. Blog, Events and Marketplace are product features, not extra
> points, and advanced chat/AI/game modules are outside the 18-point total.

Module evidence and demo scripts live in
[`docs/module-claims.md`](docs/module-claims.md). A module is only marked done
when it is demonstrable from a clean start, validated on both sides, tested by a
member other than its author, documented, and merged through a reviewed PR.

---

## Feature design

The first version is a **social core + Communities + Blog + Events + a lightweight
Marketplace**. Images, chat, search and notifications are shared capabilities that
cut across the whole product.

### Feed

The home page is the unified browsing entry point while preserving the character
of each content type:

- **Post:** text, images, likes, comments.
- **Article:** cover, title and summary; click through to the full text.
- **Event:** date, place and RSVP state.
- **Listing:** item image, price and sale state.

Posts, articles, events and listings are ordered chronologically in the first
version. When a user creates an article, event or listing they may choose to
**share it to the feed**; this keeps the feed rich without every edit of a listing
spamming it. Filters: All, Friends, My Communities.

### Blog

- Editor: Markdown with preview. If HTML or rich text is added later, untrusted
  content must be sanitised before rendering.
- Lifecycle: draft → publish → edit → delete.
- Fields: title, summary, cover, body and tags.
- Readers can comment and like; the author's profile is one click away.
- Drafts are visible only to their author.

### Events

- Fields: organiser, optional community, title, description, cover, location,
  start and end time, optional capacity.
- RSVP: **Going** / **Cancel RSVP** only in v1. Waitlists, recurring events,
  ticketing and external calendar sync are later work.
- Status: `Upcoming`, `Cancelled`, `Completed`.
- Capacity is enforced **by the backend**: when one seat remains and two users
  RSVP simultaneously, exactly one succeeds.
- When the organiser changes the time or place, or cancels, every attendee is
  notified.

### Marketplace

A community classifieds board, not a shop:

- Sellers publish, edit and delete listings.
- Multiple images, price, category, condition and description.
- Status: `Available`, `Reserved`, `Sold`.
- Search by category, price and publication time.
- **Contact seller** opens a direct conversation with the listing attached.
- Out of scope in v1: payment, shipping, refunds, orders and transaction reviews.
  These bring a second business domain; listings plus direct messages already
  cover the contact-and-trade scenario.

### Communities

- Users create, edit and delete their own communities.
- Join and leave; owners add and remove members.
- Community description, member list, community posts and community events.
- Community membership is an authorisation input, not just a label: community-only
  content is checked on the server.

### Friends, chat and presence

- Friend requests: send, accept, reject, remove.
- One-to-one real-time chat with persisted history and unread counts.
- Online status and connection recovery after a dropped socket or a closed tab.
- Multiple tabs per user share a consistent presence and message state.

### Notifications

A persistent notification centre, not an ephemeral toast. Notifications are
created for:

| Trigger | Recipient |
|---|---|
| Friend request received / accepted | The other user |
| Comment or like on content | The content author |
| Added to / removed from a community | The member |
| Attending event modified / cancelled | Attendees |
| New event in a followed community | Members according to their notification settings |

### Search

- Keyword search with filters, sorting and pagination.
- Result visibility follows the same permission rules as normal reads: private
  conversations and restricted community content never leak through search.
- One unified entry point reuses each domain's query layer.

### Media

Images are used for avatars, posts, blog covers, event covers and listing photos;
PDFs are used for community resources and event attachments.

- File type, size and format validated on **both** frontend and backend.
- Upload progress and preview where applicable.
- Access checks for restricted files.
- Delete and replace.
- Durable storage (Docker volume) plus file metadata in PostgreSQL.

### Guests and unauthenticated users

Unauthenticated visitors may browse public content. Any write action, private
conversation, membership-only content or restricted attachment requires a
verified session. The backend enforces this on every request.

---

## Permissions model

Three independent layers:

| Layer | Roles / relationships | Allowed operations |
|---|---|---|
| **Platform** | Admin, Moderator, User | Manage platform users, roles and content |
| **Community** | Community Owner, Member | Manage a specific community, its members and its content |
| **Content ownership** | Author, seller, event organiser | Edit and delete the resources they own |

Rules:

- Platform roles are assigned by an Admin and never by self-service.
- A community owner's powers stop at that community.
- Content ownership never overrides a platform or community restriction.
- **Every restricted operation is checked in the backend.** Hiding a button in
  the UI is not access control.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + TypeScript + Vite |
| Routing and state | Vue Router + Pinia |
| Styling | Tailwind CSS plus a custom component library (at least 10 reusable components) |
| Backend | Go + Echo |
| Database | PostgreSQL 16 |
| Data access | GORM |
| Real-time | Native JSON WebSocket |
| File storage | Docker persistent volume; metadata in PostgreSQL |
| Reverse proxy | Caddy, single HTTPS entry point |
| Runtime | Docker Compose, one command to start |
| Testing | Go `testing`, Vitest, Playwright smoke tests |

> The design document proposed React or Go/Python options; the implementation
> scaffold uses **Vue 3 + TypeScript** and **Go + Echo**. The product design is
> unchanged.

---

## Architecture

The backend is a **modular monolith**. Business capabilities are separated by
domain inside one deployable service:

```
auth / users / friends / communities / content / events /
marketplace / chat / notifications / media / search
```

Keeping one application and one database means event capacity, permissions and
notifications can be coordinated in a single transaction. Microservices at this
stage would add deployment, cross-service authentication and debugging work
without a product benefit.

### Communication

| Path | Used for |
|---|---|
| **REST** | Registration, content CRUD, search, RSVP, message history, profile and admin operations |
| **WebSocket** | New messages, notifications, presence and other push events |
| **PostgreSQL** | The authoritative business state |

WebSocket delivery is **not** the record of truth. If a message or notification is
sent while a user is offline, the persisted row is what they see when they
reconnect.

### Content modelling

A shared `Content` layer stores what every item has in common — author, optional
community, content type, visibility and publication time. `Article`, `Event` and
`Listing` then store their own business fields. This lets Feed, comments,
reactions and attachments work uniformly without forcing event registration and
marketplace sales into one business model.

The shared layer is confirmed in Week 1 against real query and permission
complexity; if it makes either harder, the domain tables stay separate.

### Frontend

The SPA talks to the API over HTTPS and to the WebSocket over WSS. Server state
is fetched through REST; live events update the store. No domain rule is
duplicated on the client.

---

## Data model

| Domain | Core entities |
|---|---|
| Users and relationships | `User`, `Session`, `FriendRequest`, `Friendship`, `OAuthAccount` |
| Communities | `Community`, `CommunityMember` |
| Content | `Content`, `Post`, `Article`, `Comment`, `Reaction` |
| Events | `Event`, `EventParticipant` |
| Marketplace | `Listing` |
| Chat | `Conversation`, `ConversationMember`, `Message` |
| Files | `MediaFile`, `ContentAttachment` |
| Notifications | `Notification` |

Platform roles, OAuth account links and community roles are modelled explicitly.
The exact schema and indexes are finalised in Week 1 before feature work fans out.

---

## Getting started

### Prerequisites

- Docker and Docker Compose
- Go 1.26+ and Node.js 22+ (only for local development outside Docker)

### Run the whole stack

The target workflow — and a subject requirement — is a single command:

```bash
git clone <repository-url>
cd ft_transcendence
cp .env.example .env      # then edit the values
docker compose up --build
```

The app is served over HTTPS through Caddy.

> **Current scaffold:** the compose stack and Caddy configuration are landing in
> Week 1. Until then, run the two packages directly (below).

### Local development

```bash
# Backend — Go + Echo on :3000
cd packages/server
go run ./cmd/server

# Frontend — Vite dev server
cd packages/web
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:3000/api/health
```

### Useful commands

```bash
make up          # start the stack
make down        # stop the stack
make logs        # tail all service logs
make test        # run backend and frontend tests
make lint        # lint both packages
make typecheck   # type-check the frontend
```

### Environment variables

All secrets live in `.env`, which is git-ignored. [`.env.example`](.env.example)
documents the full set.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `APP_ENV` | Development or production mode |
| `API_PORT` / `WEB_PORT` | Backend and frontend ports |
| `CORS_ORIGIN` | Allowed frontend origin |
| `VITE_API_URL` / `VITE_WS_URL` | Frontend-facing API and WebSocket URLs |
| `SESSION_SECRET` / `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Session and token signing secrets |
| `OAUTH_PROVIDER` / `OAUTH_CLIENT_ID` / `OAUTH_CLIENT_SECRET` | External login provider |
| `OAUTH_REDIRECT_URL` | OAuth callback URL |
| `DOMAIN` / `TLS_EMAIL` | Caddy HTTPS configuration |
| `MAX_UPLOAD_SIZE_MB` / `UPLOAD_DIR` | Upload limit and durable storage path |
| `ALLOWED_IMAGE_TYPES` / `ALLOWED_DOCUMENT_TYPES` | Accepted image and PDF MIME types |
| `WS_READ_LIMIT_BYTES` / `WS_WRITE_TIMEOUT` / `PRESENCE_TTL` | WebSocket and presence limits |

`.env.example` is the committed template. Real values, OAuth secrets and the
database password never enter git.

---

## Project structure

```
ft_transcendence/
├── packages/
│   ├── server/                  # Go + Echo API, WebSocket, domain modules
│   │   ├── cmd/server/          # entry point
│   │   └── internal/
│   │       ├── auth/            # registration, sessions, OAuth
│   │       ├── users/           # profiles, avatars, roles
│   │       ├── friends/         # requests, friendships
│   │       ├── communities/     # groups, membership
│   │       ├── content/         # posts, articles, comments, reactions
│   │       ├── events/          # events, RSVP, capacity
│   │       ├── marketplace/     # listings
│   │       ├── chat/            # conversations, messages
│   │       ├── notifications/   # persistent notification centre
│   │       ├── media/           # uploads, attachments
│   │       ├── search/          # unified, permission-aware search
│   │       ├── realtime/        # WebSocket hub, presence
│   │       ├── storage/         # PostgreSQL, migrations, media metadata
│   │       └── handler/         # HTTP handlers and middleware
│   └── web/                     # Vue 3 + TypeScript + Vite
│       └── src/
│           ├── views/           # Feed, Profile, Communities, ...
│           ├── components/      # design-system components
│           ├── stores/          # Pinia stores
│           └── router/
├── docs/                        # architecture, protocol, module evidence, ADRs, legal
├── PLAN.md                      # delivery plan, milestones, risks
├── Makefile
├── .env.example
├── Project design.pdf           # product design: pages, scope, data model
└── Social Network.pdf           # 18-point module config, scoring boundaries, demo
```

The `docs/` tree mirrors this structure: architecture, protocol, module evidence,
sprint plans, decision records and legal pages.

---

## Delivery plan

Five developers, six weeks. A, B and C carry the shared foundation and stay on
integration; D and E join feature work in Week 4.

| Week | People | Main goal | Acceptance |
|---|---|---|---|
| **1 — Shared foundation** | A, B, C | Agree stack, repository layout, database and API contracts; page shell and authentication | Everyone can start the environment; two users can register and log in through the UI; data persists |
| **2 — Social loop** | A, B, C | Profile, image posts, comments and likes, friends, direct messages, basic notifications | Two users become friends, publish a photo, comment, chat and receive a notification |
| **3 — Core stability and handover** | A, B, C | Blog, complete file management, design system, realtime recovery; start the event backend early | Core flows are demoable; interfaces, components, sample data and task packs for D and E are ready |
| **4 — Five in parallel** | All | D builds communities, E builds the marketplace, A/B/C finish OAuth, platform roles and core polish | Community and listing flows run end to end; OAuth and platform role management are usable |
| **5 — Integration** | All | Community events, unified search, notification coverage, feed sharing and seller DMs | All 12 scoring modules are demoable; feature freeze at the end of the week |
| **6 — Delivery** | All | Permissions, concurrency, reconnect, files, browser and deployment checks; documentation and rehearsal | Release candidate runs reliably; all five members can explain the project and their contribution |

Work is split by **business domain and interface**, not by page:

- A owns product, frontend architecture and shared UI; C, D and E implement the
  interfaces for their own domains.
- B owns backend foundations and standards; each domain owner implements their own
  handlers, migrations and tests.
- C provides the notification mechanism; domain owners define triggers and
  recipients.
- E provides unified search; domain owners provide visibility rules and query
  support.

---

## Demo

The final demo uses **three accounts** — community admin, regular member and
non-member — in two browser windows. It follows the acceptance script from the
18-point configuration:

1. Alice registers, completes her profile and uploads an avatar.
2. Bob signs in through the external provider and accepts Alice's friend request.
3. Alice publishes a photo post; Bob comments; Alice receives a notification.
4. Alice and Bob exchange private messages and verify history after reconnecting.
5. Alice creates a community and adds Bob as a member.
6. Alice publishes a blog and creates a community event; Bob registers.
7. Alice changes the event time; Bob receives a persistent notification.
8. Bob publishes a marketplace listing; Alice finds it using filters, sorting and
   pagination, then contacts him through chat.
9. An administrator changes a user's role; a moderator demonstrates permitted
   content actions.
10. The team demonstrates image/PDF upload, progress, previews, access control and
    deletion.

---

## Documentation

| Document | Contents |
|---|---|
| [`Project design.pdf`](Project%20design.pdf) | Product design: pages, feature scope, data model, roles and weeks |
| [`Social Network.pdf`](Social%20Network.pdf) | 18-point module configuration, scoring boundaries, demo script and 3+3 delivery plan |
| [`PLAN.md`](PLAN.md) | Delivery plan, milestones, roles, risk register and compliance checklist |
| [`docs/architecture.md`](docs/architecture.md) | Architecture, domain boundaries, data model and deployment |
| [`docs/protocol.md`](docs/protocol.md) | REST and WebSocket contract |
| [`docs/module-claims.md`](docs/module-claims.md) | Per-module evidence and demo scripts |
| [`docs/sprint-1-plan.md`](docs/sprint-1-plan.md) | Week 1 foundation plan and exit criteria |
| [`docs/decisions/`](docs/decisions) | Architecture decision records |

---

## Subject compliance

The mandatory checklist is tracked explicitly:

- [ ] Frontend and backend input validation
- [ ] Secure password storage (argon2id or bcrypt)
- [ ] HTTPS everywhere
- [ ] Correct behaviour with multiple concurrent users
- [ ] Single-command container startup
- [ ] Valid Privacy Policy and Terms of Service, linked from the app
- [ ] English README
- [ ] Contribution record for all five members

Passwords are never stored in plaintext, and secrets are never committed. Each
member commits under their own GitHub account; `main` is protected by one
approving review and green CI.

---

## Legal

The application footer links to a Privacy Policy and Terms of Service. Both
describe the actual data collected, why it is stored, retention periods, who can
see it, marketplace and event disclaimers, and user rights.

- [Privacy Policy](docs/legal/privacy-policy.md)
- [Terms of Service](docs/legal/terms-of-service.md)
