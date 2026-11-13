import { useState, useEffect, useCallback, type FC } from 'react'
import { IconCalendar, IconLoader2, IconRefresh } from '@tabler/icons-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { opportunitiesService, type CommunityEventItem } from '@/services/opportunities'
import { EventCard } from './EventCard'

export const EventsSection: FC = () => {
  const [events, setEvents] = useState<CommunityEventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCampus, setSelectedCampus] = useState<string>('ALL')

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await opportunitiesService.getEvents({
        pageSize: 10,
        campus: selectedCampus === 'ALL' ? undefined : selectedCampus,
      })
      setEvents(res.items || [])
    } catch (err) {
      console.error('Failed to load events:', err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCampus])

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  const campuses = [
    { id: 'ALL', label: 'Tất cả cơ sở' },
    { id: 'FU-HCM', label: 'TP. Hồ Chí Minh' },
    { id: 'FU-HL', label: 'Hòa Lạc' },
    { id: 'FU-DN', label: 'Đà Nẵng' },
    { id: 'FU-CT', label: 'Cần Thơ' },
    { id: 'FU-QN', label: 'Quy Nhơn' },
  ]

  return (
    <div className="space-y-4">
      {/* Header & Campus Filters */}
      <Card className="border-slate-200/90 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <IconCalendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Sự Kiện & Workshop Cộng Đồng</h2>
              <p className="text-xs text-slate-500">Đăng ký tham gia networking cùng cựu sinh viên và doanh nghiệp</p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => void fetchEvents()}
            disabled={isLoading}
            className="h-8 gap-1.5 text-xs text-slate-600 hover:text-brand-primary"
          >
            <IconRefresh className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
        </div>

        {/* Campus Filter Pills */}
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
          {campuses.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCampus(c.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                selectedCampus === c.id
                  ? 'bg-brand-primary text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Events Stream */}
      {isLoading ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <IconLoader2 className="h-8 w-8 animate-spin text-brand-primary" />
          <p className="mt-2 text-xs text-slate-500">Đang tải danh sách sự kiện...</p>
        </div>
      ) : events.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-white/70 p-8 text-center shadow-xs">
          <IconCalendar className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-2 text-sm font-bold text-slate-700">Chưa có sự kiện nào sắp tới</h3>
          <p className="mt-1 text-xs text-slate-500">
            Các buổi Workshop và Alumni Meetup mới nhất sẽ được thông báo tại đây.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {events.map((evt) => (
            <EventCard key={evt.id} event={evt} onRsvpSuccess={fetchEvents} />
          ))}
        </div>
      )}
    </div>
  )
}
