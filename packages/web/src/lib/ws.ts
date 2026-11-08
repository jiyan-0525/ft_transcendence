import type { ClientFrames, ServerFrames } from '@/types/ws'

/**
 * Realtime connection to `GET /ws` (docs/protocol.md §14).
 *
 * The session cookie authenticates the handshake, so nothing is sent by hand.
 * The client does not connect on its own: the auth store calls `connect()`
 * once a session exists and `disconnect()` on logout.
 */

export type ConnectionState = 'idle' | 'connecting' | 'open' | 'reconnecting'

type SocketLike = Pick<
  WebSocket,
  'readyState' | 'send' | 'close' | 'onopen' | 'onmessage' | 'onclose' | 'onerror'
>

export type RealtimeOptions = {
  url: string
  createSocket?: (url: string) => SocketLike
  heartbeatMs?: number
  baseDelayMs?: number
  maxDelayMs?: number
  random?: () => number
}

const OPEN = 1
const DEFAULT_HEARTBEAT_MS = 25_000
const DEFAULT_BASE_DELAY_MS = 1_000
const DEFAULT_MAX_DELAY_MS = 30_000

type Listener = (payload: unknown) => void

function isFrame(value: unknown): value is { type: string; payload: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string' &&
    'payload' in value
  )
}

export class RealtimeClient {
  private socket: SocketLike | null = null
  private state: ConnectionState = 'idle'
  private attempts = 0
  private lastSeen = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined
  private heartbeatTimer: ReturnType<typeof setInterval> | undefined
  private readonly listeners = new Map<string, Set<Listener>>()
  private readonly options: Required<Omit<RealtimeOptions, 'url'>> & {
    url: string
  }

  constructor(options: RealtimeOptions) {
    this.options = {
      createSocket: (url) => new WebSocket(url),
      heartbeatMs: DEFAULT_HEARTBEAT_MS,
      baseDelayMs: DEFAULT_BASE_DELAY_MS,
      maxDelayMs: DEFAULT_MAX_DELAY_MS,
      random: Math.random,
      ...options,
    }
  }

  get connectionState(): ConnectionState {
    return this.state
  }

  connect(): void {
    if (this.state === 'connecting' || this.state === 'open') return
    this.clearReconnect()
    this.open()
  }

  /** Closes on purpose. No reconnect is scheduled afterwards. */
  disconnect(): void {
    this.clearReconnect()
    this.stopHeartbeat()
    const socket = this.socket
    this.socket = null
    this.state = 'idle'
    this.attempts = 0
    socket?.close(1000)
  }

  /**
   * Sends a typed frame. Returns false when the socket is not open. Frames are
   * never queued: the server persists before it broadcasts, so a dropped send
   * is recovered through REST, not by replaying the frame.
   */
  send<K extends keyof ClientFrames>(type: K, payload: ClientFrames[K]): boolean {
    const socket = this.socket
    if (!socket || socket.readyState !== OPEN) return false
    try {
      socket.send(JSON.stringify({ type, payload }))
      return true
    } catch {
      return false
    }
  }

  /** Subscribes to one server frame type. Returns an unsubscribe function. */
  on<K extends keyof ServerFrames>(
    type: K,
    handler: (payload: ServerFrames[K]) => void,
  ): () => void {
    let set = this.listeners.get(type)
    if (!set) {
      set = new Set()
      this.listeners.set(type, set)
    }
    const listener = handler as Listener
    set.add(listener)
    return () => {
      set.delete(listener)
    }
  }

  private open(): void {
    this.state = 'connecting'

    let socket: SocketLike
    try {
      socket = this.options.createSocket(this.options.url)
    } catch {
      this.scheduleReconnect()
      return
    }
    this.socket = socket

    socket.onopen = () => {
      if (this.socket !== socket) return
      this.state = 'open'
      this.attempts = 0
      this.lastSeen = Date.now()
      this.startHeartbeat()
    }

    socket.onmessage = (event) => {
      if (this.socket !== socket) return
      this.lastSeen = Date.now()
      this.dispatch(event.data)
    }

    // Errors are always followed by close, so reconnect logic lives there.
    socket.onerror = () => {}

    socket.onclose = () => {
      if (this.socket !== socket) return
      this.socket = null
      this.stopHeartbeat()
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    this.state = 'reconnecting'
    const ceiling = Math.min(
      this.options.maxDelayMs,
      this.options.baseDelayMs * 2 ** this.attempts,
    )
    // Equal jitter: wait at least half the ceiling, at most the full ceiling.
    const delay = ceiling / 2 + (this.options.random() * ceiling) / 2
    this.attempts += 1

    if (import.meta.env.DEV) {
      console.info(
        `[realtime] reconnecting in ${Math.round(delay)} ms (attempt ${this.attempts})`,
      )
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined
      this.open()
    }, delay)
  }

  private clearReconnect(): void {
    if (this.reconnectTimer !== undefined) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      // Two missed intervals with no traffic at all: treat the socket as dead.
      // Closing it lets onclose schedule the reconnect.
      if (Date.now() - this.lastSeen > this.options.heartbeatMs * 2) {
        this.socket?.close()
        return
      }
      this.send('ping', {})
    }, this.options.heartbeatMs)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== undefined) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = undefined
    }
  }

  private dispatch(data: unknown): void {
    if (typeof data !== 'string') return

    let frame: unknown
    try {
      frame = JSON.parse(data)
    } catch {
      return
    }
    if (!isFrame(frame) || frame.type === 'pong') return

    const set = this.listeners.get(frame.type)
    if (!set) return
    for (const listener of set) {
      try {
        listener(frame.payload)
      } catch (error) {
        // A faulty handler must not stop the others or break the socket.
        if (import.meta.env.DEV) console.error('[realtime] handler failed', error)
      }
    }
  }
}

/** Turns `/ws` (relative, as in VITE_WS_URL) into an absolute ws:// or wss:// URL. */
export function resolveWsUrl(path: string, base: string = window.location.href): string {
  const url = new URL(path, base)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.toString()
}

export const realtime = new RealtimeClient({
  url: resolveWsUrl(import.meta.env.VITE_WS_URL || '/ws'),
})
