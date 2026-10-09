# ft_transcendence — Project Plan

**Project:** Multiplayer Pong Arena
**Track:** 42 Heilbronn — Common Core, final project
**Team size:** 4
**Status:** pre-kickoff (W0)
**Target:** 17 committed module points (14 required) + 3 stretch points

---

## 1. Vision

A real-time multiplayer Pong platform where users register, build a profile, add
friends, see who is online, and play live matches — 1v1 across separate machines,
3+ free-for-all, or against an AI opponent — then compete in single-elimination
tournaments with persistent statistics and a leaderboard.

### Success criteria

1. `docker compose up` gives a working, HTTPS-served app with a seeded database.
2. Two people on two different laptops can play a smooth, fair match.
3. Every claimed module is demonstrable end-to-end in under 2 minutes each.
4. The browser console stays clean during normal use.
5. Every team member can explain the architecture and their own contributions.

### Non-goals (explicitly out of scope)

Payments, mobile-native apps, video/voice chat, SSR/SEO optimisation, public
developer API, blockchain, microservice decomposition. See §7 for why.

---

## 2. Technical stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript 5.x, strict | Shared types across client/server; no runtime type drift |
| Frontend | React 18 + Vite + Tailwind CSS | Required to claim the "framework" major module; fast HMR for game tuning |
| State (client) | Zustand + one `useRef` game-loop hook | Avoids re-render storms at 60 fps |
| Backend | NestJS on the Fastify adapter | Structured DI, guards (auth/roles), first-class Socket.IO gateways |
| Realtime | Socket.IO (WS + polling fallback) | Rooms, reconnection, ack/callback semantics for free |
| Database | PostgreSQL 16 | Required for real relations + transactions on match results |
| ORM | Prisma 5 | Migrations + typed queries; claims the ORM minor module |
| Auth | argon2id + JWT (short-lived access + rotating refresh) | Requirement: hashed + salted passwords |
| TLS | Caddy as reverse proxy, automatic HTTPS | "HTTPS everywhere" requirement, zero-config certs |
| Packaging | Docker Compose, multi-stage builds | Requirement: single-command deployment |
| i18n | react-i18next, 3 locales | Cheap 1-point stretch module |
| Tests | Vitest (unit) + Supertest (e2e) + Playwright (smoke, optional) | Headless engine test is mandatory (§5.2) |

### Why NestJS over bare Fastify

Four people, three of whom will touch the backend. NestJS gives module boundaries,
DI, and `@UseGuards` role checks that map directly onto the permissions and
user-management modules, plus a documented `WsException` filter for gateway errors.
The cost is decorators and a slower start; the benefit is that a junior can find
where to add an endpoint instead of guessing.

**Fallback:** if the team hits W2 and is struggling, the gateway and auth layers are
the only NestJS-specific code and can be ported to Fastify + TypeBox in ~2 days.

---

## 3. Repository layout

```
transcendence/
├── docker-compose.yml          # postgres, server, web, caddy
├── .env.example                # committed template; real .env git-ignored
├── Makefile                    # make dev / make seed / make logs
├── README.md                   # graded entry point (roles, modules, demo)
├── PLAN.md                     # this file
├── docs/
│   ├── architecture.md         # diagrams, data flow, socket protocol
│   ├── module-claims.md        # per-module evidence + demo script
│   └── decisions/              # ADRs: engine choice, sync model, stack
├── packages/
│   ├── shared/                 # zod schemas, tick types, game constants, event map
│   │   └── src/
│   ├── server/                 # NestJS + Prisma + Socket.IO
│   │   ├── prisma/schema.prisma
│   │   └── src/
│   │       ├── auth/           # signup, login, refresh, guards
│   │       ├── users/          # profile, avatar upload
│   │       ├── friends/        # requests, accept, presence
│   │       ├── game/           # PURE engine (no I/O) + game service
│   │       ├── gateway/        # Socket.IO namespaces: /lobby /game /chat
│   │       ├── tournament/     # registration, seeding, bracket
│   │       ├── ai/             # AI opponent policies
│   │       ├── stats/          # ratings, XP, achievements
│   │       └── health/         # /health, /api/status
│   └── web/                    # Vite React app
│       └── src/
│           ├── pages/          # login, lobby, game, profile, tournament, legal
│           ├── components/     # design system (10+ reusable)
│           ├── game/           # canvas renderer, interpolation, input capture
│           ├── i18n/           # en, de, fr
│           └── lib/            # api client, socket client, stores
```

---

## 4. Architecture

```
┌────────────┐  HTTPS/REST   ┌──────────────┐   WSS    ┌──────────────┐
│  Browser   │──────────────▶│ NestJS API   │◀────────▶│ Socket.IO    │
│  React SPA │               │ (Fastify)    │  rooms    │ gateways     │
└────────────┘               └──────┬───────┘           └──────┬───────┘
                                      │                          │
                                      │                   ┌──────▼───────┐
                                      │                   │ GameService  │
                                      │                   │ 60 Hz loop   │
                                      │                   │ rooms/players│
                                      │                   └──────┬───────┘
                                      │                          │
                                      │                   ┌──────▼───────┐
                                      │                   │ PURE ENGINE  │
                                      │                   │ step()       │
                                      │                   └──────────────┘
                                      │
                               ┌──────▼───────┐
                               │  PostgreSQL  │  Prisma
                               └──────────────┘
```

### 4.1 Trust model

The server is fully authoritative. Clients never send positions, scores, or
outcomes — only **input intents**. This is what makes anti-cheat, fairness in 3+
matches, and tournament integrity defensible during evaluation.

---

## 5. The game engine (the load-bearing decision)

### 5.1 Contract

One module, no imports from NestJS, no I/O, no `setInterval`, no `Math.random()`.

```ts
export const step = (
  state: GameState,
  inputs: ReadonlyMap<PlayerId, InputFrame>,
  dtMs: number,
): GameState => { /* pure; returns a new state */ }
```

`GameState` is a plain serialisable object. Every rule — paddle clamping, wall and
paddle bounce, scoring, power-up pickup/expiry, win condition, serve direction —
lives here. Anything that changes game outcomes must be reachable from this
function.

### 5.2 Why it pays for itself

| Requirement | How the shared engine satisfies it |
|---|---|
| Remote players | Clients are pure renderers of authoritative snapshots — identical fairness regardless of machine |
| 3+ multiplayer | FFA is the *same* `step()` with N paddles; no second code path |
| AI opponent | An `InputFrame` producer. The AI never touches state, so it is subject to exactly the same physics as a human |
| Reconnection | State is one object. Send it, restore it, continue |
| Testability | 10 000 headless ticks in a unit test in under a second — this is our desync regression test |
| Anti-cheat | There is no client-side outcome to fake |

### 5.3 Network model

- Server tick: fixed **60 Hz** (`dt = 1000/60` ms, accumulator-based).
- Broadcast: **20 Hz** snapshots with `{ tick, serverTime, ball, paddles, powerups }`.
- Client input: `{ seq, dir }` at 60 Hz, sent with a **100 ms delay buffer**.
- Client render: interpolation between the two snapshots bracketing
  `serverTime - 100 ms`; extrapolation capped at 250 ms during packet loss.
- Clock sync: NTP-style offset estimation from the `serverTime` in every snapshot,
  smoothed with a rolling median.

### 5.4 Socket protocol

Client → server: `lobby:join`, `lobby:leave`, `game:join {roomCode, mode}`,
`game:ready`, `game:input {seq, dir}`, `game:pause`, `game:leave`,
`game:rematch`, `tournament:register`, `friend:request`, `chat:send`.

Server → client: `game:state` (snapshot), `game:event` (score, bounce, powerup,
point, countdown, win), `game:over {reason}`, `game:error {code}`,
`lobby:update` (roster, online status), `presence:update`, `tournament:update`
(bracket progress).

All inbound payloads are validated with zod schemas from `@pong/shared` — the same
schemas the frontend uses to type its forms. One definition, both sides.

### 5.5 Disconnection and reconnection

1. Socket drops → keep the player seat reserved for **30 s**, room paused.
2. Reconnect with the same JWT and room code → server replays current
   `GameState` + `lastProcessedSeq`; the client resumes rendering immediately.
3. Timeout → seat released, opponent scores the point, match may end.
4. Server restart → rooms are in memory; matches in progress are marked
   `ABANDONED` in the database and **not** counted in statistics.

### 5.6 Data model (Prisma)

```
User            id, email(unique), passwordHash?, username(unique), avatarUrl?,
                role(USER|MODERATOR|ADMIN), locale, xp, level, rating,
                wins, losses, draws, oauthId?(unique), createdAt
RefreshToken    id, userId→User, tokenHash, expiresAt, revokedAt?
Friendship      id, requesterId→User, addresseeId→User,
                status(PENDING|ACCEPTED|BLOCKED), createdAt
                @@unique([requesterId, addresseeId])
Match           id, mode(ONE_V_ONE|FFA|AI|TOURNAMENT), status(LIVE|FINISHED|
                ABANDONED|FORFEIT), startedAt, endedAt?, winnerId?, durationMs?
MatchParticipant matchId→Match, userId?→User(nullable: AI), displayName,
                isAi, score, result(WIN|LOSS|DRAW|FORFEIT), placement?, inputSeq?
Tournament      id, name, status(REGISTRATION|IN_PROGRESS|FINISHED),
                maxPlayers, championId?→User, createdAt
TournamentMatch id, tournamentId→Tournament, round, slotIndex,
                playerAId?→User, playerBId?→User, winnerId?→User,
                matchId?→Match, status(PENDING|READY|PLAYED)
UserSettings    userId→User(pk), arenaTheme, ballSpeed, paddleSpeed,
                paddleColor, powerupsEnabled
```

Relations are explicit and indexed on every foreign key and every column used in a
filter/sort (`Match.mode`, `Match.startedAt`, `MatchParticipant.userId`). Result
writes happen in a single transaction: update `Match`, upsert `MatchParticipant`
rows, apply rating/XP deltas — so concurrent finishes cannot corrupt stats.

---

## 6. Module plan

### 6.1 Committed — 17 points

| # | Category | Module | Pts | Owner | Depends on |
|---|---|---|---|---|---|
| 1 | Web | Major — framework for frontend **and** backend | 2 | B | W1 |
| 2 | Web | Major — real-time features via WebSockets | 2 | B | 1, W3 |
| 3 | Web | Minor — ORM | 1 | C | 1, W1 |
| 4 | Gaming | Major — complete web-based game | 2 | B | 1, W3 |
| 5 | Gaming | Major — remote players (2 machines, reconnect) | 2 | B+D | 4, W4 |
| 6 | Gaming | Major — multiplayer 3+ | 2 | B+D | 4, W4 |
| 7 | Gaming | Minor — tournament system | 1 | D | 5, W5 |
| 8 | Gaming | Minor — game customization (power-ups, themes) | 1 | D | 4, W6 |
| 9 | User Mgmt | Major — profile, avatar, friends, online status | 2 | A | 1, W2 |
| 10 | AI | Major — AI opponent | 2 | D | 4, W6 |

### 6.2 Stretch — 3 points

| # | Category | Module | Pts | Owner | Target |
|---|---|---|---|---|---|
| S1 | User Mgmt | Minor — game statistics, match history, leaderboard | 1 | D | W7 |
| S2 | A11y/i18n | Minor — 3 languages + switcher | 1 | C | W7 |
| S3 | DevOps | Minor — health/status page + backups | 1 | C | W7 |

### 6.3 Cut order (if behind schedule)

`S1 → S2 → S3 → #8 → #7`

**Never cut #4, #5, #6.** A multiplayer game is the foundation of everything else
(AI, tournaments, statistics all require it), and shipping a broken game to protect
two minor points is a bad trade.

### 6.4 Definition of Done — per module, non-negotiable

An incomplete module scores **zero**. So every module must satisfy all six:

1. [ ] Runs from a clean `docker compose up` — no manual patches, no "works on my machine"
2. [ ] Zero errors **and zero warnings** in the browser console
3. [ ] Validated on both frontend and backend (zod at the boundary, no un-validated input)
4. [ ] Tested by a **second** team member, not just the author
5. [ ] README section + a demo script of ≤5 steps in `docs/module-claims.md`
6. [ ] Merged to `main` via PR with at least one approving review

---

## 7. Roles and responsibilities

| Member | Role(s) | Workstream | Modules owned |
|---|---|---|---|
| **A** | Product Owner + Developer | auth, profile, friends, presence | 9 |
| **B** | Technical Lead / Architect + Developer | engine, gateway, infra, CI | 1, 2, 4, 5, 6 |
| **C** | Project Manager / Scrum Master + Developer | React app, renderer, i18n, a11y, legal pages | 3, S2, S3 |
| **D** | Developer + QA owner | tournaments, AI, customization, stats | 7, 8, 10, S1 |

**Duties beyond code**

- **A** — owns the backlog and its priority order; validates finished work against
  the spec; is the single point of contact for evaluators.
- **B** — owns the architecture and this document; reviews every PR touching
  `packages/shared`, `game/`, or `gateway/`; owns the Docker/HTTPS/CI pipeline.
- **C** — runs the weekly meeting, keeps the milestone board honest, maintains
  documentation, and owns the legal pages deadline.
- **D** — owns the test suite and the demo rehearsal; every module needs its
  acceptance test written by someone other than the author.

**Load-balancing note.** B owns the four highest-risk modules. B pairs with D on
the engine from W3 onward, and A reviews the gateway PRs. If B becomes the
bottleneck in W4, module #7 (tournaments) moves to A.

### 7.1 Working method

- Branch naming: `feat/5-remote-players`, `fix/engine-tunnel-collision`.
- Commits: Conventional Commits, scoped — `feat(engine): add power-up expiry`.
  Meaningful messages, because the git history *is* an evaluated deliverable.
- PR template: what it changes, which module it advances, how it was tested,
  which checklist items from §6.4 are satisfied.
- Branch protection on `main`: 1 approval required, CI green, no force pushes.
- Weekly 45-min sync (C facilitates); decisions recorded as ADRs in `docs/decisions/`.
- Retro at the end of each week: what slipped, and does the cut order change?

---

## 8. Milestones

Weeks are relative: **W0 = project kickoff.** Dates to be anchored once the team
sets the kickoff date.

### W0 — Foundation (no code)
- Team formed; roles agreed and written into `README.md`
- Repository created, branch protection, PR template, CI skeleton
- **Module claims locked** (17 + 3) — no additions after W1, only cuts
- Wireframes: lobby, game, profile, tournament bracket, legal pages
- Product backlog populated in GitHub Projects

### W1 — Infrastructure
- `docker-compose.yml`: postgres, server, web, caddy (dev + prod profiles)
- Prisma schema + first migration + seed script
- `.env.example` committed; `.env` git-ignored and verified ignored
- Caddy TLS, HTTPS redirect, `/api/health` responding
- CI: lint, typecheck, unit tests, production build

*Exit criteria: `docker compose up --build` serves an HTTPS page; `/health` returns
dependency status; CI green on `main`.*

### W2 — Identity (owner A)
- Signup, login, refresh rotation, logout; argon2id hashing
- JWT access guards, role guard skeleton
- Profile read/update, avatar upload (type + size validated, stored outside web root)
- Prisma-backed user records

### W3 — Realtime core (owners B + D)
- Socket.IO gateway, auth handshake, room lifecycle
- Pure engine extracted and unit-tested (10 000-tick determinism test)
- 1v1 loop: server-authoritative, 20 Hz snapshots, client interpolation
- **Two laptops, one match** — the module #5 baseline

### W4 — Robustness (owners B + D)
- Reconnect with state restore + input-sequence resume
- Latency handling: offset estimation, packet-loss tolerance, extrapolation cap
- 3+ free-for-all using the same engine
- Graceful handling of disconnects mid-match

### W5 — Tournaments (owner D)
- Registration with capacity limit, seeding, single-elimination bracket
- Auto-advance winners, byes for odd counts, champion recorded
- Bracket UI with live progress

### W6 — AI + customization (owner D)
- AI opponent: reaction delay, aim error that shrinks with difficulty, occasional
  misses — must be beatable and must occasionally win
- AI must respect the player's customisation settings
- Power-ups (e.g. speed, shrink, freeze) and arena themes, with defaults

### W7 — Product completeness (owners A + C + D)
- S1 match history, statistics, leaderboard, XP/level
- S2 three languages, language switcher, all user-facing strings translatable
- S3 `/status` page, scheduled `pg_dump` backups, documented restore procedure
- Accessibility pass: keyboard navigation, focus states, ARIA, colour contrast
- **Privacy Policy and Terms of Service with real content** — a stated rejection
  criterion, so this gets a hard deadline in W7 and A + C both sign off
- Final sweep for console warnings

### W8 — Submission buffer
- README complete: roles, module table, architecture, how to run, screenshots
- Per-module demo script; full dry run of the demo with timing
- Final review pass, backup of the repository, peer feedback round

---

## 9. Risk register

| # | Risk | Impact | Likelihood | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | Client/server desync | Critical — kills #2, #5, #6 | Medium | Pure engine + determinism test; server-authoritative inputs only | B |
| R2 | B overloaded (4 high-risk modules) | High — schedule slip | High | Pair B with D from W3; A reviews gateway PRs; move #7 to A if needed | C |
| R3 | Tournament scope creep (double elimination, seeding algorithms) | Medium | Medium | Single-elimination only; bye handling is a 20-line problem | D |
| R4 | Legal pages left until the end → rejection | **Critical — project rejected** | Medium | Hard W7 deadline; C tracks it as its own milestone | C |
| R5 | i18n retrofit cost explodes | Medium | Medium | All strings go through the i18n key from W1; if not done by W2, drop S2 | C |
| R6 | Avatar upload security (path traversal, MIME spoofing) | High | Low | Validate magic bytes, not the client MIME type; random filenames; serve via a route with auth | A |
| R7 | In-memory rooms lost on restart | Medium | Medium | Match rows marked `ABANDONED`, never counted; documented as a known limitation | B |
| R8 | Weak demo (works but unimpressive) | High | Medium | W8 dry run with a timer; rehearse the wow-paths (3+ match, AI, tournament) | D |
| R9 | Console warnings at submission | Medium | High | CI step greps the console output of a Playwright smoke run | C |
| R10 | Git history does not show 4 contributors | High — evaluated | Low | Each member commits from their own account; PRs cross-review so history is interleaved | C |

---

## 10. Spec compliance checklist

| Requirement | How it is met | Verified in |
|---|---|---|
| Web app: frontend + backend + database | React SPA · NestJS API · PostgreSQL | W1 |
| Git with clear commits from all members | Conventional Commits, 1-review PR rule, protection on `main` | §7.1 |
| Single-command containerised deployment | `docker compose up --build` | W1 |
| Latest stable Chrome | Vite build targets `esnext`, no polyfills needed | W1 |
| No console warnings/errors | CI smoke test greps console output | W7 |
| Privacy Policy + Terms of Service | Footer routes, real content | W7 |
| Multi-user support | Socket.IO rooms + presence + transactional writes | W3–W4 |
| Responsive, accessible frontend | Tailwind responsive design, a11y pass | W7 |
| CSS framework | Tailwind CSS | W1 |
| Secrets in ignored `.env` + `.env.example` | Tracked in §8 W1 | W1 |
| Clear schema with relations | Prisma, §5.6 | W1 |
| Secure signup/login | argon2id + JWT access/refresh rotation | W2 |
| Frontend **and** backend input validation | Shared zod schemas | W2 |
| HTTPS everywhere | Caddy, HTTP→HTTPS redirect | W1 |
| 14 module points | 17 committed + 3 stretch, §6 | W0–W7 |

---

## 11. Open decisions

1. **Kickoff date** — anchors W0–W8 to real calendar dates.
2. **Third-party GitHub org / repo** — invites the other three members so the commit
   distribution is genuine.
3. **AI difficulty set** — three levels or a single "casual" default?
4. **Chat** — currently unclaimed. If the team has spare capacity in W5, a basic
   chat + invite-to-game is 2 more points (Web Major: user interaction) and is the
   single highest-value addition. Decide by the W5 retro.
