import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import {
  IconLayoutDashboard,
  IconUsers,
  IconUserCheck,
  IconBuildingCommunity,
  IconArticle,
  IconBriefcase,
  IconFlag,
  IconChartBar,
  IconSettings,
  IconX,
  IconShield,
  IconBook,
  IconExternalLink,
  type Icon as TablerIcon,
} from '@tabler/icons-react'
import { ROUTES } from '@/constants/routes'
import { ROLES, type Role } from '@/constants/roles'
import { USER_TYPES } from '@/constants/userTypes'
import { useAuthStore } from '@/stores/authStore'
import fptLogo from '@/assets/fpt-logo.svg'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface NavItem {
  label: string
  to: string
  icon: TablerIcon
  allowedRoles: (Role | 'FACULTY')[]
  badge?: string
  badgeColor?: string
  facultyLabel?: string
}

interface NavSection {
  title: string
  allowedRoles: (Role | 'FACULTY')[]
  items: NavItem[]
}

export const AdminSidebar: FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
  const { role, userType } = useAuthStore()

  const isAdmin = role === ROLES.ADMIN
  const isModerator = role === ROLES.MODERATOR
  const isFaculty = !isAdmin && !isModerator && userType === USER_TYPES.FACULTY

  const isRoleAuthorized = (allowed: (Role | 'FACULTY')[]) => {
    if (isAdmin) return true
    return allowed.some((r) => {
      if (r === 'FACULTY') return isFaculty
      return role === r
    })
  }

  const allSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      allowedRoles: [ROLES.ADMIN, ROLES.MODERATOR, 'FACULTY'],
      items: [
        {
          label: 'Dashboard',
          to: ROUTES.ADMIN.DASHBOARD,
          icon: IconLayoutDashboard,
          allowedRoles: [ROLES.ADMIN, ROLES.MODERATOR, 'FACULTY'],
        },
      ],
    },
    {
      title: 'ACADEMIC & USERS',
      allowedRoles: [ROLES.ADMIN, 'FACULTY'],
      items: [
        {
          label: isFaculty ? 'Users Directory' : 'Users',
          facultyLabel: 'Users Directory',
          to: ROUTES.ADMIN.USERS,
          icon: IconUsers,
          allowedRoles: [ROLES.ADMIN, 'FACULTY'],
        },
        {
          label: 'Alumni Verification',
          to: ROUTES.ADMIN.ALUMNI_VERIFICATION,
          icon: IconUserCheck,
          allowedRoles: [ROLES.ADMIN],
        },
      ],
    },
    {
      title: 'CONTENT MANAGEMENT',
      allowedRoles: [ROLES.ADMIN, ROLES.MODERATOR, 'FACULTY'],
      items: [
        {
          label: 'Communities',
          to: ROUTES.ADMIN.COMMUNITIES,
          icon: IconBuildingCommunity,
          allowedRoles: [ROLES.ADMIN, 'FACULTY'],
        },
        {
          label: 'Posts',
          to: ROUTES.ADMIN.POSTS,
          icon: IconArticle,
          allowedRoles: [ROLES.ADMIN, ROLES.MODERATOR],
        },
        {
          label: 'Opportunities',
          to: ROUTES.ADMIN.OPPORTUNITIES,
          icon: IconBriefcase,
          allowedRoles: [ROLES.ADMIN, 'FACULTY'],
        },
      ],
    },
    {
      title: 'MODERATION',
      allowedRoles: [ROLES.ADMIN, ROLES.MODERATOR],
      items: [
        {
          label: 'Reports',
          to: ROUTES.ADMIN.REPORTS,
          icon: IconFlag,
          allowedRoles: [ROLES.ADMIN, ROLES.MODERATOR],
        },
      ],
    },
    {
      title: 'INSIGHTS',
      allowedRoles: [ROLES.ADMIN],
      items: [
        {
          label: 'Analytics',
          to: ROUTES.ADMIN.ANALYTICS,
          icon: IconChartBar,
          allowedRoles: [ROLES.ADMIN],
        },
      ],
    },
    {
      title: 'SYSTEM',
      allowedRoles: [ROLES.ADMIN],
      items: [
        {
          label: 'Settings',
          to: ROUTES.ADMIN.SETTINGS,
          icon: IconSettings,
          allowedRoles: [ROLES.ADMIN],
        },
      ],
    },
  ]

  // Filter sections and child navigation items dynamically
  const visibleSections = allSections
    .filter((section) => isRoleAuthorized(section.allowedRoles))
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isRoleAuthorized(item.allowedRoles)),
    }))
    .filter((section) => section.items.length > 0)

  // Portal subtitle tag
  const portalSubtitle = isFaculty
    ? 'Faculty Portal'
    : isModerator
    ? 'Safety Moderation'
    : 'Administration'

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2.5">
            <img src={fptLogo} alt="FPT Logo" className="h-8 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-slate-900">
                Alumni Connect
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-primary">
                {isFaculty ? (
                  <IconBook size={12} stroke={2} />
                ) : (
                  <IconShield size={12} stroke={2} />
                )}
                {portalSubtitle}
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
              aria-label="Close sidebar"
            >
              <IconX size={20} stroke={1.8} />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {visibleSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const displayLabel = isFaculty && item.facultyLabel ? item.facultyLabel : item.label
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all',
                          isActive
                            ? 'bg-brand-primary/10 text-brand-primary border-l-3 border-brand-primary pl-2.5'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={20} stroke={1.8} className="shrink-0" />
                        <span>{displayLabel}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                            item.badgeColor || 'bg-brand-primary/10 text-brand-primary'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Direct Link to Community Social Feed */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              COMMUNITY NETWORK
            </p>
            <NavLink
              to={ROUTES.APP.HOME}
              onClick={onClose}
              className="group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-brand-secondary hover:bg-sky-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <IconExternalLink size={18} stroke={1.8} className="shrink-0 text-brand-secondary" />
                <span>Community Feed</span>
              </div>
              <span className="rounded-full bg-brand-secondary/10 px-2 py-0.5 text-[10px] font-bold text-brand-secondary">
                Web App
              </span>
            </NavLink>
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl border border-slate-200/80 bg-[#F8FAFC] p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">
                {isFaculty ? 'Faculty Portal' : isModerator ? 'Safety Desk' : 'FPT Portal'}
              </span>
              <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-[10px] font-bold text-brand-accent">
                Active
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {isFaculty
                ? 'Academic community oversight & directory'
                : isModerator
                ? 'Incident response & content moderation'
                : 'FPT University Administration System'}
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
