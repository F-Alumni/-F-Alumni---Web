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
  type Icon as TablerIcon,
} from '@tabler/icons-react'
import { ROUTES } from '@/constants/routes'
import fptLogo from '@/assets/fpt-logo.svg'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface NavSection {
  title: string
  items: {
    label: string
    to: string
    icon: TablerIcon
    badge?: string
    badgeColor?: string
  }[]
}

export const AdminSidebar: FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', to: ROUTES.ADMIN.DASHBOARD, icon: IconLayoutDashboard },
      ],
    },
    {
      title: 'USER MANAGEMENT',
      items: [
        { label: 'Users', to: ROUTES.ADMIN.USERS, icon: IconUsers },
        {
          label: 'Alumni Verification',
          to: ROUTES.ADMIN.ALUMNI_VERIFICATION,
          icon: IconUserCheck,
        },
      ],
    },
    {
      title: 'CONTENT MANAGEMENT',
      items: [
        { label: 'Communities', to: ROUTES.ADMIN.COMMUNITIES, icon: IconBuildingCommunity },
        { label: 'Posts', to: ROUTES.ADMIN.POSTS, icon: IconArticle },
        { label: 'Opportunities', to: ROUTES.ADMIN.OPPORTUNITIES, icon: IconBriefcase },
      ],
    },
    {
      title: 'MODERATION',
      items: [
        {
          label: 'Reports',
          to: ROUTES.ADMIN.REPORTS,
          icon: IconFlag,
        },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { label: 'Analytics', to: ROUTES.ADMIN.ANALYTICS, icon: IconChartBar },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Settings', to: ROUTES.ADMIN.SETTINGS, icon: IconSettings },
      ],
    },
  ]

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
                <IconShield size={12} stroke={2} />
                Administration
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
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
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
                        <span>{item.label}</span>
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
        </div>

        {/* Sidebar Footer info */}
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl border border-slate-200/80 bg-[#F8FAFC] p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">FPT Portal</span>
              <span className="rounded-full bg-brand-accent/15 px-2 py-0.5 text-[10px] font-bold text-brand-accent">
                v1.0
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              FPT University Administration System
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
