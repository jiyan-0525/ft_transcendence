# Module claims — evidence and demo scripts

One section per claimed module. Evaluators are shown these; every claim must be
demonstrable. Per the brief, an incomplete or non-functional module scores **zero**,
so no module moves to "done" until every item in the Definition of Done
([`../PLAN.md`](../PLAN.md) §6.4) is checked.

**Claimed: 18 points — 6 Major + 6 Minor.**

**Status key:** ✅ implemented and verifiable · 🔄 foundation exists, feature
incomplete · ⬜ planned, no code yet.

Paths marked *(planned)* do not exist yet. They name the intended location so the
claim can be reviewed against the plan without implying the feature is done.

## Scoring boundaries

The configuration lists overlapping majors. Demonstrate each in full, not one
standing in for the other:

- **#3 User interaction** — public profiles, friend requests and basic one-to-one
  messaging.
- **#4 Standard user management** — registration/login, profile editing, avatar
  with a default, friends list, live online status.
- **#5 Organization system** — community lifecycle, membership and community
  roles.
- **#6 Advanced permissions** — platform-wide user CRUD and role management.
  Editing your own post is ownership, not Advanced Permissions.
- Blog, Events and Marketplace are product features, not extra scoring modules.
- Advanced chat (group chat, calls), AI and game modules are outside the 18 points.

---

## Definition of Done checklist (copy per module)

- [ ] Runs from a clean `docker compose up --build` with no manual steps
- [ ] No errors **and no warnings** in the browser console during the demo
- [ ] Validated on the frontend **and** the backend
- [ ] Tested by a member other than the author
- [ ] README section updated + demo script below is complete
- [ ] Merged to `main` through a PR with one approving review

---

## 1. Web — Major: frontend and backend frameworks (2 pts) · Lead A + B · 🔄 scaffold

**Claim.** React 19 + TypeScript + Vite (frontend), React Router 7 + Zustand 5 +
TanStack Query 5 (routing and state), and Python 3.12 + FastAPI (backend), with
SQLAlchemy 2.0 and Alembic.

**Demo script**

1. Run `make up && make migrate && make dev`; open the Vite dev server with
   `make web-dev`.
2. Show the React shell and the `/api/health` response through the Vite proxy.
3. Open DevTools → Network: show the request to the FastAPI API and its JSON
   response.
4. Open `packages/web/package.json` and `packages/server/requirements.txt` to show
   both frameworks and their versions.

**Evidence:** `packages/web/` (React SPA scaffold), `packages/server/app/`
(FastAPI app, models, schemas), `packages/server/requirements.txt`.

---

## 2. Web — Major: real-time features (2 pts) · Lead C · ⬜

**Claim.** A single authenticated WebSocket carries chat messages, notifications
and presence, with persistence and reconnect recovery.

**Demo script**

1. Sign in as two users in two browser profiles.
2. Send a message from one; it appears for the other without a refresh.
3. Show the online indicator on both profiles.
4. Disable the network on one client, send a message from the other, then
   reconnect: the missed message and notification are fetched.
5. Open a second tab as the same user; closing one tab keeps the user online.

**Evidence (planned):** `packages/server/app/realtime/`, `app/routers/chat.py`,
`app/routers/notifications.py`, `packages/web/src/lib/ws.ts`,
`packages/web/src/stores/`, [`protocol.md`](protocol.md) §14.

**Current state:** no WebSocket endpoint or client exists yet.

---

## 3. User — Major: user interaction (2 pts) · Lead A + C · ⬜

**Claim.** Public profiles, a friend graph with requests/accept/reject/remove, and
one-to-one direct messages.

**Demo script**

1. Open a public profile from a post or search result.
2. Send a friend request; accept it from the second account.
3. Open Messages and send a direct message.
4. Show the message history after a reload.
5. Remove the friend and confirm the relationship disappears for both users.

**Evidence (planned):** `packages/server/app/routers/users.py`,
`app/routers/friends.py`, `app/routers/chat.py`,
`packages/web/src/pages/ProfilePage.tsx`, `FriendsPage.tsx`,
`MessagesPage.tsx`.

**Current state:** no profile, friend or messaging code exists yet.

---

## 4. User — Major: standard user management (2 pts) · Lead A + B · ⬜

**Claim.** Email/password registration and login with Argon2id hashing, editable
profile, avatar upload with a default, friends list and live online status.

**Demo script**

1. Register a new account; show the generated default avatar.
2. Edit the username, bio and avatar; reload and confirm persistence.
3. Sign in as a second user and show the first user's online status.
4. Send and accept a friend request; both lists update.
5. Sign out and confirm protected routes redirect to sign-in.

**Evidence:** `packages/server/app/schemas.py` and `app/security.py` define the
registration contract and Argon2id hashing. Routes and UI are planned:
`packages/server/app/routers/auth.py`, `packages/web/src/pages/auth/RegisterPage.tsx`,
`LoginPage.tsx`, `ProfilePage.tsx`.

**Current state:** validation schemas and hashing exist; registration, login,
logout, sessions and profile UI do not.

---

## 5. User — Major: organization system (2 pts) · Lead D · ⬜

**Claim.** User-created communities with membership management, community roles
and community-scoped content. A page alone is not this module; the community
entity and its permissions are.

**Demo script**

1. Create a community as user A; A becomes the owner.
2. Join with user B; show the member list and B's member role.
3. Publish a community-only post as B; it appears in the community feed.
4. Remove B as owner; B can no longer post to the community.
5. Show the community's events and community-scoped content.

**Evidence (planned):** `packages/server/app/routers/communities.py`,
`app/services/communities.py`, `packages/web/src/pages/CommunitiesPage.tsx`.

**Current state:** planned; no community model or route exists.

---

## 6. User — Major: advanced permissions (2 pts) · Lead B · ⬜

**Claim.** Three enforced layers: platform roles (Admin/Moderator/User), community
roles (Owner/Member), and content ownership (author/seller/organiser).

**Demo script**

1. Sign in as Admin; open Administration and change a user's role.
2. Sign in as a regular user; request `/admin` directly and show the `403`.
3. As a community owner, remove a member.
4. As a non-member, request a restricted community post by ID; show `403`.
5. As a different user, try to edit someone else's post; show `403`.

**Evidence:** the `users.role` check constraint in `packages/server/app/models.py`
already restricts platform roles. Authorisation dependencies and route checks are
planned: `app/dependencies/auth.py`, `app/routers/admin.py`,
`docs/decisions/0003-permissions.md`.

**Current state:** role column and constraint exist; no authorisation logic yet.

---

## 7. Web — Minor: ORM (1 pt) · Lead B · 🔄 foundation

**Claim.** SQLAlchemy 2.0 models, Alembic migrations and relationships over
PostgreSQL.

**Demo script**

1. Show `packages/server/app/models.py` — the `User` and `AuthSession` mapped
   classes and the foreign key.
2. Run `make migrate`; show the applied revision in `alembic_version`.
3. Show the generated schema in `psql` with the unique constraints, check
   constraint and indexes.
4. Run `python -m alembic check` to show that models and migrations agree.

**Evidence:** `packages/server/app/models.py`,
`packages/server/migrations/versions/88fd3dcf3c30_create_users_and_sessions.py`,
`packages/server/app/database.py`, [`architecture.md`](architecture.md) §6.

**Current state:** two mapped tables and one migration exist. The full V1 relation
graph is planned.

---

## 8. User — Minor: notification system (1 pt) · Lead C · ⬜

**Claim.** Persistent notifications covering friend requests, reactions, community
membership changes and event changes, with read state and settings.

**Demo script**

1. Send a friend request; the recipient sees a notification and an unread badge.
2. Comment on a post; the author receives a notification.
3. Add a user to a community; that user is notified.
4. Reschedule an event; all attendees receive a notification.
5. Mark one notification read, reload and show the unread badge decremented.

**Evidence (planned):** `packages/server/app/routers/notifications.py`,
`app/services/notifications.py`, notification triggers in each domain,
`packages/web/src/pages/NotificationsPage.tsx`.

**Current state:** planned; no notification model or route exists.

---

## 9. Web — Minor: advanced search (1 pt) · Lead E · ⬜

**Claim.** Keyword search across users, content, communities, events and listings,
with filters, sorting, pagination and visibility checks.

**Demo script**

1. Search a keyword that matches a post, an event and a listing.
2. Filter by type and sort by newest; page to the next result set.
3. Sign in as a non-member and repeat: restricted community content is absent.
4. Sign in as a member and confirm the same item appears.
5. Show the API response with pagination metadata.

**Evidence (planned):** `packages/server/app/routers/search.py`,
`app/services/search.py`, negative permission tests,
`packages/web/src/pages/SearchPage.tsx`.

**Current state:** planned; no search code exists.

---

## 10. Web — Minor: file upload and management (1 pt) · Lead B · ⬜

**Claim.** Images for avatars, posts, blog covers, event covers and listings; PDFs
for community resources and event attachments; validation, progress, preview,
access control, delete and replace.

**Demo script**

1. Upload an oversized or wrong-type file; show the backend rejection.
2. Upload a valid image; show progress and preview.
3. Replace the image; confirm the old file is no longer served.
4. Upload a PDF attachment to a restricted event; open it as a member.
5. Request the same file as a non-member; show `403`.
6. Delete the post; confirm its attachments are removed.

**Evidence (planned):** `packages/server/app/routers/media.py`,
`MediaFile` / `ContentAttachment` models, [`architecture.md`](architecture.md) §8.

**Current state:** planned; no upload model, route or storage configuration exists.

---

## 11. Web — Minor: custom design system (1 pt) · Lead A · ⬜

**Claim.** At least 10 reusable components with shared colour, typography, spacing
and icon rules, used across the product.

**Demo script**

1. Open the component gallery route.
2. Show buttons, inputs, forms, cards, avatars, badges, tabs, modals, menus and
   empty states.
3. Change a design token; show the components update together.
4. Navigate Feed, Profile and Marketplace; show the same components in use.

**Evidence (planned):** `packages/web/src/components/`,
`packages/web/src/style.css` (tokens), `pages/DesignSystemPage.tsx`.

**Current state:** Tailwind is installed and the App shell uses it; no shared
components or gallery exist yet.

---

## 12. User — Minor: OAuth 2.0 authentication (1 pt) · Lead B · ⬜

**Claim.** One external OAuth provider alongside email/password login, with
account linking and a safe error path.

**Demo script**

1. Sign in with the configured provider; complete the profile.
2. Show the linked provider on the account settings page.
3. Sign out, sign in again with the provider; the same account is used.
4. Link the provider to an existing email/password account.
5. Cancel the provider consent screen; the app returns to sign-in without an
   error state.

**Evidence (planned):** `packages/server/app/routers/auth.py` OAuth flow,
`OAuthAccount` model, callback route, [`decisions/0001-stack.md`](decisions/0001-stack.md).

**Current state:** planned; no OAuth route, provider configuration or model exists.
