import type { FC } from 'react'
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom'
import { Home, GraduationCap, MessageSquare, Briefcase, User, PlusCircle } from 'lucide-react'
import { Navbar, LeftSidebar, RightSidebar } from '@/components/layout'
import { FloatingAiWidget } from '@/features/ai'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

/**
 * Three-column structural layout for the student & alumni social platform.
 * Includes a responsive mobile bottom navigation bar below lg breakpoint.
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

  const mobileNavItems = [
    { label: 'Trang chủ', icon: Home, to: ROUTES.APP.HOME },
    { label: 'Alumni', icon: GraduationCap, to: ROUTES.APP.ALUMNI },
    { label: 'Chat', icon: MessageSquare, to: ROUTES.APP.CHAT },
    { label: 'Cơ hội', icon: Briefcase, to: ROUTES.APP.JOBS },
    { label: 'Hồ sơ', icon: User, to: ROUTES.APP.PROFILE },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] text-slate-900 antialiased selection:bg-brand-primary-light selection:text-brand-primary">
      {/* 1. Sticky Navigation Topbar */}
      <Navbar onOpenCreatePost={handleOpenCreatePost} />

      {/* 2. Main Three-Column Container */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-24 lg:pb-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left Sidebar: User Mini Profile & Primary Nav */}
          <div className="sticky top-20 hidden lg:col-span-3 lg:block">
            <LeftSidebar />
          </div>

          {/* Center Column: Outlet for Route Views (e.g. HomePage feed) */}
          <main className="min-w-0 lg:col-span-6">
            <Outlet />
          </main>

          {/* Right Sidebar: Recommended Alumni, Deadlines, Communities */}
          <div className="sticky top-20 hidden lg:col-span-3 lg:block">
            <RightSidebar />
          </div>
        </div>
      </div>

      {/* Mobile Create Post Floating Action Button */}
      {location.pathname !== ROUTES.APP.CHAT && (
        <button
          type="button"
          onClick={handleOpenCreatePost}
          aria-label="Tạo bài viết mới"
          className="fixed bottom-20 left-4 z-40 flex h-11 items-center gap-1.5 rounded-full bg-brand-primary px-4 text-xs font-bold text-white shadow-lg sm:hidden"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Đăng bài</span>
        </button>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Điều hướng di động"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur-md lg:hidden"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors',
                  isActive ? 'text-brand-primary' : 'text-slate-500 hover:text-slate-800'
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* 3. Floating AI Assistant Widget */}
      <FloatingAiWidget />
    </div>
  )
}
