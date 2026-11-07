# Product V1 — Community & Content Platform

Team design baseline · 5 November 2026

## Purpose

Build a social platform where users share content, make friends, join interest communities, organise events and contact second-hand sellers.

**Status:** the backend foundation exists; product features remain to be implemented. “Agreed” below describes the intended behaviour, not completed functionality.

Related documents: [User flows](user-flows.md) · [Data model](data-model.md)

## Current foundation

- FastAPI with `/api/health`, PostgreSQL, SQLAlchemy, Alembic and psycopg.
- User and authentication-session models, with an initial migration.
- Argon2id password hashing, registration input and user response schemas.
- Database connection and migration verified; three password-security tests passed; backend CI passed.

Registration, login, logout, current-user lookup and cookie/session handling still need implementation. A React 19 + TypeScript + Vite scaffold exists in `packages/web`, but the application routes, design system and user-facing features are planned; this baseline does not verify their completion.

## V1 scope

| ID | Area | Planned capability |
|---|---|---|
| F01 | Accounts | Email/password registration, login, logout, session restoration, Remember me, email verification and password reset |
| F02 | Profiles | View profiles, edit own details, default/uploaded avatar and own content |
| F03 | Feed and posts | Text/image posts, chronological feed, All/Friends/My Communities filters, author editing and deletion |
| F04 | Comments | Comment on accessible content; author and moderation controls |
| F05 | Likes | One Like per user per content item, counts and unlike |
| F06 | Friends | Send, cancel, accept and reject requests; remove friendships |
| F07–08 | Messaging and presence | One-to-one text chat, history, unread state, reconnect recovery and friends' online status |
| F09 | Communities | Create and manage communities, membership, roles and community content |
| F10 | Blog | Markdown articles with title, summary, cover and tags; drafts, publication and editing |
| F11 | Events | Time/location, optional capacity, participation/cancellation and change notifications |
| F12 | Marketplace | Listings with images, price/currency, category, condition, availability and seller contact |
| F13 | Notifications | Persistent notifications for friend requests, interactions, communities and events; read state and navigation |
| F14 | Search | Search users, content, communities, events and listings with filters, sorting, pagination and permission checks |
| F15 | Administration | User management, platform roles and content moderation |
| F16 | Media | Image/PDF upload, validation, viewing, replacement, deletion and access control |
| F17 | OAuth | One external login provider with secure account linking |
| F18 | Shared UI and legal | At least 10 shared components, responsive layouts, privacy policy and terms |

V1 excludes payments, shipping, orders/refunds, transaction reviews, ticketing, recurring events, group calls and recommendation algorithms.

## Agreed behaviour

- **Accounts (D10):** registration returns to login without automatically signing in. Keep Remember me, email verification and password reset.
- **Sessions (D10):** allow multiple independent sessions. New logins preserve existing sessions; normal logout revokes only the current session. Use database sessions with HttpOnly/Secure cookies.
- **Chat (D02):** friends can chat normally. Non-friends may initiate contact, but the sender can send only one message until the recipient replies. Reading is not a reply. The same rule applies to seller enquiries; changing listing, device or page does not reset the allowance.
- **Device sync (D10):** devices share server-side message history. Active connections receive updates; disconnected devices catch up after reconnect. Read progress is shared per user. Device-management screens are outside the confirmed scope.
- **Visibility (D03):** use `PUBLIC`, `FRIENDS` and `COMMUNITY`. Anonymous access to public content remains open.
- **Likes (D04):** one cancellable Like per user/content pair; no additional reaction types. Likes on comments are not yet agreed.
- **Permissions:** combine platform role (`USER`, `MODERATOR`, `ADMIN`), community membership/role (`OWNER`, `MEMBER`) and resource ownership. Enforce checks on the server, including search, feeds, attachments and chat history.

“Channels” are navigation areas such as Blog or Events, not necessarily database entities. A community is a member group. The feed aggregates accessible content rather than storing duplicate posts.

## Open decisions

These proposals require team agreement before becoming implementation rules. IDs are shared across the design documents.

| ID | Decision needed | Current proposal or remaining question |
|---|---|---|
| D01 | Visitor access and profile privacy | Start with login required; expose email only to the account owner and authorised administrators |
| D02 | First-contact edge cases | Define rejection, withdrawal, becoming/unbecoming friends and rate limits; the one-message principle is agreed |
| D03 | Community visibility | Decide whether community content must use `COMMUNITY`; proposed removal behaviour is immediate loss of access |
| D04 | Likes on comments | Keep outside the baseline unless explicitly added |
| D05 | Shared content structure | Proposed `Content` + domain detail tables; `share_to_feed` controls feed inclusion; draft/published/deleted state stays separate from visibility |
| D06 | Deletion and retention | Review the resource policies below, retention periods, recovery and final cleanup |
| D07 | Community membership and ownership | Proposed direct join, one owner and ownership transfer before the owner leaves |
| D08 | Permission matrix | Define exact platform/community powers and protected actions; do not assume administrators can read private conversations |
| D09 | OAuth | Choose a provider and linking rules; do not silently merge accounts by matching email alone |
| D10 | Authentication details | Session/Remember me lifetimes, unverified-account access, email/reset credentials, CSRF protection and session revocation after password reset |
| D11 | Upload limits | Agree formats, sizes, counts and unused-upload cleanup; define safe Markdown handling |
| D12 | Friend-request conflicts | Proposed one pending request per user pair; reverse requests reuse the existing relationship; retry/cooldown rules remain open |
| D13 | Comment structure | Proposed flat comments with author editing; agree length limits |
| D14 | Notification rules | Proposed no self-notifications and unavailable-target feedback; agree preferences and grouping |
| D15 | Presence and read state | Aggregate active connections; agree disconnect delay, last-seen privacy and precise read/unread rules |

### Deletion proposals — D06, not approved

| Resource | Proposed handling |
|---|---|
| Posts, articles, events and listings | Soft-delete and hide; coordinate event cancellation and participant notifications |
| Comments | Hide the body; decide whether a placeholder remains |
| Likes and friendships | Delete the relationship when removed |
| Event participation | Mark `CANCELLED` and release capacity |
| Notification targets | Show unavailable without exposing deleted content |
| Files | Clean up after no valid references remain; retention period to be agreed |
| Accounts | Disable first; review permanent deletion, content ownership and message anonymisation separately |

## Ownership and handoff

| Contributor | Main responsibility |
|---|---|
| Julie | Backend foundation, authentication, database conventions and permissions |
| Jiyan | React/shared UI and posts, comments, Likes and Blog APIs |
| Jinks | Friends, messaging, presence and notifications |

Before parallel feature work, establish current-user authentication, common errors, test accounts, a tested API example, migration conventions and the WebSocket authentication contract. Confirm D05–D07 before building the affected models.

A feature is complete when its UI/API/persistence work together, permission and failure cases pass, and a teammate can review and demonstrate it in the shared environment.
