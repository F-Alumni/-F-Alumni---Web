import { useState, type FC } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar, AdminTopbar } from '@/components/layout'

/**
 * Structural layout container for the FPT University Administration Platform.
 * Features persistent Admin Sidebar, responsive Mobile Drawer, and sticky Admin Topbar.
 */
export const AdminLayout: FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-brand-primary/20 selection:text-brand-primary">
      {/* 1. Admin Navigation Sidebar (Desktop & Mobile Drawer) */}
      <AdminSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Right Region (Topbar + Main Content) */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Sticky Topbar */}
        <AdminTopbar onToggleSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Dynamic Page Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
