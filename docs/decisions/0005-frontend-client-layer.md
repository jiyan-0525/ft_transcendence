# ADR 0005 — Frontend client layer

**Status:** accepted
**Date:** 2026-11-07

## Context

The React stack (React Router 7, Zustand 5, TanStack Query 5) is fixed in
[`0001-stack.md`](0001-stack.md). What remained open was how the browser talks to
the backend: how REST and WebSocket calls are wrapped, how the app runs before the
auth endpoints exist, and where the connection lifecycle belongs. The Week 1 plan
needs the UI to build against a contract the backend has not implemented yet.

## Decision

- **One REST entry point.** `lib/api.ts` is the only place that calls `fetch`. It
  always sends the session cookie (`credentials: "include"`), enforces a timeout,
  and turns every failure into one `ApiError` with a `code`. It accepts both the
  protocol envelope `{"error": {...}}` and FastAPI's `{"detail": ...}`.
- **Mapping at the boundary.** Wire types stay snake_case in `types/api.ts`.
  Components receive camelCase models from `lib/mappers.ts`.
- **Swappable transport.** `lib/auth.ts` picks a real or mock auth client from
  `VITE_USE_MOCKS`. Mocks default on, so a missing variable never sends traffic to
  an API that may not exist. Components import the client, never the mock.
- **Typed WebSocket client.** `lib/ws.ts` owns one connection. Frames are typed in
  `types/ws.ts` from protocol §14. Reconnect uses exponential backoff with equal
  jitter, capped at 30 s. Sends are never queued: the server persists first, so a
  dropped frame is recovered by REST, not by replay.
- **Explicit connection lifecycle.** The auth store connects after a session is
  confirmed and disconnects on logout. In mock mode it does not connect at all,
  because there is no `/ws` to reach.
- **Test seams, not mocks of the platform.** The socket factory and the random
  source are injected, so reconnect timing is tested with fake timers and a fake
  socket rather than a real server.

## Consequences

- Components never see `fetch`, raw error types or snake_case fields.
- The UI runs end to end on mocks, and switching to the real backend is one
  environment variable plus a working API.
- The heartbeat uses a `ping` frame that protocol §14.3 does not list yet. Until
  it is added, the server answers with `ws:error`, which the client ignores.
- Mock state lives in memory and resets on reload. It is for development and
  tests only.
- The WebSocket client is verified against a fake socket. It is not verified
  against a real server until `/ws` exists.
