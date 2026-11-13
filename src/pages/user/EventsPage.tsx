import { useState, useEffect, useCallback, type FC } from 'react'
import {
  IconCalendar,
  IconSearch,
  IconBuildingCommunity,
  IconLoader2,
  IconRefresh,
  IconCheck,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  opportunitiesService,
  type CommunityEventItem,
} from '@/services/opportunities'
import { EventCard } from '@/features/events'

type EventFilterTab = 'ALL' | 'UPCOMING' | 'MY_RSVPS'

export const EventsPage: FC = () => {
  const [events, setEvents] = useState<CommunityEventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampus, setSelectedCampus] = useState<string>('ALL')
  const [filterTab, setFilterTab] = useState<EventFilterTab>('ALL')

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await opportunitiesService.getEvents({
        pageSize: 50,
        campus: selectedCampus === 'ALL' ? undefined : selectedCampus,
        upcomingOnly: filterTab === 'UPCOMING',
      })
      setEvents(res?.items || [])
    } catch (err) {
      console.error('Failed to load events:', err)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedCampus, filterTab])

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  const campuses = [
    { value: 'ALL', label: 'Tất cả cơ sở' },
    { value: 'FU-HL', label: 'FU Hòa Lạc' },
    { value: 'FU-HCM', label: 'FU Hồ Chí Minh' },
    { value: 'FU-DN', label: 'FU Đà Nẵng' },
    { value: 'FU-CT', label: 'FU Cần Thơ' },
    { value: 'FU-QN', label: 'FU Quy Nhơn' },
  ]

  const filteredEvents = events.filter((evt) => {
    // Search query matching
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      evt.title.toLowerCase().includes(q) ||
      (evt.description || '').toLowerCase().includes(q) ||
      (evt.location || '').toLowerCase().includes(q) ||
      (evt.creatorName || '').toLowerCase().includes(q)

    // Filter tab
    if (filterTab === 'MY_RSVPS') {
      return matchesSearch && (evt.myStatus === 'Going' || evt.myStatus === 'Interested')
    }

    return matchesSearch
  })

  return (
    <div className="space-y-4">
      {/* 1. Unified Page Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <IconCalendar className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Sự kiện & Workshop FPT</h1>
              <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-primary">
                {events.length} sự kiện
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Khám phá các buổi hội thảo công nghệ, tọa đàm hướng nghiệp và networking cùng cựu sinh viên & chuyên gia doanh nghiệp.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Button
            variant="outline"
            onClick={() => void fetchEvents()}
            title="Làm mới danh sách sự kiện"
            aria-label="Làm mới"
            className="h-9 w-9 rounded-full border-slate-200/90 text-slate-600 hover:text-brand-primary hover:border-brand-primary/40 p-0 inline-flex items-center justify-center transition-colors"
          >
            <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin text-brand-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 2. Unified Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên sự kiện, chủ đề, diễn giả, địa điểm..."
            className="w-full h-8.5 rounded-xl border border-slate-200/90 bg-slate-50/70 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {/* Status Filter Tabs */}
          <div className="inline-flex h-8.5 items-center rounded-xl border border-slate-200/90 bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`h-7.5 rounded-lg px-3 text-xs transition-colors ${
                filterTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('UPCOMING')}
              className={`h-7.5 rounded-lg px-3 text-xs transition-colors ${
                filterTab === 'UPCOMING'
                  ? 'bg-brand-primary text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sắp diễn ra
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('MY_RSVPS')}
              className={`h-7.5 rounded-lg px-3 text-xs transition-colors flex items-center gap-1 ${
                filterTab === 'MY_RSVPS'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              <IconCheck className="h-3.5 w-3.5" />
              <span>Đã đăng ký</span>
            </button>
          </div>

          {/* Campus Filter */}
          <div className="inline-flex h-8.5 items-center gap-1 rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 text-xs text-slate-700">
            <IconBuildingCommunity className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              {campuses.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Events Cards Grid */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <IconLoader2 className="h-8 w-8 animate-spin text-brand-primary" />
          <p className="mt-2 text-xs text-slate-500">Đang tải danh sách sự kiện...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-slate-200 bg-white p-12 text-center shadow-xs space-y-2">
          <IconCalendar className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">Không tìm thấy sự kiện nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'Không có sự kiện nào khớp với từ khóa tìm kiếm. Vui lòng thử từ khóa khác.'
              : filterTab === 'MY_RSVPS'
              ? 'Bạn chưa đăng ký tham gia sự kiện nào. Hãy khám phá các sự kiện và nhấn Tham gia!'
              : 'Hiện chưa có sự kiện nào trong danh mục này.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} onRsvpSuccess={fetchEvents} />
          ))}
        </div>
      )}
    </div>
  )
}

export default EventsPage
