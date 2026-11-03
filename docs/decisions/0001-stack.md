# ADR 0001 — Vue 3 + Go + Echo

**Status:** accepted
**Date:** Week 1

## Context

The project needs a frontend framework and a backend framework for the
"frameworks" major module. The original design document proposed React with
Go/Echo or Python/FastAPI; the repository had already been scaffolded with Vue 3
and Go + Echo before the product design was finalised.

## Decision

- Frontend: Vue 3 + TypeScript + Vite, with Pinia and Vue Router.
- Backend: Go + Echo.
- Database: PostgreSQL, accessed through GORM.
- Real-time: native JSON WebSocket.
- Deployment: Docker Compose behind Caddy.

## Consequences

- The framework module is satisfied by two genuine frameworks, not a metaframework
  plus a library.
- The existing scaffold is kept and extended rather than rewritten.
- The team must own the WebSocket hub, reconnect and presence logic that a
  batteries-included realtime framework would provide.
- Go package boundaries carry the modular-monolith structure; discipline is
  enforced in review, not by the framework.
- The product design is unaffected by the framework choice.
