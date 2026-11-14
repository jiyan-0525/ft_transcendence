# Week 1 backend handoff

The authentication contract is in [auth-frontend.md](auth-frontend.md). Protected routes obtain the active user with `Depends(get_current_user)`. The request-scoped database session comes from `Depends(get_db)`. For browser writes, reuse `Depends(require_trusted_origin)`. Use the existing role and owner helpers for server-side authorization.

## Run and verify

1. Run `make setup`, `make up`, `make migrate`, `make test`, and `make web-test` from the repository root.
2. Run `make dev` and `make web-dev` in separate terminals. Open the Vite URL at port 5173. Check `/api/health` for process health and `/api/status` for database readiness.
3. Register two distinct test users. Log in as A, reload and check that `GET /api/auth/me` returns 200. Publish a text post, reload and confirm it appears. Log out and check that `/api/auth/me` returns 401. Log in as B and confirm the same post appears.
4. The backend tests cover B receiving 403 on editing or deleting A's post, a moderator being able to delete it, and registration refusing client-supplied roles. They also cover missing, expired and revoked sessions and separate sessions for the same account.

For local HTTPS, set `CONTAINER_DATABASE_URL` in root `.env` using the same database credentials and the Compose hostname `db`. Run `make stack-up` and open `https://localhost:8443`. Caddy uses a local CA. For browser testing, trust the root certificate on the development machine according to your OS procedure. Copy it with `docker compose -p transcendence-db -f compose.db.yml -f compose.app.yml cp web:/data/caddy/pki/authorities/local/root.crt ./transcendence-local-root.crt`. Keep the certificate out of the repository. `make stack-down` retains database data.

## Text post example

- `GET /api/posts` returns the newest posts for signed-in users. Default limit is 30, maximum 100.
- `POST /api/posts` accepts `{"body":"Hello"}`. The server assigns the author from the session.
- `PATCH /api/posts/{id}` accepts the same body and requires ownership.
- `DELETE /api/posts/{id}` allows the author, a moderator or an administrator. The example deletes the row.
- Errors use the existing `error` envelope. `error.requestId` matches `X-Request-ID`.

The standalone posts table, signed-in feed visibility, 2,000-character limit and deletion policy are provisional decisions for this example. Confirm shared Content, visibility and retention before extending it into other domains. The example has no endpoint for changing user roles.

Jiyan can use the posts API as the Feed integration example. Jinks can reuse the session and authorization patterns for friend requests. Password recovery, email verification, Remember me and realtime delivery are separate milestones.
