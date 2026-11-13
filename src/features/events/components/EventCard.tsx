import { useState, type FC } from 'react'
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconCheck,
  IconStar,
  IconStarFilled,
  IconLoader2,
  IconShare,
  IconCalendarPlus,
  IconInfoCircle,
  IconTrash,
} from '@tabler/icons-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  opportunitiesService,
  type CommunityEventItem,
  type EventRsvpStatus,
} from '@/services/opportunities'
import { EventAttendeesModal } from './EventAttendeesModal'
import { EventDetailModal } from './EventDetailModal'
import { useAuthStore } from '@/stores/authStore'

interface EventCardProps {
  event: CommunityEventItem
  onRsvpSuccess?: () => void
}

const GRADIENT_PALETTES = [
  'from-slate-900 via-indigo-950 to-blue-900',
  'from-[#1B365D] via-[#0d3b66] to-[#F27024]',
  'from-teal-950 via-cyan-900 to-slate-900',
  'from-slate-950 via-purple-950 to-indigo-950',
]

function getEventGradient(key: string) {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i)
    hash |= 0
  }
  return GRADIENT_PALETTES[Math.abs(hash) % GRADIENT_PALETTES.length]
}

export const EventCard: FC<EventCardProps> = ({ event, onRsvpSuccess }) => {
  const currentUser = useAuthStore((s) => s.currentUser)
  const isCreator = Boolean(currentUser?.id && event.creatorId === currentUser.id)

  const [currentStatus, setCurrentStatus] = useState<string | null>(event.myStatus || null)
  const [goingCount, setGoingCount] = useState(event.goingCount || 0)
  const [interestedCount, setInterestedCount] = useState(event.interestedCount || 0)
  const [isRsvping, setIsRsvping] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleRsvp = async (newStatus: EventRsvpStatus) => {
    const targetStatus: EventRsvpStatus = currentStatus === newStatus ? 'NotGoing' : newStatus
    setIsRsvping(true)
    try {
      await opportunitiesService.rsvpEvent(event.id, targetStatus)
      if (currentStatus === 'Going') setGoingCount((prev) => Math.max(0, prev - 1))
      if (currentStatus === 'Interested') setInterestedCount((prev) => Math.max(0, prev - 1))
      if (targetStatus === 'Going') setGoingCount((prev) => prev + 1)
      if (targetStatus === 'Interested') setInterestedCount((prev) => prev + 1)
      setCurrentStatus(targetStatus === 'NotGoing' ? null : targetStatus)
      onRsvpSuccess?.()
    } catch (err) {
      console.error('RSVP failed:', err)
    } finally {
      setIsRsvping(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sự kiện "${event.title}" không?`)) {
      return
    }
    setIsDeleting(true)
    try {
      await opportunitiesService.deleteEvent(event.id)
      onRsvpSuccess?.()
    } catch (err) {
      console.error('Delete event failed:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // Date parsing
  const startDate = new Date(event.startTime)
  const dayNumber = startDate.getDate()
  const monthShort = `THG ${startDate.getMonth() + 1}`
  const weekdayShort = startDate.toLocaleDateString('vi-VN', { weekday: 'short' })
  const formattedTime = startDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Google Calendar URL
  const toGCalIso = (dateStr: string) => {
    try {
      return new Date(dateStr).toISOString().replace(/-|:|\.\d\d\d/g, '')
    } catch {
      return ''
    }
  }
  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${toGCalIso(event.startTime)}/${toGCalIso(
    event.endTime
  )}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(
    event.location
  )}`

  const hasCustomBanner = Boolean(event.bannerUrl && !imageError)
  const bgGradient = getEventGradient(event.id || event.title)

  return (
    <>
      <Card className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
        <div>
          {/* 1. Event Banner / Visual Header */}
          <div className="relative h-44 w-full overflow-hidden bg-slate-900 cursor-pointer" onClick={() => setIsDetailModalOpen(true)}>
            {hasCustomBanner ? (
              <img
                src={event.bannerUrl}
                alt=""
                onError={() => setImageError(true)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              /* Fallback: Deterministic Abstract Mesh Banner */
              <div className={`relative h-full w-full bg-gradient-to-br ${bgGradient} flex items-center justify-center overflow-hidden`}>
                <svg className="absolute inset-0 h-full w-full opacity-15" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id={`grid-${event.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#grid-${event.id})`} />
                </svg>

                <div className="relative flex flex-col items-center justify-center text-center p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-md mb-1.5 transition-transform group-hover:scale-110">
                    <IconCalendar className="h-5 w-5 text-brand-primary" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                    {event.campus && event.campus !== 'All' ? event.campus : 'FPT Alumni Connect'}
                  </span>
                </div>
              </div>
            )}

            {/* Subtle bottom gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

            {/* Badges on Banner */}
            <div className="absolute left-3 top-3 flex items-center gap-1.5">
              <span className="rounded-full bg-white/90 backdrop-blur-md border border-white/40 px-2.5 py-0.5 text-[11px] font-bold text-slate-800 shadow-xs">
                {event.campus && event.campus !== 'All' ? event.campus : 'Toàn quốc'}
              </span>
            </div>

            {/* Quick Actions on Banner */}
            <div className="absolute right-3 top-3 flex items-center gap-1.5">
              {isCreator && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-full bg-rose-600/80 hover:bg-rose-700 p-2 text-white shadow-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                  title="Xóa sự kiện của tôi"
                  aria-label="Xóa"
                >
                  {isDeleting ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> : <IconTrash className="h-3.5 w-3.5" />}
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShare()
                }}
                className="rounded-full bg-black/40 hover:bg-black/60 p-2 text-white shadow-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                title={isCopied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết'}
                aria-label="Chia sẻ"
              >
                {isCopied ? <IconCheck className="h-3.5 w-3.5 text-emerald-400" /> : <IconShare className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* 2. Event Info Body */}
          <div className="p-4 space-y-3">
            {/* Facebook / Lu.ma Style Date Leaf & Title Header */}
            <div className="flex items-start gap-3">
              {/* Date Leaf Badge */}
              <div className="flex flex-col items-center justify-center shrink-0 w-12 rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs bg-white text-center">
                <div className="w-full bg-brand-primary py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  {monthShort}
                </div>
                <div className="py-1 text-lg font-black text-slate-900 leading-none">
                  {dayNumber}
                </div>
              </div>

              {/* Title & Time */}
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-brand-primary tracking-wide">
                  {weekdayShort.toUpperCase()} • {formattedTime} (GMT+7)
                </div>
                <h3
                  onClick={() => setIsDetailModalOpen(true)}
                  className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug hover:text-brand-primary cursor-pointer transition-colors mt-0.5"
                  title={event.title}
                >
                  {event.title}
                </h3>
              </div>
            </div>

            {/* Host info */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-slate-400">Tổ chức bởi</span>
              <span className="font-semibold text-slate-700 line-clamp-1">
                {event.creatorName || 'Ban liên lạc Cựu sinh viên FPT'}
              </span>
            </div>

            {/* Description excerpt */}
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {event.description}
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
              <IconMapPin className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="line-clamp-1">{event.location}</span>
            </div>

            {/* Social Proof: Attendees & Capacity */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
              <button
                type="button"
                onClick={() => setIsAttendeesModalOpen(true)}
                className="flex items-center gap-2 text-xs text-slate-600 hover:text-brand-primary transition-colors cursor-pointer group"
              >
                {/* Overlapping avatar badges */}
                <div className="flex items-center -space-x-1.5">
                  <div className="h-5.5 w-5.5 rounded-full ring-2 ring-white bg-brand-primary/15 text-brand-primary text-[10px] font-bold flex items-center justify-center">
                    {event.creatorName?.charAt(0) || 'F'}
                  </div>
                  {goingCount > 0 ? (
                    <div className="h-5.5 w-5.5 rounded-full ring-2 ring-white bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center">
                      <IconCheck className="h-3 w-3" />
                    </div>
                  ) : (
                    <div className="h-5.5 w-5.5 rounded-full ring-2 ring-white bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center">
                      <IconUsers className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <span className="font-semibold text-slate-800 group-hover:text-brand-primary">
                  {goingCount} tham gia
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">{interestedCount} quan tâm</span>
              </button>

              {event.maxAttendees && (
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Tối đa {event.maxAttendees}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Action Buttons Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-3 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-1">
            {/* Going Button */}
            <Button
              size="sm"
              onClick={() => handleRsvp('Going')}
              disabled={isRsvping}
              title={
                currentStatus === 'Going'
                  ? 'Đã đăng ký tham gia (Bấm lại để hủy tham gia)'
                  : 'Đăng ký tham gia sự kiện'
              }
              aria-label={currentStatus === 'Going' ? 'Đã tham gia' : 'Tham gia'}
              className={`h-8.5 flex-1 gap-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                currentStatus === 'Going'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-0'
              }`}
            >
              {isRsvping && currentStatus === 'Going' ? (
                <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <IconCheck className="h-3.5 w-3.5" />
              )}
              <span>{currentStatus === 'Going' ? 'Đã tham gia' : 'Tham gia'}</span>
            </Button>

            {/* Interested Button */}
            <Button
              size="sm"
              onClick={() => handleRsvp('Interested')}
              disabled={isRsvping}
              title={
                currentStatus === 'Interested'
                  ? 'Đã quan tâm (Bấm lại để hủy quan tâm)'
                  : 'Lưu sự kiện vào danh sách quan tâm'
              }
              aria-label={currentStatus === 'Interested' ? 'Đã quan tâm' : 'Quan tâm'}
              className={`h-8.5 flex-1 gap-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                currentStatus === 'Interested'
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-0'
              }`}
            >
              {isRsvping && currentStatus === 'Interested' ? (
                <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
              ) : currentStatus === 'Interested' ? (
                <IconStarFilled className="h-3.5 w-3.5 text-amber-500" />
              ) : (
                <IconStar className="h-3.5 w-3.5" />
              )}
              <span>{currentStatus === 'Interested' ? 'Đã quan tâm' : 'Quan tâm'}</span>
            </Button>
          </div>

          {/* Quick Calendar & Detail Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={gCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8.5 w-8.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-brand-primary flex items-center justify-center transition-colors"
              title="Thêm vào Google Calendar"
            >
              <IconCalendarPlus className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={() => setIsDetailModalOpen(true)}
              className="h-8.5 w-8.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-brand-primary flex items-center justify-center transition-colors cursor-pointer"
              title="Xem thông tin chi tiết sự kiện"
              aria-label="Chi tiết"
            >
              <IconInfoCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Attendees Modal */}
      <EventAttendeesModal
        eventId={event.id}
        eventTitle={event.title}
        isOpen={isAttendeesModalOpen}
        onClose={() => setIsAttendeesModalOpen(false)}
      />

      {/* Full Event Detail Modal */}
      <EventDetailModal
        event={event}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRsvpChange={onRsvpSuccess}
      />
    </>
  )
}
