import { ApiError } from '@/lib/api'
import { validatePassword } from '@/lib/validation'
import type {
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from '@/types/api'

/**
 * In-memory stand-in for the auth endpoints in docs/protocol.md §4.
 *
 * It follows the same rules as the server (register does not sign in,
 * duplicates are CONFLICT, bad credentials are UNAUTHENTICATED) and raises the
 * same ApiError type, so switching it off changes no component code.
 *
 * Passwords are kept in plain text on purpose: this is test data, never a
 * real credential store.
 */
type MockUser = UserResponse & { password: string }

let users: MockUser[] = []
let nextId = 1
let sessionUserId: number | null = null

function publicUser(user: MockUser): UserResponse {
  const { password: _password, ...rest } = user
  return rest
}

/** Demo accounts from plan §7, so sign-in works without registering first. */
function seedUsers(): void {
  const now = new Date().toISOString()
  const seeds = [
    { email: 'alice@example.com', username: 'alice' },
    { email: 'bob@example.com', username: 'bob' },
  ]
  users = seeds.map((seed) => ({
    id: nextId++,
    email: seed.email,
    username: seed.username,
    role: 'USER',
    is_active: true,
    created_at: now,
    password: 'Password123456789!',
  }))
}

/** Restores the seeded state. Used by tests and by a manual dev reset. */
export function resetMockAuth(): void {
  nextId = 1
  sessionUserId = null
  seedUsers()
}

resetMockAuth()

export async function register(input: RegisterRequest): Promise<UserResponse> {
  const passwordError = validatePassword(input.password)
  if (passwordError) {
    throw new ApiError({ code: 'INVALID_PAYLOAD', message: passwordError, status: 422 })
  }

  const email = input.email.toLowerCase()

  if (users.some((user) => user.email === email)) {
    throw new ApiError({
      code: 'CONFLICT',
      message: 'This email is already registered.',
      status: 409,
    })
  }
  if (users.some((user) => user.username === input.username)) {
    throw new ApiError({
      code: 'CONFLICT',
      message: 'This username is already taken.',
      status: 409,
    })
  }

  const now = new Date().toISOString()
  const user: MockUser = {
    id: nextId++,
    email,
    username: input.username,
    role: 'USER',
    is_active: true,
    created_at: now,
    password: input.password,
  }
  users.push(user)

  // Registration never signs the user in (protocol D10).
  return publicUser(user)
}

export async function login(input: LoginRequest): Promise<UserResponse> {
  const email = input.email.toLowerCase()
  const user = users.find((candidate) => candidate.email === email)

  if (!user || user.password !== input.password) {
    throw new ApiError({
      code: 'UNAUTHENTICATED',
      message: 'Invalid email or password.',
      status: 401,
    })
  }

  sessionUserId = user.id
  return publicUser(user)
}

export async function logout(): Promise<void> {
  sessionUserId = null
}

export async function me(): Promise<UserResponse> {
  const user = users.find((candidate) => candidate.id === sessionUserId)

  if (!user) {
    throw new ApiError({
      code: 'UNAUTHENTICATED',
      message: 'You are not signed in.',
      status: 401,
    })
  }

  return publicUser(user)
}
