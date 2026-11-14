import { beforeEach, describe, expect, it } from 'vitest'
import { resetMockAuth } from '@/lib/mock/auth'
import { useAuthStore } from './auth'

const account = {
  email: 'ada@example.com',
  username: 'ada_lovelace',
  password: 'Example1!',
}

beforeEach(() => {
  resetMockAuth()
  useAuthStore.setState({ status: 'guest', user: null })
})

describe('auth store', () => {
  it('restores a guest when no session exists', async () => {
    useAuthStore.setState({ status: 'unknown' })

    await useAuthStore.getState().restore()

    expect(useAuthStore.getState().status).toBe('guest')
  })

  it('does not sign the user in on register', async () => {
    await useAuthStore.getState().register(account)

    expect(useAuthStore.getState().status).toBe('guest')
  })

  it('becomes authenticated after login and survives a reload', async () => {
    await useAuthStore.getState().register(account)
    await useAuthStore.getState().login({
      email: account.email,
      password: account.password,
    })

    expect(useAuthStore.getState()).toMatchObject({
      status: 'authenticated',
      user: { username: 'ada_lovelace' },
    })

    // Simulate a page reload: the in-memory state is gone, the session is not.
    useAuthStore.setState({ status: 'unknown', user: null })
    await useAuthStore.getState().restore()

    expect(useAuthStore.getState()).toMatchObject({
      status: 'authenticated',
      user: { username: 'ada_lovelace' },
    })
  })

  it('keeps the guest state when login fails', async () => {
    await useAuthStore.getState().register(account)

    await expect(
      useAuthStore.getState().login({
        email: account.email,
        password: 'wrong password here',
      }),
    ).rejects.toMatchObject({ code: 'UNAUTHENTICATED' })

    expect(useAuthStore.getState().status).toBe('guest')
  })

  it('clears the user on logout', async () => {
    await useAuthStore.getState().register(account)
    await useAuthStore.getState().login({
      email: account.email,
      password: account.password,
    })

    await useAuthStore.getState().logout()

    expect(useAuthStore.getState()).toMatchObject({
      status: 'guest',
      user: null,
    })
  })
})
