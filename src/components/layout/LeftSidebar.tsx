import { useState, useEffect, type FC } from 'react'
import { NavLink } from 'react-router-dom'
import {
  IconHome,
  IconUsers,
  IconSchool,
  IconBriefcase,
  IconStack2,
  IconAward,
  IconBookmark,
  IconRobot,
  IconCircleCheck,
  IconMessageDots,
  IconArrowUpRight,
} from '@tabler/icons-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { communitiesService, type ForumCategoryItem } from '@/services/communities'

export const LeftSidebar: FC = () => {
  const { currentUser } = useAuthStore()
  const [categories, setCategories] = useState<ForumCategoryItem[]>([])

  useEffect(() => {
    let isMounted = true
    communitiesService
      .getCategories()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setCategories(data)
        }
      })
      .catch((err) => {
        console.warn('Failed to load categories for LeftSidebar:', err)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const navItems = [
    { label: 'Home', icon: IconHome, to: ROUTES.APP.HOME },
    { label: 'Alumni Directory', icon: IconSchool, to: ROUTES.APP.ALUMNI },
    { label: 'Community Chat', icon: IconMessageDots, to: ROUTES.APP.CHAT },
    { label: 'Communities', icon: IconUsers, to: ROUTES.APP.COMMUNITIES },
    { label: 'Jobs', icon: IconBriefcase, to: ROUTES.APP.JOBS },
    { label: 'Internships', icon: IconStack2, to: ROUTES.APP.INTERNSHIPS },
    { label: 'Scholarships', icon: IconAward, to: ROUTES.APP.SCHOLARSHIPS },
    { label: 'Saved', icon: IconBookmark, to: ROUTES.APP.SAVED },
    { label: 'FPT AI Assistant', icon: IconRobot, to: ROUTES.APP.AI },
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
                  <IconCircleCheck className="h-3 w-3" />
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

          <NavLink
            to={ROUTES.APP.PROFILE}
            title="Xem hồ sơ cá nhân"
            aria-label="Xem hồ sơ cá nhân"
            className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-brand-primary transition-all hover:text-brand-primary-hover hover:underline"
          >
            <span>Hồ sơ cá nhân</span>
            <IconArrowUpRight className="h-3.5 w-3.5" />
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
              </NavLink>
            )
          })}
        </nav>
      </Card>

      {/* 3. Community Categories Quick List (Real Backend Forum Categories) */}
      <Card className="border-slate-200/90 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Chuyên mục FPT
          </span>
          <NavLink
            to={ROUTES.APP.COMMUNITIES}
            className="text-[11px] font-semibold text-brand-primary hover:underline"
          >
            Tất cả
          </NavLink>
        </div>

        {categories.length === 0 ? (
          <p className="py-2 text-center text-xs text-slate-400">Đang tải chuyên mục...</p>
        ) : (
          <ul className="space-y-1 text-xs">
            {categories.slice(0, 5).map((c) => (
              <li key={c.id}>
                <NavLink
                  to={`${ROUTES.APP.HOME}?tag=${encodeURIComponent(c.slug || c.name)}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-primary"
                >
                  <span className="truncate font-medium">#{c.slug || c.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </aside>
  )
}








