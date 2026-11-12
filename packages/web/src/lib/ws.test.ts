import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WebSocketClient } from './ws'

class FakeWebSocket {
  static instances: FakeWebSocket[] = []
  readyState = 0
  onopen: ((e: Event) => void) | null = null
  onmessage: ((e: MessageEvent) => void) | null = null
  onclose: ((e: CloseEvent) => void) | null = null
  onerror: ((e: Event) => void) | null = null
  url: string
  sent: string[] = []
  closed = false

  constructor(url: string) {
    this.url = url
    FakeWebSocket.instances.push(this)
    // simulate async open
    setTimeout(() => {
      this.readyState = 1
      this.onopen?.(new Event('open'))
    }, 0)
  }

  send(data: string) {
    this.sent.push(data)
  }

  close() {
    this.closed = true
    this.readyState = 3
    this.onclose?.(new CloseEvent('close'))
  }

  addEventListener(type: string, cb: EventListener) {
    if (type === 'open') this.onopen = cb as (e: Event) => void
    if (type === 'message') this.onmessage = cb as (e: MessageEvent) => void
    if (type === 'close') this.onclose = cb as (e: CloseEvent) => void
    if (type === 'error') this.onerror = cb as (e: Event) => void
  }
}

beforeEach(() => {
  FakeWebSocket.instances = []
  vi.useFakeTimers()
  vi.stubGlobal('WebSocket', FakeWebSocket)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('WebSocketClient', () => {
  it('does not connect in the constructor', () => {
    new WebSocketClient('ws://example.test/ws')
    expect(FakeWebSocket.instances).toHaveLength(0)
  })

  it('connects on connect()', () => {
    const client = new WebSocketClient('ws://example.test/ws')
    client.connect()
    expect(FakeWebSocket.instances).toHaveLength(1)
    expect(FakeWebSocket.instances[0]!.url).toBe('ws://example.test/ws')
  })

  it('emits open', () => {
    const client = new WebSocketClient('ws://example.test/ws')
    const open = vi.fn()
    client.on('open', open)
    client.connect()
    vi.advanceTimersByTime(1)
    expect(open).toHaveBeenCalled()
    expect(client.connected).toBe(true)
  })

  it('delivers notification:new payload', () => {
    const client = new WebSocketClient('ws://example.test/ws')
    const handler = vi.fn()
    client.on('notification:new', handler)
    client.connect()
    vi.advanceTimersByTime(1)
    const ws = FakeWebSocket.instances[0]!
    ws.onmessage?.(
      new MessageEvent('message', {
        data: JSON.stringify({ type: 'notification:new', payload: { id: 42 } }),
      }),
    )
    expect(handler).toHaveBeenCalledWith({ id: 42 })
  })

  it('sends typed frames', () => {
    const client = new WebSocketClient('ws://example.test/ws')
    client.connect()
    vi.advanceTimersByTime(1)
    const ws = FakeWebSocket.instances[0]!
    client.send('chat:send', { body: 'hi' })
    expect(ws.sent[0]).toBe(JSON.stringify({ type: 'chat:send', payload: { body: 'hi' } }))
  })

  it('reconnects after an artificial close', () => {
    const client = new WebSocketClient('ws://example.test/ws', { reconnectBaseMs: 10 })
    client.connect()
    vi.advanceTimersByTime(1)
    const ws = FakeWebSocket.instances[0]!
    // artificial close
    ws.onclose?.(new CloseEvent('close'))
    vi.advanceTimersByTime(100)
    expect(FakeWebSocket.instances.length).toBeGreaterThanOrEqual(2)
  })

  it('does not reconnect after manual close', () => {
    const client = new WebSocketClient('ws://example.test/ws', { reconnectBaseMs: 10 })
    client.connect()
    vi.advanceTimersByTime(1)
    client.close()
    const count = FakeWebSocket.instances.length
    vi.advanceTimersByTime(1000)
    expect(FakeWebSocket.instances.length).toBe(count)
  })

  it('never throws on close', () => {
    const client = new WebSocketClient('ws://example.test/ws')
    client.connect()
    vi.advanceTimersByTime(1)
    expect(() => client.close()).not.toThrow()
  })
})