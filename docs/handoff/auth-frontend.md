# Frontend auth contract — handoff to Julie (backend)

> Handoff for Julie (backend) — frontend auth contract, 2026-11-07.
> Branch: `A-product_Owner_jiyan`. Frontend types: `packages/web/src/types/api.ts`.
> Source of truth for the rules: `docs/protocol.md` §2.3 and §4.

The frontend is built against the mock layer for now. Once these routes exist,
only the base URL in `lib/api.ts` changes; components stay the same.

## 1. Routes the frontend calls

| Method | Path | Frontend use | Status |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registration form | Needed now |
| `POST` | `/api/auth/login` | Login form | Needed now |
| `POST` | `/api/auth/logout` | Sign-out in the header | Needed now |
| `GET` | `/api/auth/me` | Session restore on page load | Needed now |
| `GET` | `/api/auth/oauth/:provider/start` | "Continue with GitHub" | Later |

## 2. Request and response bodies

All bodies are JSON with snake_case keys, matching `packages/server/app/schemas.py`.

### `POST /api/auth/register`

```json
{ "email": "ada@example.com", "username": "ada_lovelace", "password": "Example1!" }
```

- `email`: valid address, at most 254 characters, stored lowercase.
- `username`: 3–50 characters, `^[A-Za-z0-9_]+$`, unique.
- `password`: 8–128 characters, with at least one ASCII uppercase letter, lowercase letter, digit and punctuation character.
- The frontend sends **only these three fields**. The server uses
  `extra="forbid"`, so any other field returns `422`.

| Status | When | Body |
|---|---|---|
| `201` | Account created | `UserResponse` (below) |
| `409` | Email or username already taken | error envelope, `code: CONFLICT` |
| `422` | Validation failed | error envelope, `code: INVALID_PAYLOAD` |

**Decided by the frontend:** registration does **not** sign the user in. The
response is `201` with the user, and no session cookie is set (protocol D10).

### `POST /api/auth/login`

```json
{ "email": "ada@example.com", "password": "Example1!" }
```

| Status | When | Body |
|---|---|---|
| `200` | Credentials valid | `UserResponse`; sets the session cookie |
| `401` | Wrong email or password | error envelope, `code: UNAUTHENTICATED` |
| `422` | Malformed body | error envelope, `code: INVALID_PAYLOAD` |

The login form only checks that the password is not empty. Length rules apply to
registration, so existing accounts are never locked out by a rule change.

### `POST /api/auth/logout`

No body. Revokes the current session and clears the cookie. Returns `204`.

### `GET /api/auth/me`

| Status | When | Body |
|---|---|---|
| `200` | Valid session cookie | `UserResponse` |
| `401` | No or expired session | error envelope, `code: UNAUTHENTICATED` |

### `UserResponse`

```json
{
  "id": 1,
  "email": "ada@example.com",
  "username": "ada_lovelace",
  "role": "USER",
  "is_active": true,
  "created_at": "2026-11-07T10:00:00Z"
}
```

`role` is one of `USER`, `MODERATOR`, `ADMIN`. The frontend uses `role` to show
the Admin area, but the server must still enforce it on every admin route.

## 3. Error envelope

Target shape from `docs/protocol.md` §2.3:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "This email is already registered.",
    "requestId": "req_01J..."
  }
}
```

Codes the frontend handles: `INVALID_PAYLOAD`, `UNAUTHENTICATED`, `CONFLICT`,
`INTERNAL`.

**Needed from the backend:** FastAPI's default `{"detail": ...}` must be mapped
to this envelope, including the Pydantic validation array. Until that is done
the frontend cannot show field-level errors reliably.

## 4. Cookie

- Name, `HttpOnly`, `SameSite`, `Secure` and `Path` are the backend's choice.
- In development the frontend reaches the API through the Vite proxy
  (`/api` → `http://127.0.0.1:8000`), so the browser sees one origin and CORS is
  not needed.
- `fetch` will use `credentials: "include"`.

## 5. Questions for Julie

1. Can you confirm the route paths and status codes above, or tell us what
   differs?
2. Login body: is `UserResponse` returned, or only the cookie? (The frontend
   assumes the body, so it can show the signed-in user straight away.)
3. Cookie name and attributes, and the session lifetime.
4. Who maps `{"detail"}` to the error envelope: a global exception handler in
   `main.py`? (We suggest yes.)
5. Is `POST /api/auth/refresh` needed in the first version, or can we leave it
   out until sessions expire?

## 6. What the frontend already does

- Registration and login forms validate with the same rules as `schemas.py`.
- `types/api.ts` holds the request and response shapes.
- Login and register pages show an explicit "not connected" message until the
  API exists, so nothing is faked.
