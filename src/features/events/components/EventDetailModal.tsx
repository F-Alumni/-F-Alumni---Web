import { useState, type FC } from 'react'
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
  IconCheck,
  IconStar,
  IconStarFilled,
  IconLoader2,
  IconX,
  IconCalendarPlus,
  IconShare,
  IconExternalLink,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  opportunitiesService,
  type CommunityEventItem,
  type EventRsvpStatus,
} from '@/services/opportunities'
import { EventAttendeesModal } from './EventAttendeesModal'

interface EventDetailModalProps {
  event: CommunityEventItem
  isOpen: boolean
  onClose: () => void
  onRsvpChange?: () => void
}

export const EventDetailModal: FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onRsvpChange,
}) => {
  const [currentStatus, setCurrentStatus] = useState<string | null>(event.myStatus || null)
  const [goingCount, setGoingCount] = useState(event.goingCount || 0)
  const [interestedCount, setInterestedCount] = useState(event.interestedCount || 0)
  const [isRsvping, setIsRsvping] = useState(false)
  const [isAttendeesOpen, setIsAttendeesOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

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
      onRsvpChange?.()
    } catch (err) {
      console.error('RSVP failed:', err)
    } finally {
      setIsRsvping(false)
    }
  }

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const startDate = new Date(event.startTime)
  const endDate = new Date(event.endTime)
  const formattedDate = startDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const formattedStartTime = startDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const formattedEndTime = endDate.toLocaleTimeString('vi-VN', {
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

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    event.location
  )}`

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col">
          {/* Header Banner */}
          <div className="relative h-48 sm:h-56 w-full overflow-hidden shrink-0 bg-gradient-to-br from-brand-secondary via-[#0a3871] to-[#F27024]">
            {event.bannerUrl && !imageError ? (
              <img
                src={event.bannerUrl}
                alt=""
                onError={() => setImageError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-center p-6 relative">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg mb-2">
                    <IconCalendar className="h-6 w-6 text-brand-primary" />
                  </div>
                  <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
                    {event.campus || 'FPT Alumni Connect'}
                  </span>
                </div>
              </div>
            )}

            {/* Banner Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

            {/* Badges on Banner */}
            <div className="absolute left-4 bottom-4 flex items-center gap-2">
              <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-900 shadow-sm backdrop-blur-xs">
                {event.campus || 'Toàn quốc'}
              </span>
              <span className="rounded-full bg-brand-primary px-3 py-1 text-xs font-bold text-white shadow-sm">
                Sự kiện FPT
              </span>
            </div>

            {/* Top action buttons */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="h-9 px-3 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 backdrop-blur-md border border-white/20 shadow-xs flex items-center gap-1.5 text-xs font-semibold transition-colors"
                title="Sao chép liên kết sự kiện"
              >
                {copied ? <IconCheck className="h-4 w-4 text-emerald-400" /> : <IconShare className="h-4 w-4" />}
                <span>{copied ? 'Đã chép link' : 'Chia sẻ'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 backdrop-blur-md border border-white/20 shadow-xs flex items-center justify-center transition-colors"
                title="Đóng chi tiết"
                aria-label="Đóng"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Body Content */}
          <div className="overflow-y-auto p-6 space-y-5 flex-1">
            {/* Title & Organizer */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {event.title}
              </h2>
              <div className="mt-2.5 flex items-center gap-2.5 text-xs text-slate-600">
                <div className="h-7 w-7 rounded-full bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
                  {event.creatorName ? event.creatorName.charAt(0).toUpperCase() : 'F'}
                </div>
                <span>
                  Được tổ chức bởi{' '}
                  <strong className="text-slate-800">
                    {event.creatorName || 'Ban liên lạc Cựu sinh viên FPT'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Time & Venue Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                  <IconClock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Thời gian
                  </div>
                  <div className="text-xs font-bold text-slate-900 capitalize mt-0.5">
                    {formattedDate}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {formattedStartTime} - {formattedEndTime} (GMT+7)
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  <IconMapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Địa điểm
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-2">
                    {event.location}
                  </div>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-secondary hover:underline mt-1"
                  >
                    <span>Mở bản đồ</span>
                    <IconExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Giới thiệu sự kiện
              </h3>
              <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line shadow-2xs">
                {event.description}
              </div>
            </div>

            {/* Attendees and Capacity */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-2">
                  <div className="h-8 w-8 rounded-full ring-2 ring-white bg-brand-primary text-white text-xs font-bold flex items-center justify-center">
                    {event.creatorName ? event.creatorName.charAt(0).toUpperCase() : 'F'}
                  </div>
                  <div className="h-8 w-8 rounded-full ring-2 ring-white bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    <IconCheck className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {goingCount} người sẽ tham gia • {interestedCount} người quan tâm
                  </div>
                  {event.maxAttendees && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Giới hạn tối đa {event.maxAttendees} người tham dự
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAttendeesOpen(true)}
                className="h-8 rounded-xl border-slate-200 text-slate-700 hover:text-brand-primary text-xs font-semibold shrink-0"
              >
                <IconUsers className="h-3.5 w-3.5 mr-1" />
                <span>Xem danh sách tham gia</span>
              </Button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <a
              href={gCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              <IconCalendarPlus className="h-4 w-4 text-brand-primary" />
              <span>Thêm vào Google Calendar</span>
            </a>

            <div className="flex items-center gap-2">
              {/* Interested */}
              <Button
                size="sm"
                variant={currentStatus === 'Interested' ? 'secondary' : 'outline'}
                onClick={() => handleRsvp('Interested')}
                disabled={isRsvping}
                className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${
                  currentStatus === 'Interested'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 shadow-xs'
                    : 'border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                {isRsvping && currentStatus === 'Interested' ? (
                  <IconLoader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : currentStatus === 'Interested' ? (
                  <IconStarFilled className="h-4 w-4 mr-1.5 text-amber-500" />
                ) : (
                  <IconStar className="h-4 w-4 mr-1.5" />
                )}
                <span>{currentStatus === 'Interested' ? 'Đã quan tâm' : 'Quan tâm'}</span>
              </Button>

              {/* Going */}
              <Button
                size="sm"
                onClick={() => handleRsvp('Going')}
                disabled={isRsvping}
                className={`h-9 px-5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  currentStatus === 'Going'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                }`}
              >
                {isRsvping && currentStatus === 'Going' ? (
                  <IconLoader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <IconCheck className="h-4 w-4 mr-1.5" />
                )}
                <span>{currentStatus === 'Going' ? 'Đã tham gia' : 'Tham gia'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <EventAttendeesModal
        eventId={event.id}
        eventTitle={event.title}
        isOpen={isAttendeesOpen}
        onClose={() => setIsAttendeesOpen(false)}
      />
    </>
  )
}
