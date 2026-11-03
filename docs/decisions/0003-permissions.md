# ADR 0003 — Three-layer permissions

**Status:** accepted
**Date:** Week 1

## Context

The platform has platform-wide staff, user-created communities and user-owned
content. A single role field cannot express all three, and hiding UI controls is
not access control.

## Decision

Enforce three independent layers on the backend:

1. **Platform roles:** `ADMIN`, `MODERATOR`, `USER`.
2. **Community roles:** `OWNER`, `MEMBER`, scoped to one community.
3. **Content ownership:** author, seller or event organiser.

Rules:

- The most restrictive applicable layer wins.
- Platform roles are assigned only by an Admin.
- A community owner's power stops at that community.
- Ownership never bypasses a platform or community restriction.
- Every restricted read and write calls the same authorisation helper used by
  search, feed and media downloads.
- Denials return `403` (or `404` where visibility itself is private).

## Consequences

- Permission checks are explicit and testable.
- Negative tests are required for every module that exposes restricted data.
- Search and media cannot use a shortcut that bypasses normal read checks.
- Admin and moderation routes need their own integration tests.
