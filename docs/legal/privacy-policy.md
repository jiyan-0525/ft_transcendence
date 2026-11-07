# Privacy Policy

**Last updated:** [Week 6 — final date to be set]
**Applies to:** Community & Content Platform ("the Service"), operated by the
ft_transcendence student team.

---

## 1. Summary

We collect the minimum data needed to run a social platform: an account, the
profile and content you choose to publish, your messages, community and event
membership, marketplace listings, and the technical data required to keep the
service secure and connected.

We do not sell your data, run advertising, or share your data with third parties
for marketing.

---

## 2. Who is responsible

The Service is operated by a student team as part of the 42 Heilbronn curriculum.
For questions about this policy or your data, contact
**privacy@transcendence.example**. The address is configured per deployment and is
reachable from the application footer.

---

## 3. Data we collect

### 3.1 Account data (required)

| Data | Why it is stored |
|---|---|
| Email address | Login, account recovery and security notices |
| Username | Your public identity on the platform |
| Password hash | Authentication; the raw password is never stored |
| Platform role | Distinguishes user, moderator and administrator |
| Session records | Keep you signed in and let you revoke sessions |
| OAuth account link | Sign in with the configured external provider |

### 3.2 Profile data you choose to provide

| Data | Visibility |
|---|---|
| Avatar | Public unless you remove it; a default avatar is generated |
| Bio | Visible according to your profile visibility |
| Friend list | Visible to you and your friends |
| Online status | Visible to friends and to users who can see your profile |
| Locale and notification settings | Private to you |

You can use the Service without adding a bio or uploading an avatar.

### 3.3 Content you publish

Posts, articles, comments, reactions, community posts, event descriptions,
marketplace listings and uploaded images or PDFs. Published content is visible to
the audience you selected (public, friends, community or private). Private drafts
are visible only to you.

### 3.4 Messages

One-to-one conversations, message bodies, timestamps and read state. Messages are
visible to the participants and are stored so history and unread counts work. We
do not scan message content for advertising.

### 3.5 Communities and events

Community membership, community role (owner/member), event RSVPs and attendance
state. Community owners and event organisers can see the membership or attendee
information needed to run their community or event.

### 3.6 Marketplace data

Listing title, description, price, category, condition, images and sale status.
Listings are public. Contacting a seller opens a private conversation; the listing
link is attached to that conversation.

### 3.7 Technical data

IP address, user agent, request timestamps, request IDs, error logs, session and
security events. This data is used to operate the service, enforce rate limits,
diagnose failures and prevent abuse.

### 3.8 Cookies and local storage

We use an HTTP-only session cookie for authentication and local storage for
interface preferences. We do not use advertising or cross-site tracking cookies.
Signing out revokes the session cookie.

---

## 4. How we use your data

- To create and secure your account.
- To show your profile, content and presence to the audience you selected.
- To deliver messages, notifications and community or event updates.
- To enforce permissions and capacity rules.
- To search content you are allowed to see.
- To detect abuse, rate-limit requests and keep the service available.
- To comply with legal obligations.

We do not use your content or messages to train advertising profiles.

---

## 5. Legal bases (GDPR)

| Purpose | Legal basis |
|---|---|
| Account, authentication and security | Performance of a contract (Art. 6(1)(b)) |
| Publishing content and messages you request | Performance of a contract (Art. 6(1)(b)) |
| Abuse prevention and service security | Legitimate interests (Art. 6(1)(f)) |
| Legal compliance and valid authority requests | Legal obligation (Art. 6(1)(c)) |

Where consent is required, it is requested separately and can be withdrawn.

---

## 6. Retention

| Data | Retention |
|---|---|
| Account and profile | Until you delete your account |
| Published content | Until you delete it or delete your account |
| Messages | Until you delete the conversation or your account, subject to the other participant's copy |
| Session records | Until expiry or revocation |
| Security and request logs | 30 days, unless needed for an incident |
| Backups | Rotated on a fixed schedule and deleted after the retention window |

Deleting your account removes or anonymises your personal data, except records we
must keep for security or legal reasons. Content you shared with others may remain
in their conversations or copies; it is no longer attributed to you where
technically possible.

---

## 7. Sharing

We share data only with:

- **Infrastructure providers** that host the application, database and file
  storage, under processing agreements.
- **The configured OAuth provider**, when you choose external login. The provider
  receives the data needed for authentication, not your content.
- **Authorities**, when legally required and after a valid request review.

We do not sell personal data.

---

## 8. Your rights

Under the GDPR you can request:

- **Access** — a copy of your personal data.
- **Rectification** — correct your username, bio, avatar or settings.
- **Erasure** — delete your account and eligible content.
- **Restriction** — limit processing while a request is reviewed.
- **Portability** — export your profile and content in a machine-readable format.
- **Objection** — object to processing based on legitimate interests.
- **Complaint** — contact your supervisory authority.

We respond within 30 days. Contact **privacy@transcendence.example**.

---

## 9. Security

- Passwords are hashed and salted with Argon2id.
- Sessions are HTTP-only, rotated and revocable.
- Every restricted read and write is authorised on the backend.
- Uploads are validated by size, type and magic bytes; files are stored under
  generated names outside the web root.
- Access to production secrets is limited and `.env` is never committed.
- HTTPS is enforced for all traffic.

No system is perfectly secure. If you find a vulnerability, report it to
**security@transcendence.example** rather than exploiting it.

---

## 10. Children

The Service is not intended for children under 16. If we learn that an account
belongs to a child under 16, we will delete it.

---

## 11. International transfers

The Service is hosted in the European Union where possible. If a provider
processes data outside the EEA, transfers rely on an adequacy decision or standard
contractual clauses.

---

## 12. Changes to this policy

We may update this policy as the product changes. Material changes are announced
in the application before they take effect, and the "last updated" date is
revised.

---

## 13. Contact

Questions, requests or complaints:
**privacy@transcendence.example**
