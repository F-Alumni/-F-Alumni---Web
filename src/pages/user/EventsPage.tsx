import { useState, useEffect, useCallback, type FC } from 'react'
import {
  IconCalendar,
  IconSearch,
  IconBuildingCommunity,
  IconLoader2,
  IconRefresh,
  IconCheck,
  IconPlus,
  IconStar,
  IconCrown,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  opportunitiesService,
  type CommunityEventItem,
} from '@/services/opportunities'
import { EventCard, CreateEventModal } from '@/features/events'
import { useAuthStore } from '@/stores/authStore'

export type EventFilterTab = 'ALL' | 'UPCOMING' | 'INTERESTED' | 'GOING' | 'CREATED'

export const EventsPage: FC = () => {
  const currentUser = useAuthStore((s) => s.currentUser)
  const [events, setEvents] = useState<CommunityEventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampus, setSelectedCampus] = useState<string>('ALL')
  const [filterTab, setFilterTab] = useState<EventFilterTab>('ALL')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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

  // Calculated counts for personal event tracking
  const interestedCount = events.filter((e) => e.myStatus === 'Interested').length
  const goingCount = events.filter((e) => e.myStatus === 'Going').length
  const createdCount = events.filter(
    (e) => currentUser?.id && e.creatorId === currentUser.id
  ).length

  const filteredEvents = events.filter((evt) => {
    // Search query matching
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      evt.title.toLowerCase().includes(q) ||
      (evt.description || '').toLowerCase().includes(q) ||
      (evt.location || '').toLowerCase().includes(q) ||
      (evt.creatorName || '').toLowerCase().includes(q)

    if (!matchesSearch) return false

    // Filter tab
    if (filterTab === 'INTERESTED') {
      return evt.myStatus === 'Interested'
    }
    if (filterTab === 'GOING') {
      return evt.myStatus === 'Going'
    }
    if (filterTab === 'CREATED') {
      return Boolean(currentUser?.id && evt.creatorId === currentUser.id)
    }

    return true
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
              Khám phá các buổi hội thảo công nghệ, tọa đàm hướng nghiệp và quản lý sự kiện bạn quan tâm & tham gia.
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

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <IconPlus className="h-4 w-4" />
            <span>Tạo sự kiện</span>
          </Button>
        </div>
      </div>

      {/* 2. Unified Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
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

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Status Filter Tabs (Personal Event Management) */}
          <div className="inline-flex h-8.5 items-center rounded-xl border border-slate-200/90 bg-slate-100 p-0.5 text-xs font-semibold">
            {/* All */}
            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`h-7.5 rounded-lg px-2.5 text-xs transition-colors cursor-pointer ${
                filterTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả
            </button>

            {/* Upcoming */}
            <button
              type="button"
              onClick={() => setFilterTab('UPCOMING')}
              className={`h-7.5 rounded-lg px-2.5 text-xs transition-colors cursor-pointer ${
                filterTab === 'UPCOMING'
                  ? 'bg-brand-primary text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sắp tới
            </button>

            {/* Interested Tab */}
            <button
              type="button"
              onClick={() => setFilterTab('INTERESTED')}
              className={`h-7.5 rounded-lg px-2.5 text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'INTERESTED'
                  ? 'bg-amber-500 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-amber-700'
              }`}
              title="Danh sách sự kiện bạn đã quan tâm"
            >
              <IconStar className="h-3.5 w-3.5" />
              <span>Đã quan tâm</span>
              {interestedCount > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    filterTab === 'INTERESTED'
                      ? 'bg-white/30 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {interestedCount}
                </span>
              )}
            </button>

            {/* Going Tab */}
            <button
              type="button"
              onClick={() => setFilterTab('GOING')}
              className={`h-7.5 rounded-lg px-2.5 text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'GOING'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-emerald-700'
              }`}
              title="Danh sách sự kiện bạn sẽ tham gia"
            >
              <IconCheck className="h-3.5 w-3.5" />
              <span>Sẽ tham gia</span>
              {goingCount > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    filterTab === 'GOING'
                      ? 'bg-white/30 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {goingCount}
                </span>
              )}
            </button>

            {/* Created by me tab (if user created any) */}
            {createdCount > 0 && (
              <button
                type="button"
                onClick={() => setFilterTab('CREATED')}
                className={`h-7.5 rounded-lg px-2.5 text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filterTab === 'CREATED'
                    ? 'bg-brand-secondary text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-brand-secondary'
                }`}
                title="Sự kiện do chính bạn tổ chức"
              >
                <IconCrown className="h-3.5 w-3.5" />
                <span>Tôi tổ chức</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    filterTab === 'CREATED'
                      ? 'bg-white/30 text-white'
                      : 'bg-blue-100 text-brand-secondary'
                  }`}
                >
                  {createdCount}
                </span>
              </button>
            )}
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
        <Card className="rounded-2xl border-dashed border-slate-200 bg-white p-12 text-center shadow-xs space-y-3">
          {filterTab === 'INTERESTED' ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                <IconStar className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Chưa có sự kiện nào trong danh sách quan tâm</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Khi bạn bấm nút <strong>"Quan tâm"</strong> trên bất kỳ sự kiện nào, sự kiện sẽ được lưu vào danh sách này để bạn tiện theo dõi, chuyển sang tham gia hoặc đồng bộ vào Google Calendar.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => setFilterTab('ALL')}
                  variant="outline"
                  className="h-8.5 px-4 rounded-xl border-slate-200 text-xs font-semibold hover:border-brand-primary hover:text-brand-primary"
                >
                  Khám phá sự kiện ngay
                </Button>
              </div>
            </>
          ) : filterTab === 'GOING' ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <IconCheck className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Bạn chưa đăng ký tham gia sự kiện nào</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Hãy khám phá các workshop và buổi tọa đàm sắp tới, sau đó nhấn <strong>"Tham gia"</strong> để nhận lời nhắc và kết nối cùng cộng đồng.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => setFilterTab('ALL')}
                  variant="outline"
                  className="h-8.5 px-4 rounded-xl border-slate-200 text-xs font-semibold hover:border-brand-primary hover:text-brand-primary"
                >
                  Khám phá sự kiện ngay
                </Button>
              </div>
            </>
          ) : filterTab === 'CREATED' ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand-secondary">
                <IconCrown className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Bạn chưa tổ chức sự kiện nào</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Bạn có thể tự tạo buổi chia sẻ công nghệ, workshop hướng nghiệp hoặc meetup cựu sinh viên bất cứ lúc nào.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-8.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <IconPlus className="h-4 w-4" />
                  <span>Tạo sự kiện ngay</span>
                </Button>
              </div>
            </>
          ) : (
            <>
              <IconCalendar className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">Không tìm thấy sự kiện nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Không có sự kiện nào khớp với từ khóa tìm kiếm. Vui lòng thử từ khóa khác.'
                  : 'Hiện chưa có sự kiện nào trong danh mục này. Bạn có thể là người đầu tiên tạo sự kiện mới!'}
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-9 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <IconPlus className="h-4 w-4" />
                  <span>Tạo sự kiện mới</span>
                </Button>
              </div>
            </>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} onRsvpSuccess={fetchEvents} />
          ))}
        </div>
      )}

      {/* 4. Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => void fetchEvents()}
      />
    </div>
  )
}

export default EventsPage
