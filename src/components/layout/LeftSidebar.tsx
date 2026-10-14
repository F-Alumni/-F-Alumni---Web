import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  Users2,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  Bookmark,
  Bot,
  Sparkles,
  CheckCircle2,
  Coins,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

export const LeftSidebar: FC = () => {
  const { currentUser } = useAuthStore()

  const navItems = [
    { label: 'Home', icon: Home, to: ROUTES.APP.HOME },
    { label: 'Alumni Directory', icon: GraduationCap, to: ROUTES.APP.ALUMNI },
    { label: 'Community Chat', icon: MessageSquare, to: ROUTES.APP.CHAT },
    { label: 'Communities', icon: Users2, to: ROUTES.APP.COMMUNITIES, count: '14' },
    { label: 'Jobs', icon: Briefcase, to: ROUTES.APP.JOBS, badge: 'New' },
    { label: 'Internships', icon: Layers, to: ROUTES.APP.INTERNSHIPS },
    {
      label: 'Scholarships',
      icon: Award,
      to: ROUTES.APP.SCHOLARSHIPS,
      badge: '3 open',
      badgeVariant: 'brand-primary' as const,
    },
    { label: 'Saved', icon: Bookmark, to: ROUTES.APP.SAVED },
    {
      label: 'FPT AI Assistant',
      icon: Bot,
      to: ROUTES.APP.AI,
      badge: 'BETA',
      badgeGradient: true,
    },
  ]

  return (
    <aside className="w-full space-y-4">
      {/* 1. User Mini Profile Card */}
      <Card className="overflow-hidden border-slate-200/90 bg-white shadow-sm">
        {/* Banner with subtle FPT gradient */}
        <div className="relative h-16 w-full bg-gradient-to-r from-brand-primary via-slate-800 to-slate-700" />

        <div className="relative z-10 -mt-8 px-4 pb-4 pt-0">
          <div className="mb-3 flex items-end justify-between">
            <Avatar
              src={currentUser?.avatarUrl}
              fallback={(currentUser?.name || 'User').slice(0, 2).toUpperCase()}
              size="lg"
              isVerified={currentUser?.isVerified}
              isOnline
              className="border-2 border-white shadow-sm"
            />
          </div>

          <div>
            <h2 className="text-base font-bold leading-snug text-slate-900 flex items-center gap-1.5">
              {currentUser?.name || 'FPT Member'}
              {currentUser?.isVerified && (
                <Badge
                  variant="brand-accent"
                  className="h-4 w-4 p-0 flex items-center justify-center rounded-full"
                  title="Verified Member"
                >
                  <CheckCircle2 className="h-3 w-3" />
                </Badge>
              )}
            </h2>
            <p className="text-xs font-medium text-slate-600">
              {currentUser?.department || 'Kỹ thuật phần mềm'}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {currentUser?.cohort ? `Cohort ${currentUser.cohort}` : 'Cộng đồng FPT'} •{' '}
              {currentUser?.campus || 'Hòa Lạc'}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 text-center">
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <Coins className="h-3 w-3 text-yellow-500" />
                34
              </span>
              <span className="text-[10px] text-slate-500">Alumni Coins</span>
            </div>
            <div className="flex flex-col items-center border-l border-slate-200">
              <span className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <MessageSquare className="h-3 w-3 text-brand-secondary" />
                12
              </span>
              <span className="text-[10px] text-slate-500">Discussions</span>
            </div>
          </div>

          <NavLink
            to={ROUTES.APP.PROFILE}
            className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-brand-primary transition-all hover:text-brand-primary-hover hover:underline"
          >
            <span>View full profile</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </NavLink>
        </div>
      </Card>

      {/* 2. Main Navigation Items */}
      <Card className="border-slate-200/90 bg-white p-2 shadow-sm">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'shadow-xs bg-brand-primary-light font-semibold text-brand-primary'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      'text-slate-500 group-hover:text-brand-primary'
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.count && (
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-600">
                    {item.count}
                  </span>
                )}

                {item.badge && !item.badgeGradient && (
                  <Badge
                    variant={item.badgeVariant ?? 'brand-primary'}
                    className="px-1.5 py-0 text-[10px]"
                  >
                    {item.badge}
                  </Badge>
                )}

                {item.badgeGradient && (
                  <span className="shadow-xs inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Sparkles className="h-2.5 w-2.5" />
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>
      </Card>

      {/* 3. Community Circles Quick List */}
      <Card className="border-slate-200/90 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Your Communities
          </span>
          <NavLink
            to={ROUTES.APP.COMMUNITIES}
            className="text-[11px] font-semibold text-brand-primary hover:underline"
          >
            Khám phá
          </NavLink>
        </div>

        <ul className="space-y-1 text-xs">
          {[
            { name: '#FPT-Software-Alumni', count: '3.4k' },
            { name: '#FPT-Startup-Founders', count: '1.2k' },
            { name: '#AI-Robotics-Hub', count: '890' },
            { name: '#Capstones-Spring-26', count: '450' },
          ].map((c) => (
            <li key={c.name}>
              <NavLink
                to={ROUTES.APP.COMMUNITIES}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-primary"
              >
                <span className="truncate font-medium">{c.name}</span>
                <span className="text-[10px] text-slate-400">{c.count}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </Card>
    </aside>
  )
}








