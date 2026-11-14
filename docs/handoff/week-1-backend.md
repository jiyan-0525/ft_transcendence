# Week 1 backend handoff

The authentication contract is in [auth-frontend.md](auth-frontend.md). Protected routes obtain the active user with `Depends(get_current_user)`. The request-scoped database session comes from `Depends(get_db)`. For browser writes, reuse `Depends(require_trusted_origin)`. Use the existing role and owner helpers for server-side authorization.

## Run and verify

1. Run `make setup`, `make up`, `make migrate`, `make test`, `make web-install`, and `make web-test` from the repository root.
2. Run `make dev` and `make web-dev` in separate terminals. Open the Vite URL at port 5173. Check `/api/health` for process health and `/api/status` for database readiness.
3. Register two distinct test users. Log in as A, reload and check that `GET /api/auth/me` returns 200. Publish a text post, reload and confirm it appears. Log out and check that `/api/auth/me` returns 401. Log in as B and confirm the same post appears.
4. The backend tests cover B receiving 403 on editing or deleting A's post, a moderator being able to delete it, and registration refusing client-supplied roles. They also cover missing, expired and revoked sessions and separate sessions for the same account.

For local HTTPS, set `CONTAINER_DATABASE_URL` in root `.env` using the same database credentials and the Compose hostname `db`. Run `make stack-up` and open `https://localhost:8443`. Caddy uses a local CA. For browser testing, trust the root certificate on the development machine according to your OS procedure. Copy it with `docker compose -p transcendence-db -f compose.db.yml -f compose.app.yml cp web:/data/caddy/pki/authorities/local/root.crt ./transcendence-local-root.crt`. Keep the certificate out of the repository. `make stack-down` retains database data.

## Extend the example

The [API protocol](../protocol.md#7-content) defines the post routes and permissions. The [data model](../data-model.md) describes the standalone posts table. Its visibility and deletion behaviour are provisional until the team confirms D05 and D06.

Jiyan can use the posts API as the Feed integration example. Jinks can reuse the session and authorization patterns for friend requests. Password recovery, email verification, Remember me and realtime delivery are separate milestones.
