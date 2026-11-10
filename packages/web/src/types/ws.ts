/**
 * WebSocket frame shapes for the real-time layer.
 *
 * Frames are JSON envelopes of the form `{ type, payload }` (see
 * architecture.md §5). Wire types stay snake_case-free here because the
 * WebSocket protocol is frontend-defined; the REST API mapping lives in
 * `lib/api.ts`.
 */

export type WsConnectionState =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'closed'

/** A single frame on the wire. */
export type WsFrame<TType extends string = string, TPayload = unknown> = {
  type: TType
  payload?: TPayload
}

/** Frames the client may send to the server. */
export type ClientFrame = WsFrame<string, unknown>

/** Frames the server may send to the client. */
export type ServerFrame = WsFrame<string, unknown>

// Convenience aliases kept in sync so consumers can import whichever name
// they expect.
export type WsClientFrame = ClientFrame
export type WsServerFrame = ServerFrame
export type WsMessage = WsFrame
export type Frame = WsFrame

/** Well-known frame types used by the skeleton. */
export type WsFrameType =
  | 'ping'
  | 'pong'
  | 'notification:new'
  | (string & {})

export type WsEventHandler<TPayload = unknown> = (payload: TPayload) => void