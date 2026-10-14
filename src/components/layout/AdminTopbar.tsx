import { useState, useRef, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconMenu2,
  IconBell,
  IconSearch,
  IconLogout,
  IconShield,
  IconChevronDown,
  IconUser,
  IconSettings,
  IconBook,
  IconFlag,
  IconExternalLink,
} from '@tabler/icons-react'
import { Avatar } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { USER_TYPES } from '@/constants/userTypes'

import { authService } from '@/services/auth'

interface AdminTopbarProps {
  onToggleSidebar?: () => void
}

export const AdminTopbar: FC<AdminTopbarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const { currentUser, role, userType, clearAuth } = useAuthStore()
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

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore
    } finally {
      clearAuth()
      navigate(ROUTES.AUTH.LOGIN)
    }
  }

  // Active role badge metadata
  const isAdmin = role === ROLES.ADMIN
  const isModerator = role === ROLES.MODERATOR
  const isFaculty = !isAdmin && !isModerator && userType === USER_TYPES.FACULTY

  const roleBadgeConfig = isAdmin
    ? {
        label: 'FPT Super Admin',
        icon: IconShield,
        colorClass: 'text-brand-primary bg-orange-50 border-orange-200',
      }
    : isModerator
    ? {
        label: 'Safety Moderator',
        icon: IconFlag,
        colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
      }
    : {
        label: 'Faculty Coordinator',
        icon: IconBook,
        colorClass: 'text-brand-accent bg-emerald-50 border-emerald-200',
      }

  const RoleIcon = roleBadgeConfig.icon
  const userName = currentUser?.name || (isAdmin ? 'System Admin' : isModerator ? 'Safety Moderator' : 'Dr. Faculty Member')
  const userInitials = userName.slice(0, 2).toUpperCase()
  const userEmail = currentUser?.email || 'admin@fpt.edu.vn'
  const departmentInfo = currentUser?.department || 'FPT University'

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
          <IconMenu2 size={20} stroke={1.8} />
        </button>

        {/* Global Admin Search */}
        <div className="relative hidden w-full sm:block max-w-sm">
          <IconSearch size={18} stroke={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
            aria-label="Notifications"
          >
            <IconBell size={20} stroke={1.8} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Role Avatar & Identity Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 rounded-full p-1 pl-1.5 transition-colors hover:bg-slate-100"
          >
            <Avatar
              src={currentUser?.avatarUrl}
              fallback={userInitials}
              size="sm"
              className="border border-slate-200"
            />
            <div className="hidden flex-col text-left sm:flex">
              <span className="text-xs font-bold leading-tight text-slate-900 max-w-[140px] truncate">
                {userName}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <RoleIcon size={12} stroke={2} className="text-brand-primary shrink-0" />
                <span className="truncate">{roleBadgeConfig.label}</span>
              </span>
            </div>
            <IconChevronDown
              size={16}
              stroke={1.8}
              className={`text-slate-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-1">
              {/* Active Profile Info */}
              <div className="px-3 py-2.5 border-b border-slate-100 mb-2">
                <div className="flex items-center gap-2">
                  <Avatar
                    src={currentUser?.avatarUrl}
                    fallback={userInitials}
                    size="sm"
                    className="border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                    <p className="text-[10px] text-slate-400 truncate">{departmentInfo}</p>
                  </div>
                </div>

                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${roleBadgeConfig.colorClass}`}>
                    <RoleIcon size={12} stroke={2} />
                    <span>{roleBadgeConfig.label}</span>
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false)
                  navigate(ROUTES.APP.HOME)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <IconExternalLink size={16} stroke={1.8} className="text-brand-secondary" />
                <span>Go to Community Feed</span>
              </button>

              {role === ROLES.ADMIN && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false)
                    navigate(ROUTES.ADMIN.SETTINGS)
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <IconSettings size={16} stroke={1.8} className="text-slate-500" />
                  <span>Portal Settings</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false)
                  navigate(ROUTES.ADMIN.USERS)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <IconUser size={16} stroke={1.8} className="text-slate-500" />
                <span>{isFaculty ? 'Academic Directory' : 'Staff & Roles'}</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <IconLogout size={16} stroke={1.8} className="text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
