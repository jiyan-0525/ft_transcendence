# Authentication handoff

The [protocol](../protocol.md#4-authentication) is the contract for registration, login, current-user lookup and logout. Routes live in `packages/server/app/auth.py`. The React client is in `packages/web/src/lib/auth.ts` and the auth store is in `packages/web/src/stores/auth.ts`.

- Register, then sign in separately. Show duplicate email and username errors on their respective fields.
- Use the session cookie for current-user lookup after reload. The HTTP client includes cookies. The browser does not need to read the cookie value.
- Logout revokes the current session and clears the cookie. Other valid sessions can continue.
- Use `get_current_user()` for protected endpoints and derive the actor on the server. The post routes demonstrate ownership and platform role checks.

See the [Week 1 handoff](week-1-backend.md) for local setup, frontend integration and verification. Remember me, email verification, password reset and OAuth remain follow-up work.
