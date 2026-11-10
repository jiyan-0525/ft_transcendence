import { describe, expect, it } from 'vitest'
import { pageTitle } from './documentTitle'

describe('pageTitle', () => {
  it('names the top-level pages', () => {
    expect(pageTitle('/')).toBe('Feed')
    expect(pageTitle('/marketplace')).toBe('Marketplace')
    expect(pageTitle('/design')).toBe('Design system')
    expect(pageTitle('/login')).toBe('Log in')
  })

  it('reuses the list title for detail routes', () => {
    expect(pageTitle('/profile/ada')).toBe('Profile')
    expect(pageTitle('/messages/42')).toBe('Conversation')
    expect(pageTitle('/blog/hello-world')).toBe('Article')
  })

  it('falls back to the 404 title for unknown paths', () => {
    expect(pageTitle('/missing')).toBe('Page not found')
  })
})
