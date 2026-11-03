# Sprint 1 — Shared Foundation (Week 1)

**Modules advanced:** #1 frameworks (Major), #7 ORM (Minor), #11 design system
(Minor), #4 user management (start)
**Owners:** A, B, C
**Duration:** Week 1
**Status:** in progress

This plan supersedes the earlier sprint plan from the previous project direction.
The product is the Community &
Content Platform described in [`../Project design.pdf`](../Project%20design.pdf),
[`../README.md`](../README.md) and [`../PLAN.md`](../PLAN.md).

---

## Goal

By the end of Week 1 the team has one runnable, HTTPS-served application with a
shared layout, authentication, a migrated PostgreSQL schema and a stable API
contract. Two users can register and sign in through the UI, and their data
survives a restart.

This is a foundation sprint, not a feature sprint. The social loop starts in
Week 2.

---

## Scope

### In scope

- Repository layout and package boundaries for Go and Vue.
- Docker Compose: PostgreSQL, Go API, Vue web, Caddy.
- GORM models, first migration and seed data.
- Email/password registration, login, logout and session handling.
- App shell: header, navigation, footer, route placeholders, responsive layout.
- Shared design tokens and the first reusable components.
- Health endpoint, structured errors, request logging, CORS.
- CI: Go vet/test, Vue typecheck/lint/test/build.
- Updated README, PLAN, `.env.example`, Makefile, protocol and module claims.

### Out of scope

- Posts, comments, friends, chat, communities, events, marketplace.
- OAuth, platform role administration and notifications.
- File uploads beyond the avatar contract.
- Final legal text (drafted in Week 6).

---

## Workstreams

### A — Frontend foundation

| # | Task | Output |
|---|---|---|
| A1 | Confirm Vue 3 + TypeScript + Vite + Pinia + Vue Router | Working dev server |
| A2 | Build the app shell: header, primary navigation, footer, responsive container | `App.vue` |
| A3 | Add routes for Feed, Profile, Friends, Communities, Blog, Events, Marketplace, Messages, Notifications, Search, Admin, Login, Legal | `router/index.ts` |
| A4 | Define design tokens: colour, typography, spacing, radius, focus ring | Tailwind config + CSS variables |
| A5 | Build the first 10 reusable components (button, input, textarea, form field, card, avatar, badge, tabs, modal, empty state) | `components/` |
| A6 | Build sign-in and registration screens against the API contract | `views/auth/` |
| A7 | Add an API client with typed errors, request IDs and session handling | `lib/api.ts` |
| A8 | Add a WebSocket client skeleton: connect, reconnect, typed envelope | `lib/ws.ts` |
| A9 | Add auth and guest route guards | Router middleware |

**Acceptance:** the app starts, all routes render, the shell is responsive, the
auth screens submit to the API and the browser console is clean.

### B — Backend and data foundation

| # | Task | Output |
|---|---|---|
| B1 | Establish the Go package layout from `docs/architecture.md` §3 | `internal/` packages |
| B2 | Configuration loader: env parsing, required-secret checks, safe defaults | `internal/config/` |
| B3 | PostgreSQL connection, pool limits and health check | `internal/storage/` |
| B4 | GORM models for `User`, `Session`, `OAuthAccount`, `FriendRequest`, `Friendship` | models + relations |
| B5 | First migration and seed script | `make migrate`, `make seed` |
| B6 | Registration, login, logout, refresh and `GET /api/auth/me` | `internal/auth/` |
| B7 | Password hashing (argon2id or bcrypt), session revocation, secure cookies | auth tests |
| B8 | Echo middleware: request ID, structured logging, recovery, CORS, auth | `internal/handler/` |
| B9 | Stable error shape and input validation helpers | `internal/handler/errors.go` |
| B10 | Expand `/api/health` and add `/api/status` dependency checks | handler + tests |
| B11 | Dockerfiles, Compose services and Caddy configuration | `docker-compose.yml` |

**Acceptance:** `docker compose up --build` starts the stack; the schema migrates;
two users register and log in; `/api/health` and `/api/status` respond; auth tests
pass.

### C — Integration, quality and handover

| # | Task | Output |
|---|---|---|
| C1 | Repository hygiene: remove obsolete files and stale config | clean tree |
| C2 | CI workflow: Go vet/test, Vue lint/typecheck/test/build | green CI |
| C3 | Pin the API and WebSocket contracts in `docs/protocol.md` | reviewed contract |
| C4 | Seed demo accounts and sample communities/content for Weeks 2–5 | `seed` data |
| C5 | Prepare D/E task packs: interfaces, routes, components, sample data | `docs/` + Jira tickets |
| C6 | Legal page structure and footer links | placeholder routes |
| C7 | Definition-of-Done checklist per module | `docs/module-claims.md` |
| C8 | Week 1 demo rehearsal | recorded flow |

**Acceptance:** CI is green on `main`; D and E can start Week 4 work without
waiting for contracts or sample data; the demo runs from a clean clone.

---

## Deliverables

| Deliverable | Owner | Evidence |
|---|---|---|
| Runnable Compose stack with HTTPS | B | `docker-compose.yml`, Caddy config |
| Database schema and first migration | B | GORM models, migration files |
| Registration and login | A + B | UI screens, auth handlers, tests |
| App shell and route scaffold | A | `packages/web/src/` |
| 10 reusable components | A | `packages/web/src/components/` |
| API contract draft | C | `docs/protocol.md` |
| CI pipeline | C | `.github/workflows/ci.yml` |
| Updated project documentation | A + C | README, PLAN, this file |
| D/E task packs | C | tickets and sample data |

---

## Exit criteria

1. `docker compose up --build` works from a clean clone with only `.env` filled in.
2. Two users register, log in, reload and remain logged in.
3. `/api/health` returns `200`; `/api/status` reports the database.
4. `make test`, `make lint` and `make typecheck` pass locally and in CI.
5. Every route in the app shell renders without console errors or warnings.
6. D and E have written tasks, interfaces and sample data for Week 4.
7. The obsolete documentation, configuration and UI are gone from `main`.

---

## Suggested day plan

| Day | A | B | C |
|---|---|---|---|
| 1 | App shell and routing | Package layout, config | Repo hygiene, CI skeleton |
| 2 | Design tokens and components | DB connection, GORM models | Contract review, seed plan |
| 3 | Auth screens | Auth handlers and sessions | CI: Go and Vue checks |
| 4 | API client and guards | Error shape, middleware | Protocol update |
| 5 | WS client skeleton | Compose, Caddy, health/status | Seed data and task packs |
| 6 | Integration fixes | Integration fixes | Negative permission tests |
| 7 | Demo rehearsal | Demo rehearsal | Demo rehearsal and retro |

---

## Dependencies and risks

| Risk | Mitigation | Owner |
|---|---|---|
| Compose/Caddy blocks local work | Run Go and Vite directly until Compose lands | B |
| Auth contract drifts between Vue and Go | `docs/protocol.md` is the single source; review both sides | C |
| Design system becomes a side project | Only the 10 components needed by Week 2 | A |
| Docker on every laptop differs | Pin image versions; document prerequisites | B |
| Scope creeps into social features | Week 1 exit criteria are auth + shell + schema only | C |
| D/E idle in Week 4 | Task packs and sample data are a Week 1 deliverable | C |

---

## Handover to Week 2

Week 2 starts only when the exit criteria are met. The Week 2 team builds on:

- the session and role model from B,
- the app shell, API client and components from A,
- the protocol, seed data and test conventions from C.

Week 2 scope: profile and avatar, image posts, comments and likes, friend
requests, direct messages, online status and basic notifications.
