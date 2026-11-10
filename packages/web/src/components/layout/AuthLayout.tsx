import { Outlet, useLocation } from 'react-router-dom'
import { useDocumentTitle } from '@/lib/documentTitle'
import Brand from './Brand'
import Footer from './Footer'

/**
 * Layout for signed-out pages (login, register). It deliberately has no
 * channel navigation: the product area is not reachable until signed in.
 */
export default function AuthLayout() {
  const location = useLocation()

  useDocumentTitle(location.pathname)

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4">
          <Brand />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 items-start justify-center px-4 py-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
