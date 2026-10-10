import type { FC } from 'react'
import { Outlet } from 'react-router-dom'

/**
 * Structural layout container for main student/alumni platform.
 * Provides structural slots for Navbar, Sidebar, Main Content, and Optional Right Sidebar.
 */
export const UserLayout: FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Structural Location: Navbar */}
      <header data-slot="navbar" className="w-full">
        {/* Navbar component slot */}
      </header>

      <div className="flex flex-1">
        {/* Structural Location: Sidebar */}
        <aside data-slot="sidebar">{/* Main navigation sidebar slot */}</aside>

        {/* Structural Location: Main content */}
        <main data-slot="main-content" className="flex-1">
          <Outlet />
        </main>

        {/* Structural Location: Optional right sidebar */}
        <aside data-slot="right-sidebar">{/* Contextual/activity sidebar slot */}</aside>
      </div>
    </div>
  )
}
