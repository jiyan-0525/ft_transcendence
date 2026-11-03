# Module claims — evidence and demo scripts

One section per claimed module. Evaluators are shown these; every claim must be
demonstrable. Per the brief, an incomplete or non-functional module scores **zero**,
so no module moves to "done" until every item in the Definition of Done
([`../PLAN.md`](../PLAN.md) §6.4) is checked.

**Claimed: 18 points — 6 Major + 6 Minor.**

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

**Claim.** Vue 3 + TypeScript + Vite (frontend), Pinia + Vue Router (state and
routing), and Go + Echo (backend).

**Demo script**

1. Run `docker compose up --build`; open the app.
2. Navigate Feed → Communities → Blog → Events → Marketplace.
3. Open DevTools → Network: show REST calls to the Go API and the `/api/health`
   response.
4. Open `packages/web/package.json` and `packages/server/go.mod`.

**Evidence:** `packages/web/` (Vue SPA), `packages/server/` (Echo handlers,
middleware, domain packages).

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

**Evidence:** `packages/server/internal/realtime/`, `internal/chat/`,
`internal/notifications/`, `packages/web/src/stores/`, `docs/protocol.md` §5.

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

**Evidence:** `internal/users/`, `internal/friends/`, `internal/chat/`,
`packages/web/src/views/` (Profile, Friends, Messages).

---

## 4. User — Major: standard user management (2 pts) · Lead A + B · ⬜

**Claim.** Email/password registration and login with hashed passwords, editable
profile, avatar upload with a default, friends list and live online status.

**Demo script**

1. Register a new account; show the generated default avatar.
2. Edit the username, bio and avatar; reload and confirm persistence.
3. Sign in as a second user and show the first user's online status.
4. Send and accept a friend request; both lists update.
5. Sign out and confirm protected routes redirect to sign-in.

**Evidence:** `internal/auth/`, `internal/users/`, `internal/friends/`,
`packages/web/src/views/ProfileView.vue`.

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

**Evidence:** `internal/communities/`, `internal/content/`,
`packages/web/src/views/CommunitiesView.vue`.

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

**Evidence:** `internal/auth/` middleware, `internal/users/` role checks,
`internal/communities/`, `internal/content/`, `docs/decisions/0003-permissions.md`.

---

## 7. Web — Minor: ORM (1 pt) · Lead B · ⬜

**Claim.** GORM models, migrations and relations over PostgreSQL.

**Demo script**

1. Show `packages/server/internal/storage/` models and relations.
2. Run `make migrate`; show the applied migration.
3. Query a user with their content, community memberships and friendships.
4. Show the schema in `psql` with foreign keys and indexes.

**Evidence:** `internal/storage/`, migration files, `docs/architecture.md` §6.

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

**Evidence:** `internal/notifications/`, notification triggers in each domain,
`packages/web/src/views/NotificationsView.vue`.

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

**Evidence:** `internal/search/`, domain queries, negative permission tests,
`packages/web/src/views/SearchView.vue`.

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

**Evidence:** `internal/media/`, `ContentAttachment` / `MediaFile` models,
`docs/architecture.md` §8.

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

**Evidence:** `packages/web/src/components/`, token definitions, gallery view.

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

**Evidence:** `internal/auth/` OAuth flow, `OAuthAccount` model, callback route,
`docs/decisions/0001-stack.md`.
