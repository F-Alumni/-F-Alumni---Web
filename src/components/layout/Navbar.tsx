import type { FC } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  PlusCircle,
  Bell,
  MessageSquare,
  GraduationCap,
  Briefcase,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'
import fptLogo from '@/assets/fpt-logo.svg'

interface NavbarProps {
  onOpenCreatePost?: () => void
}

export const Navbar: FC<NavbarProps> = ({ onOpenCreatePost }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Campus Selector */}
        <div className="flex items-center gap-4">
          <Link to={ROUTES.APP.HOME} className="flex items-center gap-2.5">
            <img src={fptLogo} alt="FPT University Logo" className="h-9 w-auto object-contain" />
            <div className="hidden flex-col sm:flex">
              <span className="text-sm font-bold leading-tight tracking-tight text-slate-900">
                Alumni Network
              </span>
              <span className="text-[10px] font-medium text-brand-primary">
                FPT University Community
              </span>
            </div>
          </Link>

          {/* Campus Selector Badge */}
          <div className="hidden cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-100 lg:flex">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-accent" />
            <span className="font-medium">Hoa Lac Campus</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="mx-6 hidden max-w-md flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search alumni, jobs, posts..."
              className="h-9.5 w-full rounded-full border border-slate-200 bg-slate-50/70 pl-9 pr-12 text-sm transition-all placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-0.5 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 sm:inline-flex">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right: Actions, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Post Button */}
          <Button
            onClick={onOpenCreatePost}
            className="hidden h-9 rounded-full bg-brand-primary px-4 text-white shadow-sm shadow-brand-primary/20 hover:bg-brand-primary-hover sm:inline-flex"
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            <span>Create Post</span>
          </Button>

          {/* Nav Links */}
          <Link
            to={ROUTES.APP.ALUMNI}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-primary lg:flex"
          >
            <GraduationCap className="h-4 w-4 text-brand-secondary" />
            <span>Mentors</span>
          </Link>

          <Link
            to={ROUTES.APP.JOBS}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-primary lg:flex"
          >
            <Briefcase className="h-4 w-4 text-brand-accent" />
            <span>Opportunities</span>
            <Badge variant="brand-primary" className="ml-0.5 px-1.5 py-0 text-[10px]">
              Mới
            </Badge>
          </Link>

          {/* Messages */}
          <Link
            to={ROUTES.APP.CHAT}
            className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            title="Messages"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-secondary" />
          </Link>

          {/* Notifications */}
          <Link
            to={ROUTES.APP.NOTIFICATIONS}
            className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white">
              3
            </span>
          </Link>

          {/* Divider */}
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

          {/* User Profile Mini Trigger */}
          <Link
            to={ROUTES.APP.PROFILE}
            className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-100"
          >
            <Avatar
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
              fallback="ML"
              size="sm"
              isVerified
              isOnline
            />
            <div className="hidden flex-col text-left xl:flex">
              <span className="text-xs font-semibold leading-tight text-slate-900">Maya Lin</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                SE &apos;25
                <Sparkles className="inline h-2.5 w-2.5 text-amber-500" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}


