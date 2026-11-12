import { useState, type FC } from 'react'
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
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'answer' | 'event' | 'job' | 'ai' | 'chat'
  createdAt: string
  isRead: boolean
  link: string
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Câu trả lời được chấp nhận làm Best Answer',
    message: 'Nguyễn Văn A (Alumni K14) đã chấp nhận câu trả lời của bạn trong chủ đề "Kinh nghiệm phỏng vấn vị trí Backend Engineer FPT Software". Bạn nhận được +15 Alumni Coins!',
    type: 'answer',
    createdAt: '15 phút trước',
    isRead: false,
    link: ROUTES.APP.HOME,
  },
  {
    id: 'notif-2',
    title: 'Nhắc nhở sự kiện: FPT AI & Cloud Career Day 2026',
    message: 'Hội thảo công nghệ & phỏng vấn trực tiếp sẽ diễn ra vào 09:00 sáng mai tại Hội trường Trống Đồng - Campus Hòa Lạc. Vé tham dự của bạn đã được xác nhận.',
    type: 'event',
    createdAt: '2 giờ trước',
    isRead: false,
    link: ROUTES.APP.JOBS,
  },
  {
    id: 'notif-3',
    title: 'Cơ hội thực tập OJT phù hợp với hồ sơ',
    message: 'FPT Telecom vừa đăng tuyển vị trí "DevOps Engineer Intern" dành riêng cho sinh viên kỳ 5-7. Xem thông tin chi tiết và nộp hồ sơ kết nối cựu sinh viên ngay.',
    type: 'job',
    createdAt: '5 giờ trước',
    isRead: false,
    link: ROUTES.APP.INTERNSHIPS,
  },
  {
    id: 'notif-4',
    title: 'FPT AI Assistant cập nhật cơ sở tri thức',
    message: 'Trợ lý AI đã hoàn tất lập chỉ mục cho bộ tài liệu "Hướng dẫn Capstone và Biểu mẫu OJT kỳ Spring 2026". Hãy thử đặt câu hỏi với trợ lý.',
    type: 'ai',
    createdAt: '1 ngày trước',
    isRead: true,
    link: `${ROUTES.APP.HOME}?ai=open`,
  },
  {
    id: 'notif-5',
    title: 'Tin nhắn mới từ Mentor Cựu sinh viên',
    message: 'Trần Hoài Nam (K14) đã phản hồi lời mời kết nối của bạn trong kênh Thảo luận trực tiếp Mentorship.',
    type: 'chat',
    createdAt: '2 ngày trước',
    isRead: true,
    link: ROUTES.APP.CHAT,
  },
]

export const NotificationsPage: FC = () => {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'events' | 'jobs'>('all')

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const deleteReadNotifications = () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead))
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const filtered = notifications.filter((n) => {
    if (filterTab === 'unread') return !n.isRead
    if (filterTab === 'events') return n.type === 'event'
    if (filterTab === 'jobs') return n.type === 'job'
    return true
  })

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
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
            Cập nhật về các tương tác bài viết, sự kiện đã RSVP, tin nhắn mentor và cơ hội việc làm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="secondary"
              className="h-8 rounded-xl text-xs font-semibold"
            >
              <Check className="mr-1 h-3.5 w-3.5 text-brand-primary" /> Đánh dấu đã đọc
            </Button>
          )}

          <Button
            onClick={deleteReadNotifications}
            variant="ghost"
            className="h-8 rounded-xl text-xs text-slate-500 hover:text-rose-600"
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Dọn dẹp
          </Button>
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs">
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
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Notification List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <Card className="p-12 text-center bg-white border-slate-200">
            <Bell className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-500">Không có thông báo nào trong mục này.</p>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              onClick={() => {
                markAsRead(item.id)
                navigate(item.link)
              }}
              className={`p-4 border transition-all cursor-pointer rounded-2xl flex items-start gap-3.5 ${
                !item.isRead
                  ? 'border-brand-primary/20 bg-orange-50/30 hover:bg-orange-50/60 shadow-xs'
                  : 'border-slate-200/80 bg-white hover:bg-slate-50/80 shadow-xs'
              }`}
            >
              {/* Type Icon */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  item.type === 'answer'
                    ? 'bg-emerald-100 text-emerald-700'
                    : item.type === 'event'
                    ? 'bg-orange-100 text-brand-primary'
                    : item.type === 'job'
                    ? 'bg-blue-100 text-brand-secondary'
                    : item.type === 'ai'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.type === 'answer' && <CheckCircle2 className="h-5 w-5" />}
                {item.type === 'event' && <Calendar className="h-5 w-5" />}
                {item.type === 'job' && <Briefcase className="h-5 w-5" />}
                {item.type === 'ai' && <Sparkles className="h-5 w-5" />}
                {item.type === 'chat' && <MessageSquare className="h-5 w-5" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.createdAt}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.message}
                </p>

                <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-brand-primary">
                  <span>Xem chi tiết</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>

              {/* Unread Dot */}
              {!item.isRead && (
                <span className="h-2.5 w-2.5 rounded-full bg-brand-primary shrink-0 mt-1 shadow-xs" />
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
