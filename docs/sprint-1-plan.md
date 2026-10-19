# Sprint 1 — Vue 3 + Go Echo Application Framework Scaffold

**Module:** #1 — Major: framework for frontend **and** backend (2 pts)
**Jira:** FT-26, FT-28, FT-29, FT-34
**Stack:** Vue 3 + TypeScript + Vite frontend; Go + Echo backend; native JSON WebSocket
**Branch:** `FT-3-sprint-1-vue-3-go`

---

## Context

**Stack pivot:** The original `PLAN.md` describes React + NestJS + Socket.IO + Prisma. The team has pivoted to **Vue 3 + TypeScript + Vite** and **Go + Echo** with native JSON WebSocket, as documented in `docs/protocol.md`.

**What exists today:**
- Go Echo server with only `GET /api/health` (`packages/server/cmd/server/main.go`)
- Empty `packages/web/` directory (no frontend code at all)
- No Docker Compose, no Dockerfiles, no CI, no Vite config
- `.env.example` and `Makefile` still reference the old NestJS/Prisma stack

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

## Workstream B — Backend Scaffold (Go + Echo)

### B1. Project structure

```
packages/server/
├── go.mod
├── go.sum
├── cmd/server/
│   └── main.go
├── internal/
│   ├── handler/
│   │   ├── health.go
│   │   └── ws.go
│   ├── game/
│   │   ├── engine.go
│   │   ├── state.go
│   │   ├── room.go
│   │   ├── loop.go
│   │   └── engine_test.go
│   ├── protocol/
│   │   ├── message.go
│   │   ├── validate.go
│   │   └── errors.go
│   └── hub/
│       └── hub.go
```

**Go dependencies:** `github.com/labstack/echo/v4`, `github.com/gorilla/websocket`, `github.com/google/uuid`

### B2. WebSocket endpoint (`handler/ws.go`)

- `GET /ws/game` → upgrade via `gorilla/websocket`
- Read loop: parse JSON envelope, route by `type`
- Write loop: send messages from per-connection channel
- On disconnect: broadcast `game:player_left`, cleanup room

### B3. Room management (`game/room.go`)

- Room: 6-char alphanumeric ID, 2 player seats, game state, status
- **Create:** generate ID, assign p1, status = WAITING
- **Join:** validate room exists + not full, assign p2, status = PLAYING
- **Leave/disconnect:** broadcast `game:player_left`, cleanup

### B4. Game engine (`game/engine.go`)

```go
type GameState struct {
    Tick    int64
    Status  string             // WAITING | PLAYING | PAUSED | FINISHED
    Ball    Ball
    Paddles map[string]Paddle
    Scores  map[string]int
}

type InputFrame struct {
    Seq int64
    Dir int // -1 up, 0 stationary, 1 down
}

func Step(state GameState, inputs map[string]InputFrame, dt float64) GameState
```

- Pure function: paddle movement, wall bounce, paddle bounce, scoring, ball reset
- Deterministic: no `math/rand` — use fixed seed or initial velocity

### B5. Game loop (`game/loop.go`)

- Per-room goroutine, 60 Hz (`time.Ticker` at 16.67ms)
- Accumulator pattern for fixed timestep
- Collect latest input per player per tick
- Broadcast `game:state` at 20 Hz (every 3rd tick)
- Snapshot includes: tick, status, ball, paddles, scores

### B6. Protocol validation (`protocol/validate.go`)

| Error code | When |
|---|---|
| `INVALID_JSON` | Message is not valid JSON |
| `UNKNOWN_TYPE` | `type` is not a known message type |
| `INVALID_PAYLOAD` | Payload shape is wrong for the type |
| `ROOM_NOT_FOUND` | Room ID does not exist |
| `ROOM_FULL` | Room already has 2 players |
| `NOT_IN_ROOM` | Sender is not a player in the room |
| `INVALID_INPUT` | `seq` or `dir` is out of range |

### B7. Tests (`game/engine_test.go`)

- 10,000 ticks from fixed state with scripted inputs
- Assert final state hash equals checked-in constant
- Assert replaying same inputs produces identical hash
- Assert no NaN or Infinity values

---

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

- `packages/server/Dockerfile` — `golang:1.26-alpine` build, `distroless/static` run
- `packages/web/Dockerfile` — `node:22-alpine` build, `nginx:alpine` serve + proxy `/api` and `/ws`

### C3. CI (`.github/workflows/ci.yml`)

- **Lint:** `golangci-lint` (Go), `eslint` + `prettier` (Vue)
- **Typecheck:** `go vet ./...`, `vue-tsc --noEmit`
- **Test:** `go test ./...`, `vitest run`
- **Build:** `go build ./...`, `vite build`

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
test:      go test ./... && npm run test --prefix packages/web
lint:      golangci-lint run && npm run lint --prefix packages/web
```

---

## Execution order

| Step | Task | Est. hours |
|------|------|------------|
| 1 | Scaffold `packages/web/` (Vite + Vue 3 + TS + Tailwind) | 1–2 |
| 2 | Define `src/types/protocol.ts` + `src/lib/ws.ts` | 1 |
| 3 | Build `GameCanvas.vue`, `GameView.vue`, `HomeView.vue` | 3–4 |
| 4 | Scaffold Go WebSocket handler + room management | 3–4 |
| 5 | Implement `game/engine.go` (pure step function) | 2–3 |
| 6 | Implement `game/loop.go` (60 Hz tick + broadcast) | 2 |
| 7 | Protocol validation + error codes | 1 |
| 8 | Go tests (engine determinism) | 1 |
| 9 | Wire frontend WS client to backend | 1–2 |
| 10 | Docker Compose + Dockerfiles + CI | 2–3 |
| 11 | Update `.env.example`, Makefile, README | 1 |
| 12 | End-to-end test: two browsers, one match | 1 |

**Total: ~20–25 hours** for a working Sprint 1 demo.

---

## Jira ticket mapping

| Ticket | Scope | Status |
|--------|-------|--------|
| **FT-26** | `/api/health` + protocol doc | Done |
| **FT-28** | WS upgrade + `game:create` / `game:join` / disconnect | Pending |
| **FT-29** | `game:input` validation + `game:state` broadcast | Pending |
| **FT-34** | Server game loop + physics | Pending |

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
| WebSocket proxy in dev (Vite → Go) | Vite `server.proxy` for `/ws` → `ws://localhost:3000` |
| Canvas render performance at 60fps | `requestAnimationFrame`, not Vue reactivity, for ball/paddle |
| Echo + gorilla/websocket compatibility | `e.GET("/ws/game", ...)` with `websocket.Upgrader` handler |
| Message type drift between Go/TS | Single source of truth: `docs/protocol.md`, review checklist |
| Stack pivot leaves stale docs | Update PLAN.md, README.md, .env.example, Makefile together |
