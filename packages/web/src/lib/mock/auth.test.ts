import { beforeEach, describe, expect, it } from 'vitest'
import { login, logout, me, register, resetMockAuth } from './auth'

const account = {
  email: 'Ada@Example.com',
  username: 'ada_lovelace',
  password: 'correct horse battery',
}

beforeEach(() => {
  resetMockAuth()
})

describe('mock auth', () => {
  it('registers without signing the user in', async () => {
    const user = await register(account)

    expect(user).toMatchObject({ username: 'ada_lovelace', role: 'USER' })
    await expect(me()).rejects.toMatchObject({ code: 'UNAUTHENTICATED' })
  })

  it('stores email in lowercase and never returns the password', async () => {
    const user = await register(account)

    expect(user.email).toBe('ada@example.com')
    expect(user).not.toHaveProperty('password')
  })

  it('rejects a duplicate email with CONFLICT', async () => {
    await register(account)

    await expect(
      register({ ...account, username: 'someone_else' }),
    ).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('rejects a duplicate username with CONFLICT', async () => {
    await register(account)

    await expect(
      register({ ...account, email: 'other@example.com' }),
    ).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('logs in with the right password and restores the session via me()', async () => {
    await register(account)
    await login({ email: account.email, password: account.password })

    await expect(me()).resolves.toMatchObject({ username: 'ada_lovelace' })
  })

  it('rejects a wrong password with UNAUTHENTICATED', async () => {
    await register(account)

    await expect(
      login({ email: account.email, password: 'wrong password here' }),
    ).rejects.toMatchObject({ code: 'UNAUTHENTICATED' })
  })

  it('clears the session on logout', async () => {
    await register(account)
    await login({ email: account.email, password: account.password })
    await logout()

    await expect(me()).rejects.toMatchObject({ code: 'UNAUTHENTICATED' })
  })
})
