# ADR 0004 — Persist first, push second

**Status:** accepted
**Date:** Week 1

## Context

Chat messages, notifications and presence are delivered over a WebSocket. A
delivery-only design loses messages when a user is offline, reconnecting or using
multiple tabs.

## Decision

- Write messages and notifications to PostgreSQL before broadcasting them.
- Treat the database as the replay log; clients catch up with a cursor after
  reconnect.
- Track sockets per user and derive presence per user, so closing one tab does not
  mark the user offline.
- Drop slow consumers instead of blocking the hub.
- Authenticate the WebSocket handshake with the same session as REST.

## Consequences

- No message or notification is lost because a socket was down.
- Reconnect logic is part of the protocol, not an afterthought.
- The database receives one write per message; acceptable at this scale.
- Typing indicators remain ephemeral and are explicitly not persisted.
