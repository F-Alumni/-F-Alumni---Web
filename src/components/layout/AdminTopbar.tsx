import { useState, useRef, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Bell,
  Search,
  LogOut,
  Shield,
  ChevronDown,
  User,
  Settings,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'

interface AdminTopbarProps {
  onToggleSidebar?: () => void
}

export const AdminTopbar: FC<AdminTopbarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    clearAuth()
    navigate(ROUTES.AUTH.LOGIN)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Admin Search */}
        <div className="relative hidden w-full sm:block max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search alumni, posts, verification requests..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-[#F1F5F9] pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions & Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications entry point */}
        <div className="relative">
          <button
            type="button"
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Admin Account Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 rounded-full p-1 pl-1.5 transition-colors hover:bg-slate-100"
          >
            <Avatar
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
              fallback="AD"
              size="sm"
              className="border border-slate-200"
            />
            <div className="hidden flex-col text-left sm:flex">
              <span className="text-xs font-bold leading-tight text-slate-900">
                Administrator
              </span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-brand-primary">
                <Shield className="h-2.5 w-2.5" />
                FPT Super Admin
              </span>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">Admin Operations</p>
                <p className="text-[11px] text-slate-500 truncate">admin@fpt.edu.vn</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false)
                  navigate(ROUTES.ADMIN.SETTINGS)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Settings className="h-3.5 w-3.5 text-slate-500" />
                <span>Portal Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false)
                  navigate(ROUTES.ADMIN.USERS)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>Staff & Roles</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
