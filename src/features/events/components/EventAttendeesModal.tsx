import { useState, useEffect, type FC } from 'react'
import { IconX, IconUsers, IconLoader2, IconCheck, IconStar } from '@tabler/icons-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { opportunitiesService, type EventAttendeeItem } from '@/services/opportunities'

interface EventAttendeesModalProps {
  eventId: string
  eventTitle: string
  isOpen: boolean
  onClose: () => void
}

export const EventAttendeesModal: FC<EventAttendeesModalProps> = ({
  eventId,
  eventTitle,
  isOpen,
  onClose,
}) => {
  const [attendees, setAttendees] = useState<EventAttendeeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !eventId) return

    let isMounted = true
    setIsLoading(true)

    opportunitiesService
      .getAttendees(eventId)
      .then((data) => {
        if (isMounted) setAttendees(data)
      })
      .catch((err) => {
        console.error('Failed to load attendees:', err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [eventId, isOpen])

  if (!isOpen) return null

  const goingAttendees = attendees.filter((a) => a.status === 'Going')
  const interestedAttendees = attendees.filter((a) => a.status === 'Interested')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <IconUsers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Danh sách người tham dự</h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">{eventTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <IconLoader2 className="h-6 w-6 animate-spin text-brand-primary mb-2" />
              <p className="text-xs">Đang tải danh sách...</p>
            </div>
          ) : attendees.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Chưa có người tham gia sự kiện này. Hãy là người đầu tiên đăng ký!
            </div>
          ) : (
            <>
              {/* Going section */}
              {goingAttendees.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2">
                    <IconCheck className="h-3.5 w-3.5" />
                    Sẽ tham gia ({goingAttendees.length})
                  </h4>
                  <div className="space-y-2">
                    {goingAttendees.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={att.avatarUrl}
                            fallback={att.fullName.slice(0, 2).toUpperCase()}
                            className="h-8 w-8"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{att.fullName}</p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(att.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px] border-emerald-200">
                          Going
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interested section */}
              {interestedAttendees.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-xs font-bold text-blue-700 mb-2">
                    <IconStar className="h-3.5 w-3.5" />
                    Quan tâm ({interestedAttendees.length})
                  </h4>
                  <div className="space-y-2">
                    {interestedAttendees.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={att.avatarUrl}
                            fallback={att.fullName.slice(0, 2).toUpperCase()}
                            className="h-8 w-8"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{att.fullName}</p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(att.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 text-[10px] border-blue-200">
                          Interested
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-5 py-3 text-right bg-slate-50">
          <Button size="sm" variant="outline" onClick={onClose} className="h-8 text-xs">
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
