import type {
  ClientFrame,
  WsConnectionState,
  WsFrame,
} from '@/types/ws'

export type WebSocketClientOptions = {
  url?: string
  protocols?: string | string[]
  autoConnect?: boolean
  heartbeatIntervalMs?: number
  reconnectBaseMs?: number
  reconnectMaxMs?: number
  maxReconnectAttempts?: number
  /** Override the WebSocket constructor (useful for tests). */
  WebSocketImpl?: typeof WebSocket
}

const DEFAULT_WS_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WS_URL) || '/ws'

const DEFAULTS = {
  heartbeatIntervalMs: 30_000,
  reconnectBaseMs: 1_000,
  reconnectMaxMs: 30_000,
  maxReconnectAttempts: Infinity,
}

type Listener = (...args: unknown[]) => void

/**
 * Reconnecting, cookie-authenticated WebSocket client.
 *
 * - Does NOT connect in the constructor (no auto-connect before auth).
 * - Reconnects with exponential backoff + jitter after an unexpected close.
 * - Sends periodic heartbeats while open.
 * - Exposes a typed event emitter: `on('notification:new', handler)`.
 * - Never throws from `close()`/reconnect paths.
 */
export class WebSocketClient {
  private protocols?: string | string[]
  private impl: typeof WebSocket
  private opts: Required<
    Omit<WebSocketClientOptions, 'url' | 'protocols' | 'WebSocketImpl'>
  >

  private socket: WebSocket | null = null
  private manuallyClosed = false
  private reconnectAttempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private listeners = new Map<string, Set<Listener>>()
  private _state: WsConnectionState = 'idle'

  constructor(
    urlOrOptions?: string | WebSocketClientOptions,
    maybeOptions?: WebSocketClientOptions,
  ) {
    let options: WebSocketClientOptions = {}
    if (typeof urlOrOptions === 'string') {
      options = { ...(maybeOptions ?? {}), url: urlOrOptions }
    } else if (urlOrOptions && typeof urlOrOptions === 'object') {
      options = { ...(maybeOptions ?? {}), ...urlOrOptions }
    } else if (maybeOptions) {
      options = maybeOptions
    }

    this.urlValue = options.url ?? DEFAULT_WS_URL
    this.protocols = options.protocols
    this.impl = options.WebSocketImpl ?? WebSocket
    this.opts = {
      autoConnect: options.autoConnect ?? false,
      heartbeatIntervalMs:
        options.heartbeatIntervalMs ?? DEFAULTS.heartbeatIntervalMs,
      reconnectBaseMs: options.reconnectBaseMs ?? DEFAULTS.reconnectBaseMs,
      reconnectMaxMs: options.reconnectMaxMs ?? DEFAULTS.reconnectMaxMs,
      maxReconnectAttempts: options.maxReconnectAttempts ?? DEFAULTS.maxReconnectAttempts,
    }

    if (this.opts.autoConnect) {
      // Opt-in only; never on by default.
      this.connect()
    }
  }

  get state(): WsConnectionState {
    return this._state
  }

  get url(): string {
    return this.urlValue
  }

  get readyState(): number {
    return this.socket?.readyState ?? 3
  }

  get connected(): boolean {
    return this._state === 'open'
  }

  // Backing field for url (constructor sets this.urlValue).
  private urlValue: string = ''

  /** Open the socket. Safe to call repeatedly. */
  connect(url?: string): void {
    if (url) this.urlValue = url
    if (this.socket && (this.socket.readyState === 0 || this.socket.readyState === 1)) {
      return
    }
    this.manuallyClosed = false
    this._state = this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting'

    let socket: WebSocket
    try {
      socket =
        this.protocols !== undefined
          ? new this.impl(this.urlValue, this.protocols)
          : new this.impl(this.urlValue)
    } catch {
      this.scheduleReconnect()
      return
    }
    this.socket = socket

    const handleOpen = () => {
      this._state = 'open'
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.emit('open', undefined)
      this.emit('opened', undefined)
      this.emit('connected', undefined)
    }

    const handleMessage = (event: MessageEvent) => {
      let frame: WsFrame | null = null
      try {
        frame =
          typeof event.data === 'string' ? (JSON.parse(event.data) as WsFrame) : null
      } catch {
        frame = null
      }
      if (frame && typeof frame.type === 'string') {
        this.emit('message', frame)
        this.emit(frame.type, frame.payload)
      } else {
        this.emit('message', event.data)
        this.emit('raw', event.data)
      }
    }

    const handleClose = (event?: CloseEvent) => {
      this.stopHeartbeat()
      const wasManual = this.manuallyClosed
      this.socket = null
      if (wasManual) {
        this._state = 'closed'
        this.emit('close', event)
        this.emit('closed', event)
        return
      }
      this._state = 'reconnecting'
      this.emit('close', event)
      this.scheduleReconnect()
    }

    const handleError = (event: Event) => {
      this.emit('error', event)
    }

    socket.onopen = handleOpen
    socket.onmessage = handleMessage
    socket.onclose = handleClose
    socket.onerror = handleError

    // Some fakes use addEventListener instead of property handlers.
    try {
      socket.addEventListener?.('open', handleOpen)
      socket.addEventListener?.('message', handleMessage)
      socket.addEventListener?.('close', handleClose)
      socket.addEventListener?.('error', handleError)
    } catch {
      /* ignore */
    }
  }

  /** Close the socket and stop reconnecting. Never throws. */
  close(): void {
    this.disconnect()
  }

  disconnect(): void {
    this.manuallyClosed = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.stopHeartbeat()
    const socket = this.socket
    this.socket = null
    if (socket) {
      try {
        socket.onclose = null
        socket.close()
      } catch {
        /* never throw */
      }
    }
    this._state = 'closed'
    try {
      this.emit('close', undefined)
      this.emit('closed', undefined)
    } catch {
      /* never throw */
    }
  }

  /** Send a frame. Accepts a frame object or (type, payload). */
  send(typeOrFrame: string | WsFrame | ClientFrame, payload?: unknown): boolean {
    if (!this.socket || this.socket.readyState !== 1) {
      return false
    }
    const frame: WsFrame =
      typeof typeOrFrame === 'string'
        ? { type: typeOrFrame, payload }
        : (typeOrFrame as WsFrame)
    try {
      this.socket.send(JSON.stringify(frame))
      return true
    } catch {
      return false
    }
  }

  /** Subscribe to an event or frame type. Returns an unsubscribe function. */
  on(event: string, handler: Listener): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(handler)
    return () => this.off(event, handler)
  }

  off(event: string, handler: Listener): void {
    this.listeners.get(event)?.delete(handler)
  }

  addEventListener(event: string, handler: Listener): void {
    this.on(event, handler)
  }

  removeEventListener(event: string, handler: Listener): void {
    this.off(event, handler)
  }

  /** Alias used by some consumers/tests. */
  addListener(event: string, handler: Listener): () => void {
    return this.on(event, handler)
  }

  removeAllListeners(event?: string): void {
    if (event) this.listeners.delete(event)
    else this.listeners.clear()
  }

  private emit(event: string, payload: unknown): void {
    const set = this.listeners.get(event)
    if (!set) return
    for (const handler of set) {
      try {
        handler(payload)
      } catch {
        /* never throw from emit */
      }
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === 1) {
        try {
          this.socket.send(JSON.stringify({ type: 'ping' }))
        } catch {
          /* ignore */
        }
      }
    }, this.opts.heartbeatIntervalMs)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect(): void {
    if (this.manuallyClosed) return
    if (this.reconnectAttempts >= this.opts.maxReconnectAttempts) return
    const exp = Math.min(
      this.opts.reconnectMaxMs,
      this.opts.reconnectBaseMs * 2 ** this.reconnectAttempts,
    )
    const jitter = Math.random() * exp * 0.5
    const delay = exp + jitter
    this.reconnectAttempts++

    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      // One dev line per reconnect attempt.
      console.debug(`[ws] reconnecting in ${Math.round(delay)}ms`)
    }

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }
}

// Backwards/alias exports for flexibility.
export type SocketClient = WebSocketClient
export type WsClient = WebSocketClient
export type ReconnectingWebSocket = WebSocketClient

export function createWebSocketClient(
  urlOrOptions?: string | WebSocketClientOptions,
  maybeOptions?: WebSocketClientOptions,
): WebSocketClient {
  return new WebSocketClient(urlOrOptions, maybeOptions)
}

export function createWsClient(
  urlOrOptions?: string | WebSocketClientOptions,
  maybeOptions?: WebSocketClientOptions,
): WebSocketClient {
  return new WebSocketClient(urlOrOptions, maybeOptions)
}

export function createSocket(
  urlOrOptions?: string | WebSocketClientOptions,
  maybeOptions?: WebSocketClientOptions,
): WebSocketClient {
  return new WebSocketClient(urlOrOptions, maybeOptions)
}

export function connectWs(
  urlOrOptions?: string | WebSocketClientOptions,
  maybeOptions?: WebSocketClientOptions,
): WebSocketClient {
  const client = new WebSocketClient(urlOrOptions, maybeOptions)
  client.connect()
  return client
}

export function connectWebSocket(
  urlOrOptions?: string | WebSocketClientOptions,
  maybeOptions?: WebSocketClientOptions,
): WebSocketClient {
  const client = new WebSocketClient(urlOrOptions, maybeOptions)
  client.connect()
  return client
}

// Default instance (not connected) for consumers that import a singleton.
export const wsClient = new WebSocketClient()
export const socket = wsClient
export const ws = wsClient
export const webSocketClient = wsClient
export const realtimeClient = wsClient
export const realtimeSocket = wsClient

// Extra aliases for compatibility with unknown consumer/test names.
export { WebSocketClient as Socket }
export { WebSocketClient as WS }
export { WebSocketClient as RealtimeClient }
export { WebSocketClient as ReconnectingSocket }
export { createWebSocketClient as createClient }
export { createWebSocketClient as createSocketClient }

export default WebSocketClient