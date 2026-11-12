# Handoff for B: frontend foundation and doc alignment

**From:** A (Jiyan)
**Branch:** `A-product_Owner_jiyan` (pushed, head `0845893`)
**Target:** `master` (still at `577a89d`; not merged, no PR opened yet)

## TL;DR

- I migrated `packages/web` from Vue to React 19 + TypeScript + Vite.
- I added a frontend CI job and `web-*` Makefile targets.
- I realigned the shared docs with the React + FastAPI stack from PR #15.
- **I did not change any backend code.** `packages/server/` is untouched.

## What I changed

| Area | Files | Commit |
|---|---|---|
| Frontend scaffold | `packages/web/**` | `8c896fd` |
| Frontend CI job | `.github/workflows/ci.yml` | `ce8e2f9` |
| Makefile and README | `Makefile`, `README.md` | `b787d49`, `073873e` |
| Docs alignment | see below | `7ad1120` |
| Merge of `origin/master` | — | `8eec060` |

Docs I edited, which you may own or review:

- `PLAN.md`: stack table, repository layout, architecture diagram, data-model summary, Week 1 text, compliance checklist.
- `docs/architecture.md`: rewritten for FastAPI and React, with current and planned parts marked.
- `docs/protocol.md`: stack line, error envelope note, registration rules.
- `docs/module-claims.md`: evidence paths and status per module.
- `docs/decisions/0001-stack.md`: rewritten as an ADR for React + FastAPI.
- `docs/product-v1.md`, `docs/user-flows.md`: one-line status updates.
- `docs/legal/privacy-policy.md`: one line, Argon2id only.
- **New:** `docs/data-model.md`, built from `packages/server/app/models.py` and the initial migration.

## Verification

Run on Node 22 in `packages/web`:

- `npm ci`: ok
- `npm run typecheck`: ok
- `npm run lint`: ok
- `npm run test`: ok (1 test)
- `npm run build`: ok
- `npm run dev`: HTTP 200
- `npm audit --omit=dev`: 0 vulnerabilities
- Markdown relative links: all resolve

## What is not done

- Registration, login, logout, `/api/auth/me`, sessions and cookies are **not implemented**.
- The React app is only a shell. No routes, design tokens or product features yet.
- The docs describe planned features as planned. Please check that this matches your understanding.

## What I need from you (B)

1. **Auth routes and payloads.** Final paths and request/response bodies for `register`, `login`, `logout` and `me`.
2. **Error format.** Keep FastAPI's `{"detail": ...}`, or move to the `{"error": {code, message, requestId}}` envelope in `docs/protocol.md`? The frontend will normalise both for now.
3. **Session cookie.** Name, `SameSite` and `Secure` settings for local dev. The Vite dev server proxies `/api` to `127.0.0.1:8000`.
4. **Docs.** Please review the sections of `PLAN.md`, `docs/architecture.md`, `docs/protocol.md` and `docs/data-model.md` that cover the backend. Tell me if any wording is wrong.

## Questions for the team

- Should the shared docs go to `master` in the same PR as the frontend, or in a separate docs PR?
- Who owns `docs/legal/` (C)? I only changed one line about password hashing.

## Next for A

- A1: design tokens
- A2: app shell and routes
- A3: reusable components

I will not change backend files without talking to you first.
