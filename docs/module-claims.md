# Module claims — evidence and demo scripts

One section per claimed module. Evaluators are shown these; every claim must be
demonstrable. Per the brief, an incomplete or non-functional module scores **zero**,
so no module moves to "done" until all six items in the Definition of Done
(PLAN.md §6.4) are checked.

**Claimed: 17 committed points + 3 stretch = 20 maximum.**

---

## Definition of Done checklist (copy per module)

- [ ] Runs from a clean `docker compose up --build` with no manual steps
- [ ] No errors **and no warnings** in the browser console during the demo
- [ ] Input validated on both frontend and backend
- [ ] Tested by a member other than the author
- [ ] README section updated + demo script below is complete
- [ ] Merged to `main` through a PR with one approving review

---

## Web — Major: framework for frontend and backend (2 pts) · Owner B · ⬜

**Claim.** React 18 + Vite (frontend framework) and NestJS on Fastify (backend
framework).

**Demo script**
1. Run `docker compose up --build`, open the app.
2. Interact with the UI: navigate to the lobby, open a match.
3. Open DevTools → Network: show REST calls to the NestJS API.
4. Open `packages/web/package.json` and `packages/server/package.json`.

**Evidence:** `packages/web/` (React), `packages/server/` (NestJS modules,
controllers, guards).

---

## Web — Major: real-time features with WebSockets (2 pts) · Owner B · ⬜

**Claim.** Socket.IO WebSocket gateway drives all gameplay: real-time updates
across clients, graceful connect/disconnect, room-scoped broadcasting.

**Demo script**
1. Open two browser profiles side by side, log in as two different users.
2. Both join the same room; move one paddle.
3. The other screen updates live — DevTools → Network shows the WS frames.
4. Close one tab mid-match: the opponent sees a "disconnected, 30 s to
   reconnect" notice; reopen and the match resumes.

**Evidence:** `packages/server/src/gateway/`, snapshot broadcasting per room,
`game:state` at 20 Hz, `docs/architecture.md` §3.

---

## Web — Minor: ORM (1 pt) · Owner C · ⬜

**Claim.** Prisma ORM with a relational schema, migrations, and seed script.

**Demo script**
1. Show `packages/server/prisma/schema.prisma` and its relations.
2. Run `make migrate` — show the generated SQL migration.
3. Run `make seed` — show the demo users in the database.
4. `npx prisma studio` — show a user row with a related match record.

**Evidence:** schema, `prisma/migrations/`, seed script.

---

## Gaming — Major: complete web-based game (2 pts) · Owner B · ⬜

**Claim.** A complete 2D Pong game: paddles, ball physics, scoring to 11, serve
rotation, win/loss conditions, rules screen, scoreboard.

**Demo script**
1. Start a 1v1 match against another user.
2. Score 11 points; the winner screen appears.
3. The result is recorded in the profile's match history.

**Evidence:** `packages/server/src/game/` engine, client rules screen.

---

## Gaming — Major: remote players (2 pts) · Owner B + D · ⬜

**Claim.** Two players on separate computers play the same match in real time, with
latency tolerance, graceful disconnection, and reconnection logic.

**Demo script**
1. Two laptops, same network — log in as two users, join the same room.
2. Play a full point; mention the interpolation delay and server-authoritative
   model.
3. On one laptop, disable Wi-Fi mid-rally.
4. The opponent sees the disconnection notice and a 30 s countdown.
5. Re-enable Wi-Fi, reload — the score and ball position are restored and play
   continues.

**Evidence:** offset estimation, 100 ms interpolation buffer, 250 ms extrapolation
cap, 30 s reconnect grace, `game:state` replay on reconnect.

---

## Gaming — Major: multiplayer 3+ (2 pts) · Owner B + D · ⬜

**Claim.** Free-for-all with three or more simultaneous players: fair mechanics for
everyone, synchronised state across all clients.

**Demo script**
1. Create a 4-player room from the lobby.
2. Join with three more browser profiles.
3. All four paddles are controlled independently and all clients show the same
   state simultaneously.
4. Score a point; confirm all clients update identically.

**Evidence:** the same `step()` engine with N paddles; one room, one authoritative
loop.

---

## Gaming — Minor: tournament system (1 pt) · Owner D · ⬜

**Claim.** Single-elimination bracket with registration, capacity, seeding, live
progress, and a recorded champion.

**Demo script**
1. Open Tournaments → Create (max 8 players) → register.
2. Register four users; show the drawn bracket.
3. Play match 1 → winner advances automatically to the next round.
4. Finish the bracket → champion is announced and stored on the tournament record.

**Evidence:** `Tournament` / `TournamentMatch` tables, bracket UI, auto-advance.

---

## Gaming — Minor: game customization (1 pt) · Owner D · ⬜

**Claim.** Power-ups and arena themes with player-selectable settings and working
defaults.

**Demo script**
1. Settings → enable power-ups and pick an arena theme.
2. Play a match: power-ups spawn and affect play (paddle speed, ball speed, shrink).
3. Change the paddle colour and theme; both persist across matches.
4. Start a match with power-ups disabled → default Pong rules apply.
5. Play against the AI with power-ups on → the AI uses them too.

**Evidence:** `UserSettings` table, power-up logic inside `step()`.

---

## User Management — Major: user management and authentication (2 pts) · Owner A · ⬜

**Claim.** Email/password signup and login (argon2id hashed, salted); profile
editing; avatar upload with a default; friends with add/remove and a friends list;
online status; public profile page.

**Demo script**
1. Register with email and password; log out; log back in.
2. Edit username and upload an avatar; it appears on the profile.
3. Search for another user, send a friend request; they accept.
4. Both users appear in each other's friends list, with live online status.
5. Open the public profile page — stats and match history are shown.

**Evidence:** `User`, `Friendship` tables; argon2id hashes in the DB (show that the
column contains a hash, not a password); auth guards.

---

## AI — Major: AI opponent (2 pts) · Owner D · ⬜

**Claim.** An AI opponent that is challenging but beatable, simulates human
behaviour rather than perfect play, respects the player's customisation settings,
and can explain its implementation.

**Demo script**
1. Lobby → Play vs AI; choose easy / medium / hard.
2. Play each level: beat the AI on hard, lose to it on easy.
3. Enable power-ups → the AI picks them up and uses them.
4. Explain: the AI only produces input frames (`paddleUp` / `paddleDown`); it
   never modifies game state, so it obeys exactly the same physics as a human.
   Difficulty is expressed as reaction delay, aim error, and a miss probability.

**Evidence:** `packages/server/src/ai/` policy module; same input interface as
humans.

---

## Stretch — User Management: game statistics and match history (1 pt) · Owner D · ⬜

**Claim.** Persistent statistics (wins, losses, draws, rating, XP/level),
chronological match history with opponents and dates, and a global leaderboard.

**Demo script**
1. Play three matches (win, loss, win).
2. Profile → Statistics: totals, rating, level progress bar.
3. Profile → History: each match with date, opponent and score.
4. Leaderboard: rank by rating or wins; show own position highlighted.

---

## Stretch — A11y/i18n: three languages with a switcher (1 pt) · Owner C · ⬜

**Claim.** EN, DE and FR; all user-facing text translatable; language switcher in
the UI; choice persisted.

**Demo script**
1. Switch EN → DE → FR from the header; every screen follows, including the game
   HUD and legal pages.
2. Reload — the language persists.
3. Navigate the entire app using only the keyboard; focus is visible throughout.

---

## Stretch — DevOps: health/status page with backups (1 pt) · Owner C · ⬜

**Claim.** Health check and status page with dependency status, plus automated
backups with a documented restore procedure.

**Demo script**
1. Open `/status`: database, API and WebSocket gateway report status and latency.
2. `/api/health` returns JSON consumed by the container healthcheck.
3. Show the scheduled `pg_dump` job and a backup artefact.
4. Documented restore: restore into a scratch database and show the user count.

---

## Rejected / not claimed

Recorded so evaluators do not expect these:

| Module | Why not |
|---|---|
| Public API | Needs 5 documented endpoints, key management, rate limiting, and docs — better spent on a game that works |
| Advanced search | Low value without large searchable content |
| OAuth 2.0 | Nice, but authentication is already scored and solid |
| Spectator mode | Cute, not enough to justify the state-broadcast work alongside tournaments |
| SSR | Adds deployment and hydration complexity for an app that is inherently behind a login |
| Microservices | Premature for this scale; would hurt the single-command requirement |
| WAF + HashiCorp Vault | Infrastructure the team cannot operate or demonstrate reliably in the time available |
| Blockchain | Largest external dependency of any module, for one point |

If capacity appears in W5, the highest-value addition is a **basic chat with
invite-to-game** (Web Major: user interaction, 2 pts) — see PLAN.md §11.
