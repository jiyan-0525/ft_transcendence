# ft_transcendence — Multiplayer Pong Arena

Real-time multiplayer Pong: play live 1v1 matches with opponents on other machines,
3+ free-for-all battles, tournaments with brackets, and an AI opponent. Built with
React, NestJS, Socket.IO, PostgreSQL and Docker.

> **Status:** W0 — pre-kickoff. Module claims are locked; this README is completed
> week by week as the project is built.

---

## Table of contents

- [Team and roles](#team-and-roles)
- [Modules claimed](#modules-claimed)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Documentation](#documentation)
- [Legal](#legal)

---

## Team and roles

Four members. Roles are bundled so that everyone codes *and* holds a real
responsibility. Documented here as required by the spec.

| Member | Role(s) | Responsibilities | Modules owned |
|---|---|---|---|
| **A** | Product Owner + Developer | Product vision, backlog and prioritisation; validates finished work; evaluator contact; auth, profile, friends, presence | 9 |
| **B** | Technical Lead / Architect + Developer | Architecture and stack decisions; engine, realtime gateway, Docker/HTTPS/CI; reviews critical changes | 1, 2, 4, 5, 6 |
| **C** | Project Manager / Scrum Master + Developer | Meetings and planning; progress and risk tracking; React app, renderer, i18n, accessibility, legal pages | 3, S2, S3 |
| **D** | Developer + QA owner | Tournaments, AI opponent, game customization, statistics; owns the test suite and demo rehearsal | 7, 8, 10, S1 |

Every module is developed by its owner and tested by a different member.
All PRs require one approving review from a non-author.

---

## Modules claimed

**Committed: 17 points** (14 required) — plus 3 stretch points.

| # | Category | Module | Points | Owner | Demo steps | Status |
|---|---|---|---|---|---|---|
| 1 | Web | Major — framework for frontend and backend | 2 | B | Open the app, use the UI, inspect the network tab | ⬜ |
| 2 | Web | Major — real-time features with WebSockets | 2 | B | Open two browsers, move a paddle, watch the other update | ⬜ |
| 3 | Web | Minor — ORM | 1 | C | `npx prisma migrate dev`, show `schema.prisma` and the relations | ⬜ |
| 4 | Gaming | Major — complete web-based game | 2 | B | Start a 1v1 match, score points to 11 | ⬜ |
| 5 | Gaming | Major — remote players | 2 | B+D | Two laptops on the same network, play live; kill the Wi-Fi and reconnect | ⬜ |
| 6 | Gaming | Major — multiplayer 3+ | 2 | B+D | Create a room, join with 3 browsers, play a free-for-all | ⬜ |
| 7 | Gaming | Minor — tournament system | 1 | D | Register 4 players, run the bracket to a champion | ⬜ |
| 8 | Gaming | Minor — game customization | 1 | D | Enable a power-up, change the arena theme, finish a match with it active | ⬜ |
| 9 | User Mgmt | Major — user management and authentication | 2 | A | Register, log in, edit the profile, upload an avatar, add a friend | ⬜ |
| 10 | AI | Major — AI opponent | 2 | D | Start a match vs AI on each difficulty; win one, lose one | ⬜ |
| S1 | User Mgmt | Minor — game statistics and match history | 1 | D | Finish a match, open the profile, show history, wins/losses, leaderboard | ⬜ |
| S2 | A11y/i18n | Minor — three languages with a switcher | 1 | C | Switch EN → DE → FR; navigate the app by keyboard only | ⬜ |
| S3 | DevOps | Minor — health/status page with backups | 1 | C | Open `/status`, show live dependencies, show a restore from a backup | ⬜ |

Per-module demo scripts live in [`docs/module-claims.md`](docs/module-claims.md).

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| Backend | NestJS (Fastify adapter), Socket.IO |
| Database | PostgreSQL 16 with Prisma ORM |
| Auth | argon2id password hashing, JWT access + rotating refresh tokens |
| Realtime | WebSockets (Socket.IO) with client-side interpolation |
| Infrastructure | Docker Compose, Caddy (automatic HTTPS) |
| Testing | Vitest, Supertest, Playwright (smoke) |

---

## Architecture

The server is **fully authoritative**: clients send only input intents
(`{ seq, direction }`) and render interpolated snapshots. They cannot send
positions, scores or outcomes.

The game logic lives in **one pure, deterministic, I/O-free module** —
`step(state, inputs, dt) → state` — driven by a fixed 60 Hz server loop that
broadcasts 20 Hz snapshots. The same engine serves the 1v1 match, the 3+
free-for-all, and the AI opponent (the AI is just another input producer), which
keeps physics identical for every participant and lets us test 10 000 ticks in
under a second.

```
Browser (React)  ──HTTPS/REST──▶  NestJS API  ──▶  PostgreSQL
       │                              │
       └──────────WSS────────▶  Socket.IO gateways
                                      │
                                 GameService (60 Hz)
                                      │
                                 Pure engine (step)
```

Full details: [`docs/architecture.md`](docs/architecture.md). Overall project
strategy and risk register: [`PLAN.md`](PLAN.md).

---

## Getting started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (only needed to run the apps outside Docker)

### Run the whole stack

```bash
git clone <repository-url>
cd transcendence
cp .env.example .env      # then edit the values
docker compose up --build
```

The app is served over HTTPS at `https://localhost:3000`
(development over plain HTTP at `http://localhost:8080`).

### Useful commands

```bash
make up          # start the stack
make down        # stop the stack
make seed        # reset and seed the database with demo users
make logs        # tail all service logs
make test        # run the full test suite
```

### Environment variables

All secrets live in `.env`, which is git-ignored. [`.env.example`](.env.example)
documents every variable needed to run the project:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | Token lifetimes |
| `CORS_ORIGIN` | Allowed frontend origin |
| `COOKIE_DOMAIN` | Cookie scope for refresh tokens |
| `VITE_API_URL` / `VITE_WS_URL` | Frontend-facing backend URLs |

### Team members and access

Each member commits under their own GitHub account so the repository history
demonstrates genuine, balanced contribution. Branch protection is enabled on
`main`: one approving review and green CI are required to merge.

---

## Project structure

```
transcendence/
├── docker-compose.yml
├── .env.example
├── Makefile
├── PLAN.md                    # project plan, milestones, risks
├── docs/                      # architecture, module claims, decision records
└── packages/
    ├── shared/                # shared types, zod schemas, game constants
    ├── server/                # NestJS API, Socket.IO gateways, Prisma
    └── web/                   # React frontend
```

---

## Documentation

| Document | Contents |
|---|---|
| [`PLAN.md`](PLAN.md) | Vision, stack rationale, architecture, module plan, roles, milestones, risk register, spec compliance |
| [`docs/architecture.md`](docs/architecture.md) | Diagrams, engine contract, socket protocol, data model |
| [`docs/module-claims.md`](docs/module-claims.md) | Per-module evidence and demo scripts |
| [`docs/decisions/`](docs/decisions) | Architecture decision records (why this stack, this sync model) |

---

## Legal

- [Privacy Policy](docs/legal/privacy-policy.md)
- [Terms of Service](docs/legal/terms-of-service.md)

Both pages are linked from the application footer. They contain real,
project-specific content — what data we store, why, for how long, and who can see
it — as required by the project brief. Final content is written in W7.
