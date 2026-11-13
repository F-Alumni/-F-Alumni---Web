import { useState, useRef, useEffect, type FC } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { authService } from '@/services/auth'
import { formatNotificationTime } from '@/services/notifications'
import {
  IconSmartHome,
  IconUsers,
  IconBriefcase,
  IconMessageDots,
  IconCirclePlus,
  IconBell,
  IconUser,
  IconLogout,
  IconSettings,
  IconChevronDown,
  IconCircleCheck,
  IconHeart,
  IconMessageCircle,
  IconCalendar,
} from '@tabler/icons-react'
import { Avatar } from '@/components/ui/avatar'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import fAlumniLogo from '@/assets/f-alumni-logo.png'

interface NavbarProps {
  onOpenCreatePost?: () => void
}

/**
 * Campus Selection Dropdown (Top Left)
 */
const CampusDropdown: FC = () => {
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

  const campuses = [
    'Hoa Lac Campus',
    'Da Nang Campus',
    'Ho Chi Minh Campus',
    'Can Tho Campus',
    'Quy Nhon Campus',
  ]

  return (
    <div className="relative hidden xl:block" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-100 shrink-0 select-none"
        title="Chọn phân hiệu Campus"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-brand-accent" />
        <span className="font-medium whitespace-nowrap">{selectedCampus}</span>
        <IconChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          {campuses.map((campus) => (
            <div
              key={campus}
              onClick={() => {
                setSelectedCampus(campus)
                setIsOpen(false)
              }}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  campus === selectedCampus ? 'bg-brand-accent' : 'bg-slate-300'
                }`}
              />
              <span
                className={
                  campus === selectedCampus
                    ? 'font-semibold text-brand-primary'
                    : 'font-medium'
                }
              >
                {campus}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Realtime Notification Dropdown (Top Right)
 */
const NotificationDropdown: FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, currentUser } = useAuthStore()
  const {
    items: notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    startRealtime,
  } = useNotificationStore()
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
    if (!isAuthenticated || !currentUser?.id) return
    void loadNotifications()
    const stop = startRealtime()
    return () => {
      stop()
    }
  }, [isAuthenticated, currentUser?.id, loadNotifications, startRealtime])

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    void markAllAsRead()
  }

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
          isOpen
            ? 'bg-brand-primary/10 text-brand-primary'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
        )}
        title="Thông báo"
        aria-label="Thông báo"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <IconBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
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
              <div className="px-4 py-8 text-center text-xs text-slate-500">
                Chưa có thông báo mới.
              </div>
            ) : (
              notifications.slice(0, 12).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    void markAsRead(item.id)
                    setIsOpen(false)
                    navigate(item.link || ROUTES.APP.NOTIFICATIONS)
                  }}
                  className={`flex items-start gap-3 p-3 transition-colors hover:bg-slate-50 cursor-pointer rounded-xl ${
                    !item.isRead ? 'bg-orange-50/40' : ''
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    {item.type === 'chat_message' && (
                      <IconMessageDots className="h-4 w-4 text-brand-secondary" />
                    )}
                    {item.type === 'post_like' && <IconHeart className="h-4 w-4 text-rose-500" />}
                    {(item.type === 'post_comment' || item.type === 'comment_reply') && (
                      <IconMessageCircle className="h-4 w-4 text-brand-primary" />
                    )}
                    {item.type === 'event' && <IconCalendar className="h-4 w-4 text-brand-primary" />}
                    {item.type === 'job' && <IconBriefcase className="h-4 w-4 text-brand-secondary" />}
                    {item.type === 'system' && (
                      <IconCircleCheck className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 leading-snug">{item.title}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{item.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {formatNotificationTime(item.createdAt)}
                    </span>
                  </div>
                  {!item.isRead && (
                    <span className="h-2 w-2 rounded-full bg-brand-primary shrink-0 mt-1.5" />
                  )}
                </div>
              ))
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

/**
 * User Profile Dropdown Menu (Top Right)
 * Replaces the previous Left Sidebar profile card with full user information:
 * Full name, Email, Department / Role, direct link to Profile and Sign Out action.
 */
interface ProfileDropdownProps {
  onLogout: () => void
}

const ProfileDropdown: FC<ProfileDropdownProps> = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { currentUser } = useAuthStore()
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

  const getRoleBadge = () => {
    if (currentUser?.role === 'ADMIN') return 'Quản trị viên'
    if (currentUser?.role === 'MODERATOR') return 'Kiểm duyệt viên'
    if (currentUser?.userType === 'ALUMNI') return 'Cựu sinh viên'
    if (currentUser?.userType === 'FACULTY') return 'Giảng viên'
    return 'Sinh viên'
  }

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative flex items-center gap-1 rounded-full p-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/30',
          isOpen ? 'ring-2 ring-brand-primary' : 'hover:ring-2 hover:ring-slate-300'
        )}
        title={currentUser?.name || 'Tài khoản người dùng'}
        aria-label="Menu tài khoản người dùng"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar
          src={currentUser?.avatarUrl}
          fallback={(currentUser?.name || 'User').slice(0, 2).toUpperCase()}
          size="sm"
          isVerified={currentUser?.isVerified}
          isOnline
        />
        <div className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-200 text-slate-700 border border-white">
          <IconChevronDown
            className={cn('h-2.5 w-2.5 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* User Info Header Preview (Replacing former sidebar profile) */}
          <Link
            to={ROUTES.APP.PROFILE}
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50 border border-slate-100"
          >
            <Avatar
              src={currentUser?.avatarUrl}
              fallback={(currentUser?.name || 'User').slice(0, 2).toUpperCase()}
              size="md"
              isVerified={currentUser?.isVerified}
              isOnline
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 truncate group-hover:text-brand-primary transition-colors">
                  {currentUser?.name || 'FPT Member'}
                </span>
                {currentUser?.isVerified && (
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-white"
                    title="Đã xác minh"
                  >
                    <IconCircleCheck className="h-3 w-3" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">
                {currentUser?.email || 'Chưa cập nhật email'}
              </p>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center rounded-md bg-brand-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-primary">
                  {getRoleBadge()}
                </span>
                <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                  {currentUser?.department || 'Kỹ thuật phần mềm'}
                </span>
                {currentUser?.cohort && (
                  <span className="text-[10px] text-slate-400">• K{currentUser.cohort}</span>
                )}
              </div>
            </div>
          </Link>

          <div className="my-2 border-t border-slate-100" />

          {/* Quick Profile Navigation */}
          <div className="space-y-0.5">
            <Link
              to={ROUTES.APP.PROFILE}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <IconUser className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">Hồ sơ cá nhân</p>
                <p className="text-[11px] text-slate-400">Xem và chỉnh sửa trang cá nhân của bạn</p>
              </div>
            </Link>

            <Link
              to={ROUTES.APP.SETTINGS}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <IconSettings className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">Cài đặt tài khoản</p>
                <p className="text-[11px] text-slate-400">Bảo mật và quyền riêng tư</p>
              </div>
            </Link>
          </div>

          <div className="my-2 border-t border-slate-100" />

          {/* Sign Out Action */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              onLogout()
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
              <IconLogout className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-red-600">Đăng xuất</p>
              <p className="text-[11px] text-red-400">Thoát tài khoản khỏi phiên làm việc</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Main Application Top Navbar (Facebook Web Style)
 * Features:
 * - Left: F-Alumni brand logo & Campus selector
 * - Center: Wide centered navigation tabs with active indicator underline (Home, Alumni, Jobs, Communities, Chat)
 * - Right: Quick create button (+), Notification dropdown, User Profile Dropdown
 */
export const Navbar: FC<NavbarProps> = ({ onOpenCreatePost }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearAuth } = useAuthStore()
  const { items: notifications } = useNotificationStore()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // Ignore
    } finally {
      useNotificationStore.getState().reset()
      clearAuth()
      navigate(ROUTES.AUTH.LOGIN)
    }
  }

  // Active unread chat message check for center tab badge
  const hasUnreadChat =
    notifications.some((n) => !n.isRead && n.type === 'chat_message')

  // Standard Facebook Web Center Navigation Tabs
  const navTabs = [
    {
      label: 'Trang chủ / Bảng tin',
      href: ROUTES.APP.HOME,
      icon: IconSmartHome,
      isActive: (pathname: string) =>
        pathname === ROUTES.APP.HOME ||
        pathname === ROUTES.APP.ROOT ||
        pathname === '/app' ||
        pathname.startsWith('/app/posts'),
    },
    {
      label: 'Sự kiện & Workshop',
      href: ROUTES.APP.EVENTS,
      icon: IconCalendar,
      isActive: (pathname: string) => pathname.startsWith(ROUTES.APP.EVENTS),
    },
    {
      label: 'Danh bạ Cựu sinh viên',
      href: ROUTES.APP.ALUMNI,
      icon: IconUsers,
      isActive: (pathname: string) => pathname.startsWith(ROUTES.APP.ALUMNI),
    },
    {
      label: 'Cơ hội & Việc làm',
      href: ROUTES.APP.JOBS,
      icon: IconBriefcase,
      isActive: (pathname: string) =>
        pathname.startsWith(ROUTES.APP.JOBS) ||
        pathname.startsWith(ROUTES.APP.INTERNSHIPS) ||
        pathname.startsWith(ROUTES.APP.SCHOLARSHIPS),
    },
    {
      label: 'Trò chuyện & Tin nhắn',
      href: ROUTES.APP.CHAT,
      icon: IconMessageDots,
      hasBadge: hasUnreadChat,
      isActive: (pathname: string) => pathname.startsWith(ROUTES.APP.CHAT),
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 sm:h-16 w-full items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* 1. Left: Brand Logo & Campus Selector */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 flex-1 max-w-[220px] lg:max-w-[300px]">
          <Link
            to={ROUTES.APP.HOME}
            className="flex items-center gap-2 shrink-0 group focus:outline-none"
            title="F-Alumni Connect - Trang chủ"
            aria-label="F-Alumni Connect"
          >
            <img
              src={fAlumniLogo}
              alt="F-Alumni Connect Logo"
              className="h-8 sm:h-9 w-auto object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          <CampusDropdown />
        </div>

        {/* 2. Center: Standard Facebook Web Navigation Bar */}
        <nav
          className="flex items-center justify-center h-full flex-1 max-w-2xl px-1 sm:px-2"
          aria-label="Thanh điều hướng chính"
        >
          <div className="flex items-center justify-center h-full w-full max-w-[560px] gap-1 sm:gap-2">
            {navTabs.map((tab) => {
              const active = tab.isActive(location.pathname)
              const Icon = tab.icon

              return (
                <Link
                  key={tab.href}
                  to={tab.href}
                  title={tab.label}
                  aria-label={tab.label}
                  className={cn(
                    'relative flex h-full flex-1 max-w-[112px] min-w-[48px] sm:min-w-[64px] items-center justify-center border-b-[3px] transition-all focus:outline-none group',
                    active
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  )}
                >
                  <div
                    className={cn(
                      'relative flex h-10 sm:h-11 w-full mx-1 items-center justify-center rounded-xl transition-all duration-150',
                      active
                        ? 'bg-transparent text-brand-primary'
                        : 'text-slate-500 hover:bg-slate-100 group-hover:bg-slate-100'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-6 w-6 transition-transform duration-150 group-hover:scale-105',
                        active ? 'stroke-[2.3]' : 'stroke-[1.8]'
                      )}
                    />
                    {tab.hasBadge && (
                      <span className="absolute top-1.5 right-1.5 sm:right-3 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-secondary opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-secondary ring-2 ring-white" />
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* 3. Right: Quick Actions, Notifications & Profile Dropdown */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0 flex-1 max-w-[220px] lg:max-w-[300px]">
          {/* Quick Create Post Button */}
          <button
            type="button"
            onClick={onOpenCreatePost}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all hover:bg-slate-200 hover:text-brand-primary active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            title="Tạo bài viết nhanh"
            aria-label="Tạo bài viết nhanh"
          >
            <IconCirclePlus className="h-5 w-5" />
          </button>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Profile Dropdown Menu */}
          <ProfileDropdown onLogout={handleLogout} />
        </div>
      </div>
    </header>
  )
}
