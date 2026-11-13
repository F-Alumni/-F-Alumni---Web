import { useState, type FC } from 'react'
import {
  IconCalendar,
  IconMapPin,
  IconUsers,
  IconCheck,
  IconStar,
  IconLoader2,
  IconShare,
} from '@tabler/icons-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  opportunitiesService,
  type CommunityEventItem,
  type EventRsvpStatus,
} from '@/services/opportunities'
import { EventAttendeesModal } from './EventAttendeesModal'
import { cn } from '@/lib/utils'

interface EventCardProps {
  event: CommunityEventItem
  onRsvpSuccess?: () => void
}

export const EventCard: FC<EventCardProps> = ({ event, onRsvpSuccess }) => {
  const [currentStatus, setCurrentStatus] = useState<string | null>(event.myStatus || null)
  const [goingCount, setGoingCount] = useState(event.goingCount || 0)
  const [interestedCount, setInterestedCount] = useState(event.interestedCount || 0)
  const [isRsvping, setIsRsvping] = useState(false)
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false)

  const handleRsvp = async (newStatus: EventRsvpStatus) => {
    // If clicking the same status, toggle to 'NotGoing'
    const targetStatus: EventRsvpStatus = currentStatus === newStatus ? 'NotGoing' : newStatus

    setIsRsvping(true)
    try {
      await opportunitiesService.rsvpEvent(event.id, targetStatus)

      // Optimistic count adjustment
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

  // Format date and time
  const startDate = new Date(event.startTime)
  const formattedDate = startDate.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
  const formattedTime = startDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <>
      <Card className="overflow-hidden border-slate-200/90 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
        {/* Event Banner */}
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-r from-brand-secondary to-[#004e8a]">
          {event.bannerUrl ? (
            <img
              src={event.bannerUrl}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/80">
              <IconCalendar className="h-12 w-12 text-white/40" />
            </div>
          )}

          {/* Badges on Banner */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <Badge className="bg-brand-primary/95 text-white shadow-sm text-[11px] font-bold">
              {event.campus || 'Toàn quốc'}
            </Badge>
          </div>

          <div className="absolute right-3 top-3">
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(window.location.href)
              }}
              className="rounded-full bg-slate-900/60 p-2 text-white shadow-sm backdrop-blur-xs transition-colors hover:bg-slate-900/80"
              title="Sao chép liên kết sự kiện"
            >
              <IconShare className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Event Info Body */}
        <div className="p-4.5 space-y-3">
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-xs font-bold text-brand-primary">
            <IconCalendar className="h-4 w-4 shrink-0" />
            <span>
              {formattedDate} • {formattedTime}
            </span>
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-brand-primary transition-colors line-clamp-2">
              {event.title}
            </h3>
            <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <IconMapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          {/* Attendees Summary */}
          <button
            type="button"
            onClick={() => setIsAttendeesModalOpen(true)}
            className="flex items-center gap-2 text-xs text-slate-600 hover:text-brand-secondary transition-colors"
          >
            <IconUsers className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-800">{goingCount} người sẽ tham gia</span>
            <span>•</span>
            <span className="text-slate-500">{interestedCount} quan tâm</span>
          </button>

          {/* RSVP Action Buttons */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              {/* Going Button */}
              <Button
                size="sm"
                variant={currentStatus === 'Going' ? 'default' : 'outline'}
                onClick={() => handleRsvp('Going')}
                disabled={isRsvping}
                title={currentStatus === 'Going' ? 'Đã đăng ký tham gia (Bấm để hủy)' : 'Đăng ký tham gia sự kiện'}
                aria-label={currentStatus === 'Going' ? 'Đã tham gia' : 'Tham gia'}
                className={cn(
                  'h-8.5 flex-1 gap-1.5 text-xs font-bold rounded-xl transition-all',
                  currentStatus === 'Going'
                    ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-xs ring-2 ring-brand-primary/20'
                    : 'border-slate-200 text-slate-700 hover:border-brand-primary hover:text-brand-primary'
                )}
              >
                {isRsvping && currentStatus === 'Going' ? (
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <IconCheck className="h-3.5 w-3.5" />
                )}
                <span>{currentStatus === 'Going' ? 'Đã RSVP' : 'Tham gia'}</span>
              </Button>

              {/* Interested Button */}
              <Button
                size="sm"
                variant={currentStatus === 'Interested' ? 'secondary' : 'outline'}
                onClick={() => handleRsvp('Interested')}
                disabled={isRsvping}
                title={currentStatus === 'Interested' ? 'Đã quan tâm (Bấm để hủy)' : 'Quan tâm sự kiện'}
                aria-label={currentStatus === 'Interested' ? 'Đã quan tâm' : 'Quan tâm'}
                className={cn(
                  'h-8.5 flex-1 gap-1.5 text-xs font-bold rounded-xl transition-all',
                  currentStatus === 'Interested'
                    ? 'bg-blue-100 text-brand-secondary border-blue-200 shadow-xs ring-2 ring-blue-200'
                    : 'border-slate-200 text-slate-700 hover:border-brand-secondary hover:text-brand-secondary'
                )}
              >
                {isRsvping && currentStatus === 'Interested' ? (
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <IconStar className={cn('h-3.5 w-3.5', currentStatus === 'Interested' && 'fill-current')} />
                )}
                <span>{currentStatus === 'Interested' ? 'Đã lưu' : 'Quan tâm'}</span>
              </Button>
            </div>
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
    </>
  )
}
