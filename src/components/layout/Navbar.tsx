import { useState, useRef, useEffect, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/auth'
import {
  Search,
  PlusCircle,
  Bell,
  MessageSquare,
  GraduationCap,
  Briefcase,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'
import fptLogo from '@/assets/fpt-logo.svg'

interface NavbarProps {
  onOpenCreatePost?: () => void
}

const CampusDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCampus, setSelectedCampus] = useState('Hoa Lac Campus')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const campuses = ['Hoa Lac Campus', 'Da Nang Campus', 'Ho Chi Minh Campus', 'Can Tho Campus', 'Quy Nhon Campus']

  return (
    <div className="relative hidden lg:block" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-100 shrink-0"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-brand-accent" />
        <span className="font-medium whitespace-nowrap">{selectedCampus}</span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50">
          {campuses.map((campus) => (
            <div
              key={campus}
              onClick={() => {
                setSelectedCampus(campus)
                setIsOpen(false)
              }}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${campus === selectedCampus ? 'bg-brand-accent' : 'bg-slate-300'}`} />
              <span className={campus === selectedCampus ? 'font-semibold text-brand-primary' : 'font-medium'}>{campus}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const Navbar: FC<NavbarProps> = ({ onOpenCreatePost }) => {
  const navigate = useNavigate()
  const { currentUser, clearAuth } = useAuthStore()

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Left: Brand Logo & Campus Selector */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link to={ROUTES.APP.HOME} className="flex items-center gap-2 shrink-0">
            <img src={fptLogo} alt="FPT University Logo" className="h-8 sm:h-9 w-auto object-contain shrink-0" />
            <div className="hidden flex-col justify-center xl:flex shrink-0">
              <span className="text-[14px] sm:text-[15px] font-extrabold leading-tight tracking-tight text-slate-900 whitespace-nowrap">
                Alumni Network
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide text-brand-primary/90 whitespace-nowrap">
                FPT University Community
              </span>
            </div>
          </Link>

          {/* Campus Selector Badge */}
          <div className="shrink-0">
            <CampusDropdown />
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden min-w-[140px] max-w-md flex-1 md:flex items-center justify-center">
          <div className="relative w-full max-w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-full rounded-full border border-slate-200 bg-slate-50/70 pl-9 pr-4 text-sm transition-all placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
            
          </div>
        </div>

        {/* Right: Actions, Notifications & Profile */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0">
          {/* Create Post Button */}
          <Button
            onClick={onOpenCreatePost}
            className="hidden h-9 rounded-full bg-brand-primary px-4 text-white shadow-sm shadow-brand-primary/20 hover:bg-brand-primary-hover sm:inline-flex shrink-0"
          >
            <PlusCircle className="mr-1.5 h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Create Post</span>
          </Button>

          {/* Nav Links */}
          <Link
            to={ROUTES.APP.ALUMNI}
            className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-primary xl:flex shrink-0"
          >
            <GraduationCap className="h-4 w-4 text-brand-secondary shrink-0" />
            <span>Mentors</span>
          </Link>

          <Link
            to={ROUTES.APP.JOBS}
            className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-primary xl:flex shrink-0"
          >
            <Briefcase className="h-4 w-4 text-brand-accent shrink-0" />
            <span>Opportunities</span>
            <Badge variant="brand-primary" className="ml-0.5 px-1.5 py-0 text-[10px] shrink-0">
              Mới
            </Badge>
          </Link>

          {/* Messages */}
          <Link
            to={ROUTES.APP.CHAT}
            className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 shrink-0"
            title="Messages"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-secondary" />
          </Link>

          {/* Notifications */}
          <Link
            to={ROUTES.APP.NOTIFICATIONS}
            className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 shrink-0"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white">
              3
            </span>
          </Link>

          {/* Divider */}
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block shrink-0" />

          {/* User Profile Mini Trigger */}
          <Link
            to={ROUTES.APP.PROFILE}
            className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-100 shrink-0"
          >
            <Avatar
              src={currentUser?.avatarUrl}
              fallback={(currentUser?.name || 'User').slice(0, 2).toUpperCase()}
              size="sm"
              isVerified={currentUser?.isVerified}
              isOnline
            />
            <div className="hidden xl:block shrink-0 pr-2">
              <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                {currentUser?.name || 'User'}
              </span>
            </div>
          </Link>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-500 shrink-0"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5 shrink-0" />
          </button>
        </div>
      </div>
    </header>
  )
}





