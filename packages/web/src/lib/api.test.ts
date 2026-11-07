import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, errorFromBody, request } from './api'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function stubFetch(impl: (url: string, init: RequestInit) => Promise<Response>) {
  const fetchMock = vi.fn(impl)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('request', () => {
  it('returns parsed JSON on success and sends the cookie', async () => {
    const fetchMock = stubFetch(async () =>
      jsonResponse(200, { id: 1, username: 'ada' }),
    )

    const result = await request<{ id: number }>('/auth/me')

    expect(result).toEqual({ id: 1, username: 'ada' })
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(init.credentials).toBe('include')
  })

  it('returns undefined for 204 No Content', async () => {
    stubFetch(async () => new Response(null, { status: 204 }))

    await expect(request('/auth/logout', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('maps a 401 protocol envelope to UNAUTHENTICATED', async () => {
    stubFetch(async () =>
      jsonResponse(401, {
        error: {
          code: 'UNAUTHENTICATED',
          message: 'You are not signed in.',
          requestId: 'req_1',
        },
      }),
    )

    await expect(request('/auth/me')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'UNAUTHENTICATED',
      status: 401,
      requestId: 'req_1',
    })
  })

  it('maps a 409 envelope to CONFLICT with the server message', async () => {
    stubFetch(async () =>
      jsonResponse(409, {
        error: { code: 'CONFLICT', message: 'Email taken.' },
      }),
    )

    const error = await request('/auth/register', { method: 'POST' }).catch(
      (caught: unknown) => caught,
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ code: 'CONFLICT', message: 'Email taken.' })
  })

  it('accepts FastAPI default detail and falls back to the status code', async () => {
    stubFetch(async () => jsonResponse(409, { detail: 'Email already used' }))

    await expect(request('/auth/register')).rejects.toMatchObject({
      code: 'CONFLICT',
      message: 'Email already used',
    })
  })

  it('reduces a Pydantic validation detail array to its first message', async () => {
    stubFetch(async () =>
      jsonResponse(422, {
        detail: [{ msg: 'String should have at least 15 characters' }],
      }),
    )

    await expect(request('/auth/register')).rejects.toMatchObject({
      code: 'INVALID_PAYLOAD',
      message: 'String should have at least 15 characters',
    })
  })

  it('reports malformed JSON on a successful response', async () => {
    stubFetch(async () => new Response('<html>oops</html>', { status: 200 }))

    await expect(request('/auth/me')).rejects.toMatchObject({
      code: 'MALFORMED_RESPONSE',
    })
  })

  it('reports a network failure without leaking the raw fetch error', async () => {
    stubFetch(async () => {
      throw new TypeError('Failed to fetch')
    })

    await expect(request('/auth/me')).rejects.toMatchObject({
      code: 'NETWORK',
      status: 0,
    })
  })

  it('aborts after the timeout and reports TIMEOUT', async () => {
    stubFetch(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        }),
    )

    await expect(request('/auth/me', { timeoutMs: 10 })).rejects.toMatchObject({
      code: 'TIMEOUT',
    })
  })
})

describe('errorFromBody', () => {
  it('falls back to a status-based code for an unknown error body', () => {
    expect(errorFromBody(500, undefined)).toMatchObject({ code: 'INTERNAL' })
  })

  it('treats an unknown envelope code as its status code', () => {
    const error = errorFromBody(403, {
      error: { code: 'SOMETHING_NEW', message: 'nope' },
    })

    expect(error.code).toBe('FORBIDDEN')
  })
})
