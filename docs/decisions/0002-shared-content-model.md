# ADR 0002 — Shared Content layer

**Status:** proposed, to be confirmed in Week 1
**Date:** Week 1

## Context

Posts, articles, events and marketplace listings all appear in the unified feed,
receive comments and reactions, can carry attachments and can belong to a
community. Their business rules differ: an event has capacity and RSVPs, a listing
has a price and sale state, an article has a body and tags.

## Decision

Use a shared `Content` row for common fields:

- `authorId`, optional `communityId`
- `type` (`POST`, `ARTICLE`, `EVENT`, `LISTING`)
- `visibility` (`PUBLIC`, `FRIENDS`, `COMMUNITY`, `PRIVATE`)
- `publishedAt`, `deletedAt`

Each domain keeps its own table for business fields: `Post`, `Article`, `Event`,
`Listing`. Comments, reactions and attachments point at `Content`.

## Consequences

- Feed, comments, reactions and attachment permissions are implemented once.
- Event registration and marketplace sales stay in their own domains.
- Every content read must join the shared row and the domain row; queries are
  slightly more complex.
- Deleting content must respect retention and attachment rules across domains.
- If the shared layer makes queries or permissions harder than separate tables,
  this ADR is revisited before Week 5.
