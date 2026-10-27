# Pong Client–Server Protocol (Draft v0.1)

**Jira:** FT-26, FT-28, FT-29, FT-34  
**Status:** Draft — agree with Frontend Owner before implementing rooms  
**Stack:** Vue 3 + TypeScript frontend; Python + FastAPI backend; native JSON WebSocket

## 1. Scope

This document defines the **minimum Sprint 1** browser/backend contract for a two-player remote Pong prototype. It does not claim that the WebSocket handlers, auth, reconnection, tournaments, or spectator mode have been implemented.

REST is used for ordinary account/data operations. The first implemented REST endpoint is `GET /api/health`. Real-time room actions and game snapshots will use a single native WebSocket connection.

## 2. HTTP

### `GET /api/health`

**Response:** HTTP `200`, `Content-Type: application/json`

```json
{"status":"ok","service":"pong-api"}
```

This is a **liveness** check only; it does not yet verify the database, WebSocket health, or other dependencies.

## 3. WebSocket connection

**Proposed endpoint:** `GET /ws/game` (WebSocket upgrade; `ws://` locally, `wss://` behind HTTPS). Final origin/port and authentication will be decided alongside FT-28 and FT-50.

Each WebSocket text message is UTF-8 JSON with an envelope:

```json
{"type":"game:input","payload":{"seq":1,"dir":-1}}
```

- `type`: required string identifying the message.
- `payload`: required JSON object.
- Unknown message types or invalid JSON must be rejected safely, never crash the server.
- The server is authoritative. Clients never submit ball coordinates, paddle coordinates, scores, or match winners.
- Sprint 1 targets 1v1 rooms only (two player seats).

## 4. Client → Server messages

### `game:create`

```json
{"type":"game:create","payload":{}}
```

Requests creation of a new 1v1 room.

### `game:join`

```json
{"type":"game:join","payload":{"roomId":"ABCD12"}}
```

Requests joining an existing room. `roomId` is a server-issued identifier. The server validates existence and capacity.

### `game:input`

```json
{"type":"game:input","payload":{"seq":1,"dir":-1}}
```

- `seq`: non-negative monotonically increasing integer for this player's input stream.
- `dir`: `-1` up, `0` stationary, `1` down.
- Only an assigned player may control their own paddle. The server determines player identity from the connection/seat, not an untrusted user-supplied player ID.
- The server rejects invalid directions and stale/duplicate sequences.

## 5. Server → Client messages

### `game:created`

```json
{"type":"game:created","payload":{"roomId":"ABCD12","playerId":"p1"}}
```

Acknowledges room creation and assigns the first player's seat.

### `game:joined`

```json
{"type":"game:joined","payload":{"roomId":"ABCD12","playerId":"p2"}}
```

Acknowledges a successful join and assigns the second player's seat.

### `game:state`

```json
{
  "type":"game:state",
  "payload":{
    "roomId":"ABCD12",
    "tick":42,
    "status":"PLAYING",
    "ball":{"x":0.5,"y":0.4},
    "paddles":{"p1":{"y":0.3},"p2":{"y":0.7}},
    "scores":{"p1":2,"p2":1}
  }
}
```

- Coordinates are normalised to the `0.0`–`1.0` game area for resolution-independent Canvas rendering.
- `tick`: non-negative server simulation counter.
- `status`: `WAITING`, `PLAYING`, `PAUSED`, or `FINISHED`.
- Only the server computes and broadcasts authoritative ball/paddle positions and scores.
- This is the **minimum** snapshot. Velocity, interpolation timestamps, power-ups, and additional game modes are deferred until needed.

### `game:player_left`

```json
{"type":"game:player_left","payload":{"roomId":"ABCD12","playerId":"p2"}}
```

Broadcast when a player disconnects or leaves. Sprint 1 only needs disconnect detection; seat reservation and recovery belong to Sprint 2.

### `game:error`

```json
{"type":"game:error","payload":{"code":"ROOM_FULL","message":"Room already has two players"}}
```

Initial error codes: `INVALID_JSON`, `UNKNOWN_TYPE`, `INVALID_PAYLOAD`, `ROOM_NOT_FOUND`, `ROOM_FULL`, `NOT_IN_ROOM`, `INVALID_INPUT`.

## 6. Backend/frontend contract mapping

- Python backend: define Pydantic models for message envelopes and payloads, then validate inbound data.
- Vue frontend: define matching TypeScript interfaces in `packages/web/src/types/`.
- Keep Python and TypeScript types aligned through this protocol document; no runtime cross-language imports are needed.
- Keep message examples and field names aligned with this document. Any changes to message shapes require review from both backend and frontend owners.

## 7. Sprint milestones

- **FT-26 (now):** document the HTTP response and proposed JSON/WebSocket contract; `/api/health` implemented and tested.
- **FT-28:** implement WebSocket upgrade and `game:create` / `game:join` / disconnect.
- **FT-29:** implement `game:input` validation and `game:state` broadcasting.
- **FT-34:** wire server-owned game loop and physics to state snapshots.
- **Sprint 2:** authentication-linked reconnection, richer state protocol, latency improvements.

## 8. Open decisions

1. Whether to use opaque room IDs or short alphanumeric share codes (the examples use `roomId`).
2. WebSocket authentication and reconnect identity (coordinate with FT-50 and Sprint 2).
3. Exact room/game state transitions and countdown/start handshake.
4. Snapshot frequency, input rate limits, and maximum message size.
5. HTTP health/readiness split for Docker and database checks.
