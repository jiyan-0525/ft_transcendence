import { describe, expect, it } from 'vitest'
import { initialsOf } from './initials'

describe('initialsOf', () => {
  it('uses the first letter of the first two words', () => {
    expect(initialsOf('ada lovelace king')).toBe('AL')
    expect(initialsOf('bob')).toBe('B')
  })

  it('falls back to a question mark for a blank name', () => {
    expect(initialsOf('   ')).toBe('?')
  })
})
