# Privacy Policy

**Last updated:** [W7 — date to be set]
**Applies to:** Multiplayer Pong Arena ("the Service"), operated by the
ft_transcendence student team.

---

## 1. Summary

We collect the minimum we need to run a real-time multiplayer game: an account,
your in-game activity, and the technical data required to keep connections stable.
We do not sell your data, we do not run advertising, and we do not share your data
with third parties for marketing purposes.

## 2. Who is responsible

The Service is operated by a student team. For any question about this policy or
your data, contact **privacy@pong-arena.example** — the address is configured per
deployment and reachable from the footer of the application.

## 3. Data we collect

### 3.1 Account data (required)

| Data | Why |
|---|---|
| Email address | Login identifier and account recovery |
| Username | Displayed in the lobby, matches, tournaments and leaderboards |
| Password hash | We store **only** an argon2id hash with a unique salt — never your password |
| Role | Distinguishes player, moderator and administrator |
| Preferred language | Remembers your language choice between visits |

### 3.2 Data you choose to provide

| Data | Why |
|---|---|
| Profile avatar | Publicly visible to other players; stored with a randomly generated filename |
| Profile display name | Publicly visible |
| Friend list | Visible to you and, for each friend, to that friend |

You may play the game **without** uploading an avatar; a generated default is used.

### 3.3 Gameplay data (created automatically)

Match results (score, opponent, duration, win/loss), cumulative statistics and
rating, tournament participation and results, and achievement progress. This data
is necessary for the leaderboard and match history features.

### 3.4 Technical data

Your IP address and connection metadata are processed by our servers to open and
maintain WebSocket connections, enforce rate limits, and prevent abuse. We do not
store IP addresses in the user database. Server logs are retained for a limited
period (see §6).

### 3.5 Cookies

We set **one** first-party cookie containing a rotating refresh token, so you stay
logged in across visits. It is `HttpOnly`, `Secure`, and `SameSite=Strict`. We use
no advertising or cross-site tracking cookies.

## 4. How we use your data

- To authenticate you and keep your session alive
- To match you with opponents and run tournaments
- To display your profile, statistics and leaderboard position to other players
- To show you your match history
- To keep the service secure, prevent cheating and enforce rate limits
- To comply with legal obligations

We do not use your data for automated decision-making or profiling.

## 5. Legal bases (GDPR)

| Processing | Legal basis |
|---|---|
| Account creation and authentication | Performance of a contract (Art. 6(1)(b)) |
| Gameplay, statistics, leaderboard | Performance of a contract (Art. 6(1)(b)) |
| Security logging and abuse prevention | Legitimate interest (Art. 6(1)(f)) |
| Email for account notifications | Consent (Art. 6(1)(a)), withdrawable |

## 6. Retention

| Data | Retained |
|---|---|
| Account and profile | Until you delete your account |
| Match history and statistics | Until you delete your account, or 12 months of inactivity |
| Refresh tokens | Until revoked, logged out, or 7 days after issue |
| Server logs | 14 days, then deleted |
| Backups | 30 days rolling window |

## 7. Sharing

We do **not** sell or rent your data. We share it only with:

- **Our hosting provider** (Docker-hosting infrastructure), solely to run the Service
- **Nobody else**, unless required by law

Our hosting provider processes data on our instructions under a data processing
agreement.

## 8. Your rights

You can exercise the following at any time:

- **Access** — view everything we hold about you in the app and via a portable
  export (JSON).
- **Rectification** — change your username, avatar or language at any time.
- **Deletion** — delete your account from the settings page. This removes your
  profile, friendships and statistics. Records required for fraud prevention may be
  retained in anonymised form.
- **Erasure confirmation** — deleting your account requires typing your username to
  confirm, and we send a confirmation email to the address on the account.
- **Portability** — download all your data in a machine-readable format.
- **Objection and restriction** — contact us and we will act accordingly.
- **Withdraw consent** — for optional processing, via your settings or by email.

We respond within 30 days. Contact **privacy@pong-arena.example**.

## 9. Security

- Passwords are hashed with argon2id using a unique per-user salt
- Passwords are never logged, emailed, or included in API responses
- Refresh tokens rotate on every use; reuse of a revoked token invalidates the session
- Access tokens are short-lived and held in memory, not in `localStorage`
- All traffic is served over HTTPS
- All user input is validated on the frontend and the backend
- Uploaded files are validated by content, not by the filename, and stored with
  generated names outside the web root

No system is perfectly secure, but these measures are the industry baseline and we
do not knowingly introduce vulnerabilities.

## 10. Children

The Service is not directed at children under 16, and we do not knowingly collect
their data.

## 11. Changes to this policy

We will post any change here with an updated date at least 14 days before it takes
effect. Material changes are announced in the application.

## 12. Contact

Questions, requests, or complaints: **privacy@pong-arena.example**
