import { useEffect } from 'react'

/** Product name appended to every page title. */
export const APP_NAME = 'Social Network'

const exactTitles: Record<string, string> = {
  '/': 'Feed',
  '/friends': 'Friends',
  '/messages': 'Messages',
  '/communities': 'Communities',
  '/blog': 'Blog',
  '/events': 'Events',
  '/marketplace': 'Marketplace',
  '/notifications': 'Notifications',
  '/search': 'Search',
  '/settings': 'Settings',
  '/legal/privacy': 'Privacy policy',
  '/legal/terms': 'Terms of service',
  '/admin': 'Administration',
  '/design': 'Design system',
  '/login': 'Log in',
  '/register': 'Create account',
}

/** Detail routes share one title with their list page. */
const prefixTitles: Array<[string, string]> = [
  ['/profile/', 'Profile'],
  ['/messages/', 'Conversation'],
  ['/communities/', 'Community'],
  ['/blog/', 'Article'],
  ['/events/', 'Event'],
  ['/marketplace/', 'Listing'],
]

/** Title for a pathname; unknown paths fall back to the 404 title. */
export function pageTitle(pathname: string): string {
  const exact = exactTitles[pathname]
  if (exact) return exact

  for (const [prefix, title] of prefixTitles) {
    if (pathname.startsWith(prefix)) return title
  }

  return 'Page not found'
}

/**
 * Keep `document.title` in sync with the current route.
 * Called from the layout routes, which cover every page.
 */
export function useDocumentTitle(pathname: string) {
  useEffect(() => {
    document.title = `${pageTitle(pathname)} · ${APP_NAME}`
  }, [pathname])
}
