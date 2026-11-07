import type { ApiErrorCode } from '@/types/api'

/** Errors the client raises itself, before or instead of a server response. */
export type ClientErrorCode = 'NETWORK' | 'TIMEOUT' | 'MALFORMED_RESPONSE'

export type ErrorCode = ApiErrorCode | ClientErrorCode

const KNOWN_CODES = new Set<string>([
  'INVALID_PAYLOAD',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'INTERNAL',
  'NETWORK',
  'TIMEOUT',
  'MALFORMED_RESPONSE',
])

/**
 * The one error type components ever see. Whatever went wrong on the wire
 * (network, timeout, FastAPI `detail`, protocol envelope) is converted into
 * this shape, so UI code only switches on `code`.
 */
export class ApiError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly requestId?: string

  constructor(init: {
    code: ErrorCode
    message: string
    status: number
    requestId?: string
  }) {
    super(init.message)
    this.name = 'ApiError'
    this.code = init.code
    this.status = init.status
    this.requestId = init.requestId
  }
}

export const API_BASE = import.meta.env.VITE_API_URL || '/api'

const DEFAULT_TIMEOUT_MS = 10_000

export type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
  timeoutMs?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function statusToCode(status: number): ApiErrorCode {
  if (status === 401) return 'UNAUTHENTICATED'
  if (status === 403) return 'FORBIDDEN'
  if (status === 404) return 'NOT_FOUND'
  if (status === 409) return 'CONFLICT'
  if (status === 429) return 'RATE_LIMITED'
  if (status >= 500) return 'INTERNAL'
  return 'INVALID_PAYLOAD'
}

/**
 * Turn an error response body into an ApiError.
 *
 * Accepts the protocol envelope `{"error": {...}}` (target) and FastAPI's
 * default `{"detail": ...}` (until the backend maps it). A Pydantic validation
 * `detail` array is reduced to its first message.
 */
export function errorFromBody(status: number, body: unknown): ApiError {
  if (
    isRecord(body) &&
    isRecord(body.error) &&
    typeof body.error.code === 'string'
  ) {
    const code = KNOWN_CODES.has(body.error.code)
      ? (body.error.code as ErrorCode)
      : statusToCode(status)

    return new ApiError({
      code,
      message:
        typeof body.error.message === 'string'
          ? body.error.message
          : `Request failed (${status}).`,
      status,
      requestId:
        typeof body.error.requestId === 'string'
          ? body.error.requestId
          : undefined,
    })
  }

  if (isRecord(body) && 'detail' in body) {
    const { detail } = body

    if (typeof detail === 'string') {
      return new ApiError({
        code: statusToCode(status),
        message: detail,
        status,
      })
    }

    const first: unknown = Array.isArray(detail) ? detail[0] : undefined
    if (isRecord(first) && typeof first.msg === 'string') {
      return new ApiError({
        code: 'INVALID_PAYLOAD',
        message: first.msg,
        status,
      })
    }
  }

  return new ApiError({
    code: statusToCode(status),
    message: `Request failed (${status}).`,
    status,
  })
}

/**
 * Single entry point for every HTTP call. It always sends the session cookie,
 * enforces a timeout, and never lets a raw fetch error escape.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers,
    signal,
    ...init
  } = options

  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  const forwardAbort = () => controller.abort()
  signal?.addEventListener('abort', forwardAbort)

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(init.body !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...headers,
      },
      signal: controller.signal,
    })
  } catch {
    if (timedOut) {
      throw new ApiError({
        code: 'TIMEOUT',
        message: 'The server took too long to respond.',
        status: 0,
      })
    }
    throw new ApiError({
      code: 'NETWORK',
      message: 'Could not reach the server. Check your connection.',
      status: 0,
    })
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', forwardAbort)
  }

  if (response.status === 204) {
    return undefined as T
  }

  let text: string
  try {
    text = await response.text()
  } catch {
    throw new ApiError({
      code: 'NETWORK',
      message: 'The connection dropped while reading the response.',
      status: response.status,
    })
  }

  let body: unknown = undefined
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      if (!response.ok) {
        throw errorFromBody(response.status, undefined)
      }
      throw new ApiError({
        code: 'MALFORMED_RESPONSE',
        message: 'The server sent a response the app could not read.',
        status: response.status,
      })
    }
  }

  if (!response.ok) {
    throw errorFromBody(response.status, body)
  }

  return body as T
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
