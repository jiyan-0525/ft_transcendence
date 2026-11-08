import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RealtimeClient, resolveWsUrl } from './ws'

class FakeSocket {
  static instances: FakeSocket[] = []

  readyState = 0
  sent: string[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: { data: unknown }) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(readonly url: string) {
    FakeSocket.instances.push(this)
  }

  send(data: string) {
    this.sent.push(data)
  }

  close() {
    this.readyState = 3
  }

  open() {
    this.readyState = 1
    this.onopen?.()
  }

  receive(frame: unknown) {
    this.onmessage?.({ data: JSON.stringify(frame) })
  }

  drop() {
    this.readyState = 3
    this.onclose?.()
  }
}

function latest(): FakeSocket {
  const socket = FakeSocket.instances.at(-1)
  if (!socket) throw new Error('no socket was created')
  return socket
}

function makeClient(overrides: Partial<ConstructorParameters<typeof RealtimeClient>[0]> = {}) {
  return new RealtimeClient({
    url: 'ws://localhost/ws',
    createSocket: (url) => new FakeSocket(url),
    heartbeatMs: 25_000,
    baseDelayMs: 1_000,
    maxDelayMs: 30_000,
    random: () => 0.5,
    ...overrides,
  })
}

beforeEach(() => {
  FakeSocket.instances = []
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('RealtimeClient', () => {
  it('sends typed frames only once the socket is open', () => {
    const client = makeClient()
    client.connect()

    expect(client.connectionState).toBe('connecting')
    expect(client.send('typing:start', { conversationId: 'c1' })).toBe(false)

    latest().open()

    expect(client.connectionState).toBe('open')
    expect(client.send('typing:start', { conversationId: 'c1' })).toBe(true)
    expect(JSON.parse(latest().sent[0] ?? '')).toEqual({
      type: 'typing:start',
      payload: { conversationId: 'c1' },
    })
  })

  it('dispatches server frames to subscribers and ignores bad input', () => {
    const client = makeClient()
    const handler = vi.fn()
    const unsubscribe = client.on('notification:new', handler)

    client.connect()
    const socket = latest()
    socket.open()

    socket.receive({ type: 'notification:new', payload: { notification: { id: 7 } } })
    socket.onmessage?.({ data: 'not json' })
    socket.receive({ type: 'unknown:thing', payload: {} })
    socket.receive({ type: 'pong', payload: {} })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith({ notification: { id: 7 } })

    unsubscribe()
    socket.receive({ type: 'notification:new', payload: { notification: {} } })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('reconnects with backoff after an unexpected drop, logging one dev line', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const client = makeClient()

    client.connect()
    latest().open()
    latest().drop()

    expect(client.connectionState).toBe('reconnecting')
    expect(FakeSocket.instances).toHaveLength(1)
    expect(info).toHaveBeenCalledTimes(1)

    // random() = 0.5 gives 75% of the 1 s ceiling on the first attempt.
    vi.advanceTimersByTime(749)
    expect(FakeSocket.instances).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(FakeSocket.instances).toHaveLength(2)

    latest().open()
    expect(client.connectionState).toBe('open')
  })

  it('does not reconnect after disconnect()', () => {
    const client = makeClient()

    client.connect()
    latest().open()
    client.disconnect()
    vi.advanceTimersByTime(60_000)

    expect(client.connectionState).toBe('idle')
    expect(FakeSocket.instances).toHaveLength(1)
    expect(client.send('typing:stop', { conversationId: 'c1' })).toBe(false)
  })

  it('sends a ping on each heartbeat interval', () => {
    const client = makeClient()

    client.connect()
    latest().open()
    vi.advanceTimersByTime(25_000)

    expect(JSON.parse(latest().sent[0] ?? '')).toEqual({ type: 'ping', payload: {} })
    client.disconnect()
  })
})

describe('resolveWsUrl', () => {
  it('turns a relative path into an absolute ws URL on the same host', () => {
    expect(resolveWsUrl('/ws', 'http://localhost:5173/')).toBe('ws://localhost:5173/ws')
    expect(resolveWsUrl('/ws', 'https://app.example.com/feed')).toBe(
      'wss://app.example.com/ws',
    )
  })
})
