import type { RouteObject } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import AuthLayout from './components/layout/AuthLayout'
import DesignSystemPage from './pages/DesignSystemPage'
import FeedPage from './pages/FeedPage'
import NotFoundPage from './pages/NotFoundPage'
import PlaceholderPage from './pages/PlaceholderPage'
import RequireAuth from './routes/RequireAuth'

function planned(title: string, description: string) {
  return <PlaceholderPage title={title} description={description} />
}

/**
 * Route table from Social_Network.pdf §"Pages to build".
 *
 * Auth pages sit under AuthLayout (no product navigation). Everything else
 * sits under AppShell. Feature pages are placeholders for now; the route
 * itself is final so navigation and guards do not change later.
 */
export const routes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: planned(
          'Log in',
          'Email and password login, plus one OAuth provider.',
        ),
      },
      {
        path: '/register',
        element: planned(
          'Create account',
          'Email and password registration with server-side validation.',
        ),
      },
    ],
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <FeedPage /> },

      {
        path: 'profile/:username',
        element: planned(
          'Profile',
          'Avatar, biography, published content, friends and online status.',
        ),
      },
      {
        path: 'friends',
        element: planned(
          'Friends',
          'Send, accept, reject and remove friend connections.',
        ),
      },
      {
        path: 'messages',
        element: planned(
          'Messages',
          'Persistent one-to-one chat with real-time delivery.',
        ),
      },
      {
        path: 'messages/:conversationId',
        element: planned('Conversation', 'Message history and live updates.'),
      },
      {
        path: 'communities',
        element: planned(
          'Communities',
          'Create communities, join them and manage members.',
        ),
      },
      {
        path: 'communities/:slug',
        element: planned(
          'Community',
          'Membership, roles and community posts.',
        ),
      },
      {
        path: 'blog',
        element: planned(
          'Blog',
          'Write, save drafts, publish, edit and delete articles.',
        ),
      },
      {
        path: 'blog/:slug',
        element: planned('Article', 'Read a published article.'),
      },
      {
        path: 'events',
        element: planned(
          'Events',
          'Create events, register, cancel and receive updates.',
        ),
      },
      {
        path: 'events/:id',
        element: planned('Event', 'Event details, capacity and participation.'),
      },
      {
        path: 'marketplace',
        element: planned(
          'Marketplace',
          'Browse listings, contact sellers and mark items as sold.',
        ),
      },
      {
        path: 'marketplace/:id',
        element: planned('Listing', 'Listing details and seller contact.'),
      },
      {
        path: 'notifications',
        element: planned(
          'Notifications',
          'Unread count, read state and links to relevant content.',
        ),
      },
      {
        path: 'search',
        element: planned(
          'Search',
          'Search users and published content with filters and pagination.',
        ),
      },
      {
        path: 'settings',
        element: (
          <RequireAuth>
            <PlaceholderPage
              title="Settings"
              description="Edit account information and access the legal pages."
            />
          </RequireAuth>
        ),
      },
      {
        path: 'legal/privacy',
        element: planned('Privacy Policy', 'Product-specific privacy policy.'),
      },
      {
        path: 'legal/terms',
        element: planned('Terms of Service', 'Product-specific terms of service.'),
      },
      {
        path: 'admin',
        element: (
          <RequireAuth>
            <PlaceholderPage
              title="Administration"
              description="Manage users and roles and moderate content."
            />
          </RequireAuth>
        ),
      },

      // Development-only design-system gallery (module 11 evidence).
      { path: 'design', element: <DesignSystemPage /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
