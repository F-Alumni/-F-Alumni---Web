import { useState, useEffect, useCallback, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  Calendar,
  Briefcase,
  Sparkles,
  MessageSquare,
  Trash2,
  Check,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'
import { notificationsService, type NotificationItemDto } from '@/services/notifications'
import { notificationHubClient } from '@/services/notifications/signalr'
import { useNotificationStore } from '@/stores/notificationStore'

export const NotificationsPage: FC = () => {
  const navigate = useNavigate()
  const { setUnreadCount, incrementUnreadCount } = useNotificationStore()
  const [notifications, setNotifications] = useState<NotificationItemDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'events' | 'jobs'>('all')

  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await notificationsService.getNotifications({ page: 1, pageSize: 50 })
      const items = res.items || []
      setNotifications(items)
      setUnreadCount(res.unreadCount ?? items.filter((n) => !n.isRead).length)
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setErrorMessage('Không thể tải danh sách thông báo. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [setUnreadCount])

  useEffect(() => {
    void loadNotifications()
    void notificationHubClient.startConnection()

    const unsubscribe = notificationHubClient.onReceiveNotification((incoming) => {
      setNotifications((prev) => [incoming, ...prev.filter((n) => n.id !== incoming.id)])
      incrementUnreadCount()
    })

    return () => {
      unsubscribe()
    }
  }, [loadNotifications, incrementUnreadCount])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const deleteReadNotifications = async () => {
    const readItems = notifications.filter((n) => n.isRead)
    if (readItems.length === 0) return
    try {
      await Promise.all(readItems.map((n) => notificationsService.deleteNotification(n.id)))
      setNotifications((prev) => prev.filter((n) => !n.isRead))
    } catch (err) {
      console.error('Failed to delete read notifications:', err)
    }
  }

  const handleDeleteOne = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const target = notifications.find((n) => n.id === id)
      await notificationsService.deleteNotification(id)
      const next = notifications.filter((n) => n.id !== id)
      setNotifications(next)
      if (target && !target.isRead) {
        setUnreadCount(next.filter((n) => !n.isRead).length)
      }
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const markAsRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id)
    if (!target || target.isRead) return
    try {
      await notificationsService.markAsRead(id)
      const next = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      setNotifications(next)
      setUnreadCount(next.filter((n) => !n.isRead).length)
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }

  const getVisualType = (item: NotificationItemDto) => {
    const t = (item.type || '').toLowerCase()
    if (t.includes('event')) return 'event'
    if (t.includes('job') || t.includes('recruit') || t.includes('opportunity')) return 'job'
    if (t.includes('ai')) return 'ai'
    if (t.includes('comment') || t.includes('answer') || t.includes('react') || t.includes('forum')) return 'answer'
    return 'chat'
  }

  const filtered = notifications.filter((n) => {
    const vType = getVisualType(n)
    if (filterTab === 'unread') return !n.isRead
    if (filterTab === 'events') return vType === 'event'
    if (filterTab === 'jobs') return vType === 'job'
    return true
  })

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Trung tâm Thông báo</h1>
            {unreadCount > 0 && (
              <Badge className="bg-brand-primary text-white border-none font-bold text-xs px-2 py-0.5">
                {unreadCount} chưa đọc
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cập nhật về các tương tác bài viết, bình luận, tin nhắn và thông báo hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={() => void markAllAsRead()}
              variant="secondary"
              className="h-8 rounded-xl text-xs font-semibold"
            >
              <Check className="mr-1 h-3.5 w-3.5 text-brand-primary" /> Đánh dấu đã đọc
            </Button>
          )}

          {notifications.some((n) => n.isRead) && (
            <Button
              onClick={() => void deleteReadNotifications()}
              variant="ghost"
              className="h-8 rounded-xl text-xs text-slate-500 hover:text-rose-600"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Xóa đã đọc
            </Button>
          )}
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'unread', label: `Chưa đọc (${unreadCount})` },
          { id: 'events', label: 'Sự kiện & Workshop' },
          { id: 'jobs', label: 'Cơ hội & Việc làm' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id as typeof filterTab)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              filterTab === tab.id
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Notification List */}
      <div className="space-y-2.5">
        {isLoading ? (
          <Card className="p-12 text-center bg-white border-slate-200 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
            <span className="text-xs font-medium text-slate-500">Đang tải thông báo từ hệ thống...</span>
          </Card>
        ) : errorMessage ? (
          <Card className="p-8 text-center bg-white border-rose-200 space-y-3">
            <AlertCircle className="mx-auto h-7 w-7 text-rose-500" />
            <p className="text-xs font-medium text-rose-600">{errorMessage}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadNotifications()}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Thử lại
            </Button>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center bg-white border-slate-200">
            <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-500">Không có thông báo nào trong mục này.</p>
          </Card>
        ) : (
          filtered.map((item) => {
            const vType = getVisualType(item)
            return (
              <Card
                key={item.id}
                onClick={() => {
                  void markAsRead(item.id)
                  navigate(item.link || ROUTES.APP.HOME)
                }}
                className={`p-4 border transition-all cursor-pointer rounded-2xl flex items-start gap-3.5 ${
                  !item.isRead
                    ? 'border-brand-primary/20 bg-orange-50/30 hover:bg-orange-50/60 shadow-sm'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50/80 shadow-sm'
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    vType === 'answer'
                      ? 'bg-emerald-100 text-emerald-700'
                      : vType === 'event'
                      ? 'bg-orange-100 text-brand-primary'
                      : vType === 'job'
                      ? 'bg-blue-100 text-brand-secondary'
                      : vType === 'ai'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {vType === 'answer' && <CheckCircle2 className="h-5 w-5" />}
                  {vType === 'event' && <Calendar className="h-5 w-5" />}
                  {vType === 'job' && <Briefcase className="h-5 w-5" />}
                  {vType === 'ai' && <Sparkles className="h-5 w-5" />}
                  {vType === 'chat' && <MessageSquare className="h-5 w-5" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="pt-1 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary">
                      <span>Xem chi tiết</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                    <button
                      type="button"
                      onClick={(e) => void handleDeleteOne(e, item.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Xóa thông báo"
                      aria-label="Xóa thông báo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {!item.isRead && (
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-primary shrink-0 mt-1 shadow-sm" />
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
