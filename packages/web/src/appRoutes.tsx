import type { RouteObject } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import AuthLayout from './components/layout/AuthLayout'
import DesignSystemPage from './pages/DesignSystemPage'
import FeedPage from './pages/FeedPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import PlaceholderPage from './pages/PlaceholderPage'
import RegisterPage from './pages/RegisterPage'
import RequireAdmin from './routes/RequireAdmin'
import RequireAuth from './routes/RequireAuth'
import RequireGuest from './routes/RequireGuest'

function planned(title: string, description: string) {
  return <PlaceholderPage title={title} description={description} />
}

/**
 * Route table from Social_Network.pdf §"Pages to build".
 *
 * Auth pages sit under AuthLayout and are for guests only. Everything else
 * sits under AppShell. Guards decide who may open a page; the route paths
 * themselves do not change when a guard is added.
 */
export const routes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <RequireGuest>
            <LoginPage />
          </RequireGuest>
        ),
      },
      {
        path: '/register',
        element: (
          <RequireGuest>
            <RegisterPage />
          </RequireGuest>
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
        element: (
          <RequireAuth>
            {planned(
              'Friends',
              'Send, accept, reject and remove friend connections.',
            )}
          </RequireAuth>
        ),
      },
      {
        path: 'messages',
        element: (
          <RequireAuth>
            {planned(
              'Messages',
              'Persistent one-to-one chat with real-time delivery.',
            )}
          </RequireAuth>
        ),
      },
      {
        path: 'messages/:conversationId',
        element: (
          <RequireAuth>
            {planned('Conversation', 'Message history and live updates.')}
          </RequireAuth>
        ),
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
        element: (
          <RequireAuth>
            {planned(
              'Notifications',
              'Unread count, read state and links to relevant content.',
            )}
          </RequireAuth>
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
          <RequireAdmin>
            <PlaceholderPage
              title="Administration"
              description="Manage users and roles and moderate content."
            />
          </RequireAdmin>
        ),
      },

      // Development-only design-system gallery (module 11 evidence).
      { path: 'design', element: <DesignSystemPage /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
