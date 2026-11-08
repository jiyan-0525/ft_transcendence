/**
 * WebSocket frames, as defined by docs/protocol.md §14.
 *
 * Every frame is `{ "type": string, "payload": object }`. Payloads stay
 * camelCase here because the server already sends camelCase keys (§14.3–14.4).
 *
 * `message` and `notification` are typed as `unknown` until the chat and
 * notification models land in lib/mappers.ts.
 */

export type ClientFrames = {
  'chat:send': { conversationId: string; body: string; clientId: string }
  'chat:read': { conversationId: string; messageId: string }
  'typing:start': { conversationId: string }
  'typing:stop': { conversationId: string }
  'presence:subscribe': { userIds: number[] }
  'notifications:ack': { notificationId: number }
  /** Client heartbeat. Not yet in protocol §14.3; see lib/ws.ts. */
  ping: Record<string, never>
}

export type ServerFrames = {
  'chat:message': { conversationId: string; message: unknown }
  'chat:read': { conversationId: string; userId: number; messageId: string }
  'notification:new': { notification: unknown }
  'presence:update': { userId: number; online: boolean }
  'community:member_changed': {
    communityId: string
    userId: number
    action: string
  }
  'event:changed': { eventId: string; action: string }
  'ws:error': { code: string; message: string }
  /** Reply to `ping`. Consumed by the client and never dispatched. */
  pong: Record<string, never>
}

export type ClientFrame = {
  [K in keyof ClientFrames]: { type: K; payload: ClientFrames[K] }
}[keyof ClientFrames]

export type ServerFrame = {
  [K in keyof ServerFrames]: { type: K; payload: ServerFrames[K] }
}[keyof ServerFrames]
