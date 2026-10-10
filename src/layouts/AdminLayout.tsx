import type { FC } from 'react'
import { Outlet } from 'react-router-dom'

/**
 * Structural layout container for administrative platform.
 * Provides structural slots for Admin Sidebar, Admin Topbar, and Main Content.
 */
export const AdminLayout: FC = () => {
  return (
    <div className="flex min-h-screen">
      {/* Structural Location: Admin sidebar */}
      <aside data-slot="admin-sidebar">{/* Admin navigation sidebar slot */}</aside>

      <div className="flex flex-1 flex-col">
        {/* Structural Location: Admin topbar */}
        <header data-slot="admin-topbar">{/* Admin topbar header slot */}</header>

        {/* Structural Location: Main content */}
        <main data-slot="main-content" className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
