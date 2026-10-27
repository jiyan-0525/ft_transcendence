# Sprint 1 — Vue 3 + Python FastAPI Application Framework Scaffold

**Module:** #1 — Major: framework for frontend **and** backend (2 pts)
**Jira parent:** FT-3 (Story, High priority, assignee: Jiyan Wang)
**Jira sprint:** Sprint 1 · Foundation (D1–7)
**Jira planned duration:** D1–2 (Week 1, Days 1–2)
**Stack:** Vue 3 + TypeScript + Vite frontend; Python + FastAPI backend; native JSON WebSocket
**Branch:** `FT-3-sprint-1-vue-3-python`

---

## Context

**Current stack decision:** Vue 3 + TypeScript + Vite frontend; Python + FastAPI backend; native JSON WebSocket. This supersedes the original stack draft in `PLAN.md` and is documented in `docs/protocol.md`.

**What exists today:**
- Python FastAPI server with only `GET /api/health` (`packages/server/app/main.py`)
- Vue 3 + Vite frontend scaffold in `packages/web/`
- No Docker Compose, Dockerfiles, CI, or database integration yet
- `.env.example` and `Makefile` now use Python backend commands

**What Sprint 1 delivers:** A working 1v1 remote Pong prototype — two browsers, one match, server-authoritative game loop.

---

## Sprint goal

Two people on two different laptops can:
1. Open the app in a browser
2. One creates a room, the other joins it
3. Play a real-time 1v1 Pong match with server-authoritative physics

---

## Workstream A — Frontend Scaffold (Vue 3 + TS + Vite)

### A1. Project setup

```
packages/web/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/index.ts
│   ├── types/protocol.ts
│   ├── lib/
│   │   ├── ws.ts
│   │   └── api.ts
│   ├── stores/
│   │   └── game.ts
│   ├── components/
│   │   ├── GameCanvas.vue
│   │   ├── Paddle.vue
│   │   └── Ball.vue
│   ├── views/
│   │   ├── HomeView.vue
│   │   └── GameView.vue
│   └── assets/
└── tests/
    └── protocol.test.ts
```

**Dependencies:** `vue`, `vue-router`, `pinia`, `tailwindcss`, `vite`, `typescript`, `vitest`

### A2. WebSocket client (`src/lib/ws.ts`)

- Connect to `ws://localhost:3000/ws/game` (dev) or `wss://...` (prod)
- JSON envelope `{ type, payload }`
- Auto-reconnect with exponential backoff
- Typed `send(type, payload)` and `onMessage(handler)` API

### A3. Game canvas renderer

- Canvas 2D, normalized coordinates (0.0–1.0 from server)
- Interpolation buffer (100ms delay) between snapshots
- Keyboard input: ArrowUp / ArrowDown → `game:input { seq, dir }`
- Render: ball, two paddles, scores, status (WAITING / PLAYING / PAUSED / FINISHED)

### A4. Type definitions (`src/types/protocol.ts`)

Mirror every message from `docs/protocol.md` §4–5 as TypeScript interfaces:

```ts
export type ClientMessage =
  | { type: 'game:create'; payload: Record<string, never> }
  | { type: 'game:join'; payload: { roomId: string } }
  | { type: 'game:input'; payload: { seq: number; dir: -1 | 0 | 1 } }

export type ServerMessage =
  | { type: 'game:created'; payload: { roomId: string; playerId: string } }
  | { type: 'game:joined'; payload: { roomId: string; playerId: string } }
  | { type: 'game:state'; payload: GameStateSnapshot }
  | { type: 'game:player_left'; payload: { roomId: string; playerId: string } }
  | { type: 'game:error'; payload: { code: string; message: string } }

export interface GameStateSnapshot {
  roomId: string
  tick: number
  status: 'WAITING' | 'PLAYING' | 'PAUSED' | 'FINISHED'
  ball: { x: number; y: number }
  paddles: Record<string, { y: number }>
  scores: Record<string, number>
}
```

---

## Workstream B — Backend Scaffold (Python + FastAPI)

### B1. Project structure

packages/server/
    requirements.txt
    requirements-dev.txt
    app/
        __init__.py
        main.py
    tests/
        test_health.py

Runtime dependencies: fastapi, uvicorn[standard].
Development dependencies: pytest, httpx, ruff, mypy.

### B2. Health endpoint (app/main.py)

- GET /api/health returns HTTP 200 and {"status":"ok","service":"pong-api"}.
- Read API_HOST and API_PORT from the environment; local default port is 3000.
- This is a liveness check. Database readiness belongs to later work.

### B3. WebSocket endpoint (app/websocket.py, planned)

- GET /ws/game accepts a native WebSocket connection.
- Read UTF-8 JSON envelopes with type and payload.
- Validate inbound payloads with Pydantic models.
- Reject malformed JSON safely and avoid concurrent writes to a connection.

### B4. Room management (app/game/room.py, planned)

- Room: 6-character alphanumeric ID, two player seats, game state, and status.
- Create: generate ID, assign p1, set status to WAITING.
- Join: validate room existence and capacity, assign p2, set status to PLAYING.
- Leave/disconnect: broadcast game:player_left and clean up the room.

### B5. Game engine (app/game/engine.py, planned)

    from dataclasses import dataclass

    @dataclass(frozen=True)
    class InputFrame:
        seq: int
        direction: int  # -1 up, 0 stationary, 1 down

    def step(state, inputs, dt_seconds):
        'Pure deterministic update; no I/O or wall-clock access.'
        ...

- Keep physics independent from FastAPI and the WebSocket layer.
- Avoid unseeded randomness so engine results are reproducible.

### B6. Game loop (app/game/loop.py, planned)

- Run a per-room asyncio task at 60 Hz with a fixed timestep.
- Collect the latest input per player per tick.
- Broadcast game:state at 20 Hz (every third tick).
- Cancel the task and clean up safely when a room ends.

### B7. Protocol validation and tests (planned)

Validate docs/protocol.md cases: INVALID_JSON, UNKNOWN_TYPE, INVALID_PAYLOAD,
ROOM_NOT_FOUND, ROOM_FULL, NOT_IN_ROOM, and INVALID_INPUT. Use pytest for the
backend, covering the health response and future features as they are implemented.

## Workstream C — Infrastructure

### C1. Docker Compose (`docker-compose.yml`)

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  server:
    build: ./packages/server
    environment:
      API_PORT: "3000"
      DATABASE_URL: ${DATABASE_URL}
    ports:
      - "3000:3000"
    depends_on:
      - db

  web:
    build: ./packages/web
    environment:
      VITE_API_URL: http://localhost:3000
      VITE_WS_URL: ws://localhost:3000
    ports:
      - "8080:80"
    depends_on:
      - server

volumes:
  pgdata:
```

### C2. Dockerfiles

- `packages/server/Dockerfile` — `python:3.12-slim` build, `distroless/static` run
- `packages/web/Dockerfile` — `node:22-alpine` build, `nginx:alpine` serve + proxy `/api` and `/ws`

### C3. CI (`.github/workflows/ci.yml`)

- **Lint:** `ruff` (Python), `eslint` + `prettier` (Vue)
- **Typecheck:** `mypy`, `vue-tsc --noEmit`
- **Test:** `python -m pytest`, `vitest run`
- **Build:** `python -m compileall`, `vite build`

### C4. `.env.example` (updated)

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
POSTGRES_DB=transcendence
DATABASE_URL=postgresql://postgres:change_me@db:5432/transcendence

API_PORT=3000
WEB_PORT=8080

VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

TICK_RATE=60
SNAPSHOT_RATE=20
INTERPOLATION_DELAY_MS=100
RECONNECT_GRACE_MS=30000
```

### C5. Makefile (updated targets)

```makefile
up:        docker compose up --build -d
down:      docker compose down
build:     docker compose build
logs:      docker compose logs -f
test:      python -m pytest && npm run test --prefix packages/web
lint:      ruff run && npm run lint --prefix packages/web
```

---

## Execution order

| Step | Task | Est. hours |
|------|------|------------|
| 1 | Scaffold `packages/web/` (Vite + Vue 3 + TS + Tailwind) | **Done** |
| 2 | Define `src/types/protocol.ts` + `src/lib/ws.ts` | **Done** |
| 3 | Build `GameCanvas.vue`, `GameView.vue`, `HomeView.vue` | 3–4 |
| 4 | Scaffold Python WebSocket handler + room management | 3–4 |
| 5 | Implement `app/game/engine.py` (pure step function) | 2–3 |
| 6 | Implement `app/game/loop.py` (60 Hz tick + broadcast) | 2 |
| 7 | Protocol validation + error codes | 1 |
| 8 | Python tests (engine determinism) | 1 |
| 9 | Wire frontend WS client to backend | 1–2 |
| 10 | Docker Compose + Dockerfiles + CI | 2–3 |
| 11 | Update `.env.example`, Makefile, README | 1 |
| 12 | End-to-end test: two browsers, one match | 1 |

**Total: ~20–25 hours** for a working Sprint 1 demo.

---

## Progress log

| Date | Step | Status |
|------|------|--------|
| Oct 19 | Step 1 — Scaffold `packages/web/` (Vite + Vue 3 + TS + Tailwind) | Done |
| Oct 19 | Step 2 — `src/types/protocol.ts` + `src/lib/ws.ts` (in `stores/game.ts`) | Done |

**What exists now:** `packages/web/` has Vite + Vue 3 + TS + Tailwind + Pinia + Vue Router, with protocol types, game store, Home/Game views, and Vite proxy config for `/api` and `/ws`.

**Next up:** Step 3 (`GameCanvas.vue` — canvas renderer) or Step 4 (Python WebSocket handler + rooms).

> **Jira timeline:** FT-3 is planned for **D1–2** of Sprint 1 (the sprint runs D1–7). The scaffold must be done by end of Day 2, leaving D3–7 for the remaining subtasks (FT-28, FT-29, FT-34) and the sprint goal of an online Pong room demo.

---

## Jira ticket mapping

**Parent:** FT-3 — Sprint 1 · Vue 3 + Python FastAPI application framework scaffold (2 pts planned)

| Ticket | Title | Scope | Status |
|--------|-------|-------|--------|
| **FT-3** | Sprint 1 scaffold (parent) | Overall framework + 2 pts module | In Arbeit |
| **FT-25** | D1–2 Vue/Vite/Tailwind app setup | Frontend scaffold | To do |
| **FT-26** | D1–2 Python FastAPI backend, REST health endpoint & JSON contracts | Backend scaffold | Done |
| **FT-27** | D2 HTTPS reverse-proxy integration | Caddy TLS + proxy | To do |
| **FT-28** | WS upgrade + `game:create` / `game:join` / disconnect | WebSocket rooms | Pending |
| **FT-29** | `game:input` validation + `game:state` broadcast | Input + broadcast | Pending |
| **FT-34** | Server game loop + physics | 60 Hz engine | Pending |

---

## Definition of Done (Module #1)

Per `PLAN.md` §6.4 — all six must pass:

- [ ] Runs from a clean `docker compose up --build`
- [ ] Zero errors and zero warnings in the browser console
- [ ] Validated on both frontend and backend
- [ ] Tested by a second team member
- [ ] README section + demo script in `docs/module-claims.md`
- [ ] Merged to `main` via PR with at least one approving review

---

## Risks and mitigations

| Risk | Mitigation |
|------|-------------|
| WebSocket proxy in dev (Vite → Python) | Vite `server.proxy` for `/ws` → `ws://localhost:3000` |
| Canvas render performance at 60fps | `requestAnimationFrame`, not Vue reactivity, for ball/paddle |
| FastAPI WebSocket lifecycle and disconnect handling | `e.GET("/ws/game", ...)` with `websocket.Upgrader` handler |
| Message type drift between Python/TS | Single source of truth: `docs/protocol.md`, review checklist |
| Stack pivot leaves stale docs | Update PLAN.md, README.md, .env.example, Makefile together |
