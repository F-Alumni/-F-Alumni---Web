import type { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar, LeftSidebar, RightSidebar } from '@/components/layout'

/**
 * Three-column structural layout for the student & alumni social platform.
 * Adheres to Stitch AI design specifications: Left Navigation, Center Main Feed, Right Widgets.
 */
export const UserLayout: FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] text-slate-900 antialiased selection:bg-brand-primary-light selection:text-brand-primary">
      {/* 1. Sticky Navigation Topbar */}
      <Navbar />

      {/* 2. Main Three-Column Container */}
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
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
    </div>
  )
}

