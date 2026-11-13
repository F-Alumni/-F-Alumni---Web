import { useState, useRef, useEffect, type FC } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { authService } from '@/services/auth'
import { notificationsService, type NotificationItemDto } from '@/services/notifications'
import { notificationHubClient } from '@/services/notifications/signalr'
import { FPT_CAMPUSES, normalizeCampusCode } from '@/constants/campuses'
import {
  Search,
  PlusCircle,
  Bell,
  MessageSquare,
  GraduationCap,
  Briefcase,
  ChevronDown,
  LogOut,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'
import fAlumniLogo from '@/assets/f-alumni-logo.png'

interface NavbarProps {
  onOpenCreatePost?: () => void
}

const CampusDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const urlCampus = searchParams.get('campus')
  const normalizedUrlCampus = urlCampus ? normalizeCampusCode(urlCampus) : 'ALL'
  const selectedCampusOption =
    FPT_CAMPUSES.find((c) => c.value === normalizedUrlCampus) || null

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative hidden lg:block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-100 shrink-0"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-brand-accent" />
        <span className="font-medium whitespace-nowrap">
          {selectedCampusOption ? selectedCampusOption.label : 'Tất cả Campus'}
        </span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              navigate(ROUTES.APP.HOME)
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${!selectedCampusOption ? 'bg-brand-accent' : 'bg-slate-300'}`} />
            <span className={!selectedCampusOption ? 'font-semibold text-brand-primary' : 'font-medium'}>
              Tất cả Campus FPTU
            </span>
          </button>
          {FPT_CAMPUSES.map((campus) => (
            <button
              key={campus.value}
              type="button"
              onClick={() => {
                setIsOpen(false)
                navigate(`${ROUTES.APP.HOME}?campus=${encodeURIComponent(campus.value)}`)
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  selectedCampusOption?.value === campus.value ? 'bg-brand-accent' : 'bg-slate-300'
                }`}
              />
              <span
                className={
                  selectedCampusOption?.value === campus.value
                    ? 'font-semibold text-brand-primary'
                    : 'font-medium'
                }
              >
                {campus.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItemDto[]>([])
  const { unreadCount, setUnreadCount, incrementUnreadCount } = useNotificationStore()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadInitial = async () => {
      try {
        const res = await notificationsService.getNotifications({ page: 1, pageSize: 10 })
        if (!isMounted) return
        setNotifications(res.items || [])
        setUnreadCount(res.unreadCount ?? (res.items || []).filter((n) => !n.isRead).length)
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }
    }

    void loadInitial()
    void notificationHubClient.startConnection()

    const unsubscribe = notificationHubClient.onReceiveNotification((incoming) => {
      setNotifications((prev) => [incoming, ...prev.filter((n) => n.id !== incoming.id)].slice(0, 15))
      incrementUnreadCount()
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [setUnreadCount, incrementUnreadCount])

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await notificationsService.markAllAsRead()
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all notifications read:', err)
    }
  }

  const handleNotificationClick = async (item: NotificationItemDto) => {
    setIsOpen(false)
    if (!item.isRead) {
      try {
        await notificationsService.markAsRead(item.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        )
        setUnreadCount(Math.max(0, unreadCount - 1))
      } catch {
        // Ignore non-fatal mark-read failure while navigating
      }
    }
    navigate(item.link || ROUTES.APP.NOTIFICATIONS)
  }

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 shrink-0"
        title="Thông báo"
        aria-label="Thông báo"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">Thông báo</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[11px] font-bold text-brand-primary">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Bạn chưa có thông báo nào.
              </div>
            ) : (
              notifications.map((item) => {
                const lowerType = (item.type || '').toLowerCase()
                return (
                  <div
                    key={item.id}
                    onClick={() => void handleNotificationClick(item)}
                    className={`flex items-start gap-3 p-3 transition-colors hover:bg-slate-50 cursor-pointer rounded-xl ${
                      !item.isRead ? 'bg-orange-50/40' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                      {lowerType.includes('event') ? (
                        <Calendar className="h-4 w-4 text-brand-primary" />
                      ) : lowerType.includes('job') || lowerType.includes('recruit') ? (
                        <Briefcase className="h-4 w-4 text-brand-secondary" />
                      ) : lowerType.includes('chat') || lowerType.includes('message') ? (
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 leading-snug">{item.title}</p>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{item.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-brand-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                )
              })
            )}
          </div>

          <div className="border-t border-slate-100 pt-2 text-center">
            <Link
              to={ROUTES.APP.NOTIFICATIONS}
              onClick={() => setIsOpen(false)}
              className="block rounded-lg py-1.5 text-xs font-semibold text-brand-primary hover:bg-slate-50 transition-colors"
            >
              Xem tất cả thông báo &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export const Navbar: FC<NavbarProps> = ({ onOpenCreatePost }) => {
  const navigate = useNavigate()
  const { currentUser, clearAuth } = useAuthStore()
  const [navSearchQuery, setNavSearchQuery] = useState('')

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

  const handleNavSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = navSearchQuery.trim()
    navigate(q ? `${ROUTES.APP.HOME}?q=${encodeURIComponent(q)}` : ROUTES.APP.HOME)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Left: Brand Logo & Campus Selector */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link to={ROUTES.APP.HOME} className="flex items-center gap-2 shrink-0">
            <img src={fAlumniLogo} alt="F-Alumni Connect Logo" className="h-9 sm:h-10 w-auto object-contain shrink-0" />
          </Link>

          {/* Campus Selector Badge */}
          <div className="shrink-0">
            <CampusDropdown />
          </div>
        </div>

        {/* Center: Search Bar (FO-13) */}
        <div className="hidden min-w-[140px] max-w-md flex-1 md:flex items-center justify-center">
          <form onSubmit={handleNavSearchSubmit} className="relative w-full max-w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              placeholder="Tìm bài viết, chủ đề (Enter)..."
              className="h-9 w-full rounded-full border border-slate-200 bg-slate-50/70 pl-9 pr-4 text-sm transition-all placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </form>
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
            title="Tin nhắn"
            aria-label="Tin nhắn"
          >
            <MessageSquare className="h-5 w-5" />
          </Link>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

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





