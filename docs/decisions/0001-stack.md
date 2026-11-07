# ADR 0001 — React + FastAPI

**Status:** accepted (supersedes the earlier frontend/backend framework proposal)
**Date:** Week 1
**Superseded by:** PR #15 on `master`

## Context

The project needs a frontend framework and a backend framework for the
"frameworks" major module. The first scaffold used an earlier framework pair, but
PR #15 replaced it with React + TypeScript and Python + FastAPI before product
work started. The product design is independent of the framework choice.

## Decision

- **Frontend:** React 19 + TypeScript + Vite 5.
- **Routing:** React Router 7.
- **Client state:** Zustand 5 for auth/UI state; TanStack Query 5 for server state.
- **Styling:** Tailwind CSS 3.4 with shared design tokens and a component library.
- **Backend:** Python 3.12 + FastAPI, served locally by Uvicorn.
- **Validation:** Pydantic v2 request/response schemas.
- **Database:** PostgreSQL 16, accessed through SQLAlchemy 2.0.
- **Migrations:** Alembic.
- **Driver:** psycopg 3.
- **Password hashing:** Argon2id via `argon2-cffi`.
- **Configuration:** `pydantic-settings`, reading `.env`.
- **Real-time:** native JSON WebSocket through FastAPI/Starlette (planned).
- **Deployment:** Docker Compose; PostgreSQL is already defined in
  `compose.db.yml`, the full application stack is planned.

## Consequences

- The framework module is satisfied by two genuine frameworks, React and
  FastAPI. React Router, Zustand and TanStack Query are libraries around React,
  not a metaframework standing in for it.
- The earlier scaffold was removed rather than maintained in parallel, so there
  is one frontend and one backend to document and test.
- FastAPI validates request payloads with Pydantic at the boundary. Business and
  permission checks still live in services, not only in route handlers.
- SQLAlchemy models and Alembic migrations must change together; `alembic check`
  is part of `make test` and CI so the two cannot drift silently.
- FastAPI returns `{"detail": ...}` for framework errors by default. The stable
  `{"error": {...}}` envelope in `docs/protocol.md` is the target; the API layer
  must normalise both shapes before the client depends on them.
- The React application currently exposes only a bootstrap shell. Routes, design
  tokens, the component library and auth screens are planned, not implemented.
- Deployment via Caddy and a multi-stage image remains a target for the
  foundation milestone; only the PostgreSQL service exists today.

See [`../architecture.md`](../architecture.md), [`../protocol.md`](../protocol.md)
and [`../data-model.md`](../data-model.md).
