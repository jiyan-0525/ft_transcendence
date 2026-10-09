# Architecture

Technical reference for Multiplayer Pong Arena. Strategy and scheduling live in
[`../PLAN.md`](../PLAN.md); module evidence lives in
[`module-claims.md`](module-claims.md).

---

## 1. Trust model

The server is fully authoritative. Clients send **input intents only** — never a
position, a score, or an outcome. Consequences:

- Cheating a client is not possible without also cheating the server, and the
  server has no client-supplied outcome to trust.
- All participants — humans and the AI — are subject to identical physics.
- Fairness in a 3+ free-for-all is a property of the system, not a promise.

---

## 2. The game engine

### 2.1 Contract

`packages/shared` (or `packages/server/src/game/engine.ts`) exports a pure
function. It imports nothing from NestJS, performs no I/O, starts no timers, and
uses no `Math.random()` — randomness enters only through an injected seeded PRNG.

```ts
export type GameState = {
  tick: number
  ball: { x: number; y: number; vx: number; vy: number; spin: number }
  paddles: Record<PlayerId, Paddle>
  powerups: PowerUp[]
  scores: Record<PlayerId, number>
  config: GameConfig
  status: 'COUNTDOWN' | 'PLAYING' | 'POINT' | 'OVER'
}

export type InputFrame = {
  seq: number
  dir: -1 | 0 | 1            // paddle direction only
  buttons?: { powerup?: boolean }
}

export const step = (
  state: GameState,
  inputs: ReadonlyMap<PlayerId, InputFrame>,
  dtMs: number,
): GameState => { /* pure */ }
```

Every rule that can change an outcome lives inside `step()`: paddle clamping, wall
and paddle collision with angle control, ball-speed escalation, serve direction,
scoring, point reset, power-up spawn/pickup/expiry, countdowns, and win detection.

### 2.2 The loop

`GameService` owns one `setInterval`-equivalent accumulator per room at a fixed
**60 Hz**. Each tick it collects the latest `InputFrame` per player, calls `step()`,
mutates nothing outside the state object, and increments `tick`. Bounces are
detected by comparing state before and after `step()` so events can be emitted to
the clients that need them.

### 2.3 Determinism test (mandatory, in CI)

`engine.spec.ts` runs 10 000 ticks from a fixed seed with a scripted input stream
and asserts:

1. the final state hash equals a checked-in constant,
2. replaying the same inputs produces an identical hash,
3. no value is ever `NaN` or `Infinity`.

This is the regression net for desync. If it passes, the server and every client
agree, because clients never simulate — they only interpolate what the server
sent.

---

## 3. Network model

| Concern | Value | Why |
|---|---|---|
| Tick rate | 60 Hz | Smooth paddle response, cheap to compute |
| Snapshot rate | 20 Hz | 30 Hz of Pong is imperceptible; halves bandwidth |
| Interpolation delay | 100 ms | Hides jitter and one-way latency |
| Extrapolation cap | 250 ms | Avoids rubber-banding beyond that |
| Clock sync | rolling median of `serverTime` offsets | Robust to a single slow sample |
| Reconnect grace | 30 s | Long enough to switch networks, short enough to hold a match |

### 3.1 Snapshot shape

```jsonc
{
  "tick": 18342,
  "serverTime": 1738291200123,
  "status": "PLAYING",
  "ball": { "x": 0.62, "y": 0.41, "vx": 0.011, "vy": -0.004 },
  "paddles": [
    { "id": "u1", "y": 0.5, "vy": 0, "score": 7 },
    { "id": "u2", "y": 0.5, "vy": 0, "score": 9 }
  ],
  "powerups": [{ "type": "PADDLE_SPEED", "x": 0.3, "y": 0.7, "expiresAt": 1738291230000 }]
}
```

Coordinates are normalised to `0..1` so the engine is resolution-independent.

### 3.2 Event names

**Client → server**

| Event | Payload | Notes |
|---|---|---|
| `lobby:join` / `lobby:leave` | — | presence |
| `game:join` | `{ roomCode, mode }` | mode: `ONE_V_ONE` \| `FFA` \| `AI` |
| `game:ready` | — | both seats ready → countdown |
| `game:input` | `{ seq, dir }` | 60 Hz, monotonic `seq` |
| `game:pause` | — | host only |
| `game:leave` | — | voluntary forfeit |
| `game:rematch` | — | rematch vote |
| `tournament:register` | `{ tournamentId }` | |
| `friend:request` | `{ targetUserId }` | |
| `chat:send` | `{ body }` | only if §11 chat is picked up |

**Server → client**

| Event | Payload | Notes |
|---|---|---|
| `game:state` | snapshot | 20 Hz, per room |
| `game:event` | `{ type, ... }` | `score`, `bounce`, `powerup`, `countdown`, `point` |
| `game:over` | `{ reason }` | `NORMAL` \| `FORFEIT` \| `ABANDONED` |
| `game:error` | `{ code }` | `ROOM_FULL`, `NOT_AUTHORISED`, `INVALID_PAYLOAD` |
| `lobby:update` | roster + presence | |
| `tournament:update` | bracket progress | |
| `presence:update` | `{ userId, online }` | friends list + profiles |

Every inbound payload is parsed with a **zod** schema from `@pong/shared`. The
same schema object types the frontend form, so validation cannot drift between
the two sides.

---

## 4. Reconnection

```
socket drops ──▶ seat reserved, room status = PAUSED, 30 s timer starts
                     │
      reconnect ◀─────┤ timeout
      (same JWT +     │
       room code)     ▼
                state replay + lastProcessedSeq
                client resumes rendering at once
                     │
                play continues, no point lost
```

If the timer expires, the seat is released and the remaining players score the
point. A **server** restart is different: rooms live in memory, so in-progress
matches are written as `ABANDONED` and excluded from statistics. This limitation
is documented rather than hidden.

---

## 5. Data model

```
User ──┬─< RefreshToken
       ├─< MatchParticipant >── Match
       ├─< Friendship (requester) ── Friendship (addressee)
       ├─< TournamentMatch (player A / player B / winner)
       └─1 UserSettings

Tournament ──< TournamentMatch ──0..1 Match
```

All foreign keys indexed, plus indexes on the columns used for filtering and
sorting: `Match.mode`, `Match.startedAt`, `MatchParticipant.userId`,
`User.rating`, `User.username`.

### 5.1 Transactional result writes

Finishing a match is one transaction:

1. update `Match` → `status = FINISHED`, `winnerId`, `endedAt`, `durationMs`
2. upsert one `MatchParticipant` row per player (score, result, placement)
3. apply rating deltas and XP to each `User`

Because it is a single transaction, two matches finishing at the same moment
cannot interleave and corrupt statistics. Rating uses Elo; XP thresholds drive
levels.

### 5.2 Avatar storage

Uploads are validated by **magic bytes**, not the client-supplied MIME type or the
extension, size-capped, and written with a generated UUID filename to a directory
outside the web root. They are served through an authenticated route that checks
ownership, so an avatar ID cannot be used to probe for other users' files.

---

## 6. Deployment topology

```
                    ┌──────────────┐
   browser ──HTTPS──▶     Caddy     │  automatic TLS, HTTP→HTTPS redirect
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌───────────────┐         ┌──────────────┐
      │  web (nginx)  │         │  api (Node)  │  NestJS + Fastify
      │  static SPA   │         │  + Socket.IO │
      └───────────────┘         └──────┬───────┘
                                       │
                                ┌──────▼───────┐
                                │  db (Postgres)│
                                └───────────────┘
```

`docker compose up --build` is the only command. Compose profiles separate
development (plain HTTP, hot reload, exposed database port) from production
(Caddy TLS, multi-stage images, no source mounts, no database port published).
Secrets arrive exclusively through environment variables from `.env`, which is
git-ignored; `.env.example` is the committed template.

---

## 7. Decision records

Short ADRs live in `decisions/`. The load-bearing decisions so far:

1. **Pure deterministic engine shared by every mode** — one code path for 1v1,
   3+, and AI; testable; impossible to desync by construction.
2. **Server-authoritative, input-only clients** — fairness, anti-cheat, and
   free correctness for remote play.
3. **Snapshot + interpolation over state streaming per entity** — Pong state is
   tiny; a single message per tick is simpler and faster than entity diffing.
4. **NestJS over bare Fastify** — module boundaries and guards map onto the
   graded user-management and permissions modules; porting cost bounded to the
   gateway and auth layers if the team stalls.
5. **Rooms in memory, results in PostgreSQL** — a distributed room store is
   unnecessary at this scale; matches are marked `ABANDONED` on restart.
