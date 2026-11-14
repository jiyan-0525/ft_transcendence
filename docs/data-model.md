# Data model

Schema reference for the Community & Content Platform. Product behaviour lives in
[`product-v1.md`](product-v1.md); architecture and request flow live in
[`architecture.md`](architecture.md); decisions live in [`decisions/`](decisions/).

**Status:** the `users` and `sessions` tables exist and are migrated. Every other
entity below is a **proposal** for V1 and has not been created yet. Do not treat a
planned table or field as implemented until its Alembic revision is merged.

---

## 1. Naming conventions

- PostgreSQL tables and columns use `snake_case`.
- Table names are plural (`users`, `sessions`, `communities`).
- Primary keys are integer `id` columns unless a later decision changes them.
- Foreign keys are `<entity>_id` and are indexed.
- Timestamps are `timestamptz` with `server_default=now()`; mutable states add
  `updated_at` when the entity needs it.
- The React client maps snake_case DTOs to camelCase domain models in
  `packages/web/src/lib/api.ts`. The database names never leak into components.

---

## 2. Implemented schema

### `users`

| Column | Type | Constraints / default | Notes |
|---|---|---|---|
| `id` | integer | primary key | |
| `email` | varchar(254) | unique, not null | Normalised to lowercase by `RegisterRequest` |
| `username` | varchar(50) | unique, not null | 3–50 chars, `^[A-Za-z0-9_]+$` at validation |
| `password_hash` | text | not null | Argon2id hash only; never the raw password |
| `role` | varchar(16) | not null, default `USER` | `CHECK role IN ('USER', 'MODERATOR', 'ADMIN')` |
| `is_active` | boolean | not null, default `true` | Disabled accounts cannot authenticate |
| `created_at` | timestamptz | not null, default `now()` | |

Validation lives in `packages/server/app/schemas.py`; the table constraints are a
second line of defence, not a replacement for Pydantic checks.

### `sessions`

| Column | Type | Constraints / default | Notes |
|---|---|---|---|
| `id` | integer | primary key | |
| `user_id` | integer | not null, FK → `users.id` `ON DELETE CASCADE`, indexed | |
| `token_hash` | varchar(64) | unique, not null | Hash of the session credential; raw token is never stored |
| `expires_at` | timestamptz | not null, indexed | Expiry sweep target |
| `revoked_at` | timestamptz | nullable | Set on logout or forced revocation |
| `created_at` | timestamptz | not null, default `now()` | |

A user may have several independent sessions (Product V1 D10). Logout revokes the
current session; it does not delete the account or other devices.

### Current relationships

```
users 1 ────< sessions
      (users.id = sessions.user_id, ON DELETE CASCADE)
```

### Current indexes and constraints

| Name | Definition | Purpose |
|---|---|---|
| `users_pkey` | primary key (`id`) | Identity |
| unique on `users.email` | implicit unique constraint | One account per email |
| unique on `users.username` | implicit unique constraint | One account per username |
| `ck_users_role` | `role IN ('USER', 'MODERATOR', 'ADMIN')` | Platform role domain |
| `sessions_pkey` | primary key (`id`) | Identity |
| unique on `sessions.token_hash` | implicit unique constraint | A token maps to one session |
| `ix_sessions_user_id` | index (`user_id`) | "All sessions for a user" |
| `ix_sessions_expires_at` | index (`expires_at`) | Expiry sweep |
| FK `sessions_user_id_fkey` | `user_id → users.id` `ON DELETE CASCADE` | Deleting a user removes sessions |

The source of truth is `packages/server/app/models.py` and the migration under
`packages/server/migrations/versions/`.

---

### `posts`

Migration `88fd3dcf3c30` creates users and sessions. The Week 1 revision `b3080df2fc01` adds the standalone text-post table.

| Field | Storage |
|---|---|
| `id` | Integer primary key |
| `author_id` | Required reference to `users.id` with restricted deletion |
| `body` | Required text, at most 2,000 characters |
| `created_at` | Timezone-aware timestamp with a server default |

One user can author many posts. The `(created_at, id)` index supports newest-first listing. The Week 1 post routes use the session to set the author. The example deletes rows directly and D05 and D06 still govern the target design.

## 3. Planned V1 entities

Grouped by domain. Field lists name the important columns, not every audit column.
All of these are proposals and require an Alembic migration before use.

### Identity and relationships

| Entity | Key fields | Notes |
|---|---|---|
| `oauth_accounts` | `id`, `user_id → users.id`, `provider`, `provider_subject`, `created_at` | Unique (`provider`, `provider_subject`); never link by matching email alone (D09) |
| `friend_requests` | `id`, `requester_id → users.id`, `addressee_id → users.id`, `status` (`PENDING`, `ACCEPTED`, `REJECTED`), `created_at` | Unique pair per direction; no self-requests |
| `friendships` | `id`, `user_a_id → users.id`, `user_b_id → users.id`, `created_at` | Unique unordered pair; acceptance creates the row in the same transaction |

`friend_requests` records history; `friendships` records the current relationship.
Removing a friendship does not rewrite the old request row.

### Communities

| Entity | Key fields | Notes |
|---|---|---|
| `communities` | `id`, `owner_id → users.id`, `name`, `slug` (unique), `description`, `visibility`, `created_at` | Ownership transfer required before the owner leaves (D07) |
| `community_members` | `community_id → communities.id`, `user_id → users.id`, `role` (`OWNER`, `MEMBER`), `joined_at` | Unique (`community_id`, `user_id`) |

### Shared content

| Entity | Key fields | Notes |
|---|---|---|
| `content` | `id`, `author_id → users.id`, `community_id? → communities.id`, `type` (`POST`, `ARTICLE`, `EVENT`, `LISTING`), `visibility` (`PUBLIC`, `FRIENDS`, `COMMUNITY`, `PRIVATE`), `published_at?`, `deleted_at?`, `created_at` | Common row for feed, comments, reactions and attachments |
| `posts` | `content_id → content.id` (primary key), `body` | Short-form post |
| `articles` | `content_id → content.id` (primary key), `title`, `summary`, `body_markdown`, `cover_media_id? → media_files.id` | Blog article; Markdown, not HTML |
| `comments` | `id`, `content_id → content.id`, `author_id → users.id`, `body`, `created_at`, `deleted_at?` | Flat comments for V1 (D13) |
| `reactions` | `id`, `content_id → content.id`, `user_id → users.id`, `kind`, `created_at` | Unique (`content_id`, `user_id`, `kind`); V1 agrees only `LIKE` (D04) |

A `Content` row plus its domain row are created in one transaction. Draft and
published state is separate from visibility (D05).

### Events

| Entity | Key fields | Notes |
|---|---|---|
| `events` | `content_id → content.id` (primary key), `title`, `description`, `location`, `starts_at`, `ends_at`, `capacity?`, `status` (`UPCOMING`, `CANCELLED`, `COMPLETED`) | Capacity is enforced transactionally |
| `event_participants` | `event_id → events.content_id`, `user_id → users.id`, `status` (`GOING`, `CANCELLED`), `created_at` | Unique (`event_id`, `user_id`); cancellation releases a place |

### Marketplace

| Entity | Key fields | Notes |
|---|---|---|
| `listings` | `content_id → content.id` (primary key), `title`, `description`, `price_cents`, `currency`, `category`, `condition`, `status` (`AVAILABLE`, `RESERVED`, `SOLD`) | No payments, orders or shipping in V1 |

### Chat

| Entity | Key fields | Notes |
|---|---|---|
| `conversations` | `id`, `created_at` | One conversation per user pair is the agreed default |
| `conversation_members` | `conversation_id → conversations.id`, `user_id → users.id`, `last_read_at?` | Unique (`conversation_id`, `user_id`) |
| `messages` | `id`, `conversation_id → conversations.id`, `sender_id → users.id`, `body`, `created_at` | Persisted before broadcast; cursor pagination by `created_at, id` |

### Files

| Entity | Key fields | Notes |
|---|---|---|
| `media_files` | `id`, `owner_id → users.id`, `storage_key` (unique), `mime_type`, `size_bytes`, `created_at` | Metadata only; bytes live in the upload volume |
| `content_attachments` | `content_id → content.id`, `media_id → media_files.id`, `role` (`AVATAR`, `COVER`, `GALLERY`, `ATTACHMENT`) | Unique (`content_id`, `media_id`, `role`) |

### Notifications

| Entity | Key fields | Notes |
|---|---|---|
| `notifications` | `id`, `recipient_id → users.id`, `type`, `payload_json`, `read_at?`, `created_at` | Index (`recipient_id`, `read_at`) for the unread badge |

`payload_json` stores identifiers and safe display data only. When a notification
is opened, the target is re-read through normal permission checks; the payload is
not an authorisation token.

---

## 4. Target relationships

```
users 1 ────< sessions
users 1 ────< oauth_accounts
users 1 ────< friend_requests >──── 1 users
users 1 ────< friendships >──── 1 users

users 1 ────< community_members >──── 1 communities
users 1 ────< content >──── 0..1 communities
content 1 ────< comments
content 1 ────< reactions >──── 1 users

content 1 ──── 1 events 1 ────< event_participants >──── 1 users
content 1 ──── 1 listings
content 1 ────< content_attachments >──── 1 media_files

conversations 1 ────< conversation_members >──── 1 users
conversations 1 ────< messages >──── 1 users (sender)

users 1 ────< notifications
users 1 ────< media_files
```

`Post`, `Article`, `Event` and `Listing` all point at `Content` one-to-one; the
shared row is what the feed, comments, reactions and attachments reference. See
[`decisions/0002-shared-content-model.md`](decisions/0002-shared-content-model.md).

---

## 5. Constraints, indexes and transactions

Planned indexes cover every foreign key and every filter/sort column:
`content(published_at, visibility)`, `listings(status, category, price_cents)`,
`events(starts_at)`, `notifications(recipient_id, read_at)`,
`messages(conversation_id, created_at, id)`.

Planned transactional rules:

- **Event RSVP:** lock the event row or use a conditional insert so two
  simultaneous claims for the final place produce exactly one success.
- **Friend acceptance:** update the request and insert the friendship in one
  transaction.
- **Content publish:** insert `content`, the domain row, attachments and
  notifications together.
- **Account deletion:** decide what is anonymised versus deleted and apply it in
  one transaction (D06).

---

## 6. Migration workflow

```bash
make up                 # start PostgreSQL
make migrate            # apply pending Alembic revisions
make test               # connectivity, alembic check and pytest
```

When a model changes:

1. Update `packages/server/app/models.py`.
2. Generate a revision with Alembic from `packages/server`.
3. Review the generated upgrade **and** downgrade.
4. Run `python -m alembic check`; CI fails if models and migrations differ.
5. Update this document and the affected entity row.

The current revision is `88fd3dcf3c30` (`create users and sessions`). There is no
later migration yet.

---

## 7. Open decisions affecting the schema

| ID | Question | Effect on schema |
|---|---|---|
| D03 | Community visibility rules | Visibility enum and membership checks |
| D05 | Shared `Content` versus per-domain tables | Core shape of the content model |
| D06 | Hard versus soft delete and retention | `deleted_at` columns and cleanup jobs |
| D07 | Direct join and ownership transfer | `community_members.role` transitions |
| D09 | OAuth provider and linking rules | `oauth_accounts` uniqueness and linking |
| D10 | Session lifetime, Remember me and CSRF | `sessions` expiry and rotation |
| D11 | Upload formats, sizes and quotas | `media_files` validation and storage limits |
| D13 | Comment editing and length limits | `comments` columns and constraints |
| D15 | Presence and read state | `conversation_members.last_read_at` semantics |

Resolve the linked decisions before treating the proposed columns as final.
