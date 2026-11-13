import type { FC } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Navbar, RightSidebar } from '@/components/layout'
import { FloatingAiWidget } from '@/features/ai'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

/**
 * Modern responsive layout for the student & alumni social platform.
 * Adheres to centralized top navigation (Facebook-style header) without persistent left sidebar.
 * Dynamic columns: 8-column main feed + 4-column right sidebar on feed pages; 12-column full width on workspace pages.
 */
export const UserLayout: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleOpenCreatePost = () => {
    if (location.pathname === ROUTES.APP.HOME) {
      const composerEl = document.getElementById('post-composer')
      if (composerEl) {
        composerEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const textarea = composerEl.querySelector('textarea')
        textarea?.focus()
      }
    } else {
      navigate(`${ROUTES.APP.HOME}?compose=true`)
    }
  }

  const isFeedPage =
    location.pathname === ROUTES.APP.HOME || location.pathname.startsWith('/app/posts')

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] text-slate-900 antialiased selection:bg-brand-primary-light selection:text-brand-primary">
      {/* 1. Sticky Navigation Topbar */}
      <Navbar onOpenCreatePost={handleOpenCreatePost} />

      {/* 2. Main Dynamic Responsive Grid Container */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Main Column: Dynamic width based on view type */}
          <main
            className={cn(
              'min-w-0 transition-all duration-200',
              isFeedPage ? 'lg:col-span-8' : 'lg:col-span-12'
            )}
          >
            <Outlet />
          </main>

          {/* Right Sidebar: Shown specifically on Feed / Post Detail pages */}
          {isFeedPage && (
            <div className="sticky top-20 hidden lg:col-span-4 lg:block">
              <RightSidebar />
            </div>
          )}
        </div>
      </div>

      {/* 3. Floating AI Assistant Widget */}
      <FloatingAiWidget />
    </div>
  )
}

