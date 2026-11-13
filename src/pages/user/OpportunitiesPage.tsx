import { useState, useEffect, useCallback, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Layers,
  Award,
  Calendar,
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  MessageCircle,
  Users,
  Loader2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Modal } from '@/components/ui/dialog'
import {
  opportunitiesService,
  type CommunityEventItem,
} from '@/services/opportunities'
import { postsService, type ForumPostItem } from '@/services/posts'
import { chatService } from '@/services/chat'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'
import { FPT_CAMPUSES, formatCampusLabel, normalizeCampusCode } from '@/constants/campuses'

export type OpportunityTab = 'all' | 'jobs' | 'internships' | 'scholarships' | 'events'

interface OpportunityItem {
  id: string
  authorId: string
  title: string
  company: string
  type: 'job' | 'internship' | 'scholarship'
  campus: string
  tags: string[]
  description: string
  createdAtLabel: string
  alumniContact: {
    name: string
    avatar: string
    title: string
  }
}

function mapRecruitmentPostToOpportunity(post: ForumPostItem): OpportunityItem {
  const lowerTitle = (post.title || '').toLowerCase()
  const lowerContent = (post.content || '').toLowerCase()
  let type: 'job' | 'internship' | 'scholarship' = 'job'
  if (lowerTitle.includes('intern') || lowerTitle.includes('ojt') || lowerTitle.includes('thực tập') || lowerContent.includes('thực tập')) {
    type = 'internship'
  } else if (lowerTitle.includes('học bổng') || lowerTitle.includes('scholarship') || lowerContent.includes('học bổng')) {
    type = 'scholarship'
  }

  return {
    id: post.id,
    authorId: post.authorId,
    title: post.title,
    company: post.major ? `Khoa ${post.major} • FPT Alumni Partner` : 'FPT Alumni Network',
    type,
    campus: post.campus || 'All',
    tags: post.tags && post.tags.length > 0 ? post.tags : [post.major || 'FPTU', post.postType || 'Recruitment'],
    description: post.content,
    createdAtLabel: new Date(post.createdAt).toLocaleDateString('vi-VN'),
    alumniContact: {
      name: post.authorName || 'FPT Alumni',
      avatar: post.authorAvatarUrl || '',
      title: `Alumni • ${post.major || 'FPTU'}`,
    },
  }
}

interface OpportunitiesPageProps {
  defaultTab?: OpportunityTab
}

export const OpportunitiesPage: FC<OpportunitiesPageProps> = ({ defaultTab = 'all' }) => {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<OpportunityTab>(defaultTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampus, setSelectedCampus] = useState('All')
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([])
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [events, setEvents] = useState<CommunityEventItem[]>([])
  const [rsvpStatusMap, setRsvpStatusMap] = useState<Record<string, string>>({})
  const [selectedContactOpp, setSelectedContactOpp] = useState<OpportunityItem | null>(null)
  const [introMessage, setIntroMessage] = useState('')
  const [isSendingIntro, setIsSendingIntro] = useState(false)
  const [contactError, setContactError] = useState<string | null>(null)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  const fetchAllData = useCallback(async () => {
    setIsLoadingOpportunities(true)
    setErrorMessage(null)
    try {
      const [postsRes, eventsRes] = await Promise.all([
        postsService.getPosts({ postType: 'Recruitment', pageSize: 30 }),
        opportunitiesService.getEvents({ upcomingOnly: true, pageSize: 15 }),
      ])
      setOpportunities((postsRes.items || []).map(mapRecruitmentPostToOpportunity))

      const eventList = eventsRes.items || []
      setEvents(eventList)
      const statusObj: Record<string, string> = {}
      eventList.forEach((e) => {
        if (e.myStatus) statusObj[e.id] = e.myStatus
      })
      setRsvpStatusMap(statusObj)
    } catch (err) {
      console.error('Failed to load opportunities & events:', err)
      setErrorMessage('Không thể tải dữ liệu cơ hội nghề nghiệp và sự kiện.')
    } finally {
      setIsLoadingOpportunities(false)
    }
  }, [])

  useEffect(() => {
    void fetchAllData()
  }, [fetchAllData])

  const handleRsvp = async (eventId: string, status: 'Going' | 'Interested') => {
    const prevStatus = rsvpStatusMap[eventId]
    try {
      await opportunitiesService.rsvpEvent(eventId, status)
      setRsvpStatusMap((prev) => ({ ...prev, [eventId]: status }))
      setEvents((prev) =>
        prev.map((ev) => {
          if (ev.id !== eventId) return ev
          const delta = status === 'Going' && prevStatus !== 'Going' ? 1 : status !== 'Going' && prevStatus === 'Going' ? -1 : 0
          return { ...ev, goingCount: Math.max(0, (ev.goingCount || 0) + delta) }
        })
      )
    } catch (err) {
      console.error('Failed to RSVP event:', err)
    }
  }

  const openContactModal = (opp: OpportunityItem) => {
    setSelectedContactOpp(opp)
    setContactError(null)
    setIntroMessage(
      `Chào ${opp.alumniContact.name}, em là ${currentUser?.name || 'thành viên FPTU'}, em quan tâm đến cơ hội "${opp.title}" và muốn trao đổi thêm thông tin ạ.`
    )
  }

  const handleSendDirectMessage = async () => {
    if (!selectedContactOpp) return
    if (!selectedContactOpp.authorId || selectedContactOpp.authorId === currentUser?.id) {
      navigate(`/app/posts/${selectedContactOpp.id}`)
      return
    }

    setIsSendingIntro(true)
    setContactError(null)
    try {
      const room = await chatService.createDirectRoom({
        targetUserId: selectedContactOpp.authorId,
        targetUserName: selectedContactOpp.alumniContact.name,
      })
      if (introMessage.trim()) {
        await chatService.sendMessage(room.roomId, {
          content: introMessage.trim(),
          messageType: 'Text',
        })
      }
      setSelectedContactOpp(null)
      navigate(`${ROUTES.APP.CHAT}?roomId=${room.roomId}`)
    } catch (err) {
      console.error('Failed to start recruiter chat:', err)
      setContactError('Không thể tạo cuộc trò chuyện trực tiếp. Bạn có thể xem bài viết và bình luận.')
    } finally {
      setIsSendingIntro(false)
    }
  }

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'jobs' && opp.type === 'job') ||
      (activeTab === 'internships' && opp.type === 'internship') ||
      (activeTab === 'scholarships' && opp.type === 'scholarship')

    const matchesSearch =
      !searchQuery ||
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCampus =
      selectedCampus === 'All' ||
      opp.campus === 'All' ||
      normalizeCampusCode(opp.campus) === normalizeCampusCode(selectedCampus)

    return matchesTab && matchesSearch && matchesCampus
  })

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-primary p-6 text-white shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2">
          <Badge className="bg-brand-primary text-white border-none font-bold px-2.5 py-0.5 text-xs">
            Cơ hội nghề nghiệp & Phát triển
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Cơ hội Việc làm, OJT & Học bổng FPT
          </h1>
          <p className="text-xs text-slate-200 leading-relaxed sm:text-sm">
            Kết nối trực tiếp giữa Doanh nghiệp, Cựu sinh viên (Alumni) và Sinh viên trường ĐH FPT.
          </p>
        </div>
      </div>

      {/* 2. Tabs & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'all', label: 'Tất cả cơ hội', icon: Briefcase },
            { id: 'jobs', label: 'Việc làm', icon: Briefcase },
            { id: 'internships', label: 'Thực tập OJT', icon: Layers },
            { id: 'scholarships', label: 'Học bổng', icon: Award },
            { id: 'events', label: 'Sự kiện & Workshop', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as OpportunityTab)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm việc, công ty, kỹ năng..."
              className="h-8 w-full rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/40"
            />
          </div>

          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            aria-label="Lọc theo Campus"
            className="h-8 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="All">Tất cả Campus</option>
            {FPT_CAMPUSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Tab Content */}
      {isLoadingOpportunities ? (
        <Card className="p-12 text-center bg-white border-slate-200 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
          <span className="text-xs font-medium text-slate-500">Đang tải cơ hội nghề nghiệp & sự kiện...</span>
        </Card>
      ) : errorMessage ? (
        <Card className="p-8 text-center bg-white border-rose-200 space-y-3">
          <AlertCircle className="mx-auto h-7 w-7 text-rose-500" />
          <p className="text-xs font-medium text-rose-600">{errorMessage}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void fetchAllData()} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </Button>
        </Card>
      ) : activeTab === 'events' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-primary" />
              Sự kiện, Workshop & Hội thảo nghề nghiệp sắp diễn ra
            </h2>
            <span className="text-xs text-slate-400 font-medium">{events.length} sự kiện</span>
          </div>

          {events.length === 0 && (
            <Card className="p-8 text-center bg-white border-slate-200">
              <p className="text-xs text-slate-500">Hiện chưa có sự kiện nào sắp diễn ra.</p>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4">
            {events.map((ev) => {
              const myRsvp = rsvpStatusMap[ev.id]
              return (
                <Card key={ev.id} className="overflow-hidden border-slate-200/90 bg-white shadow-sm p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-brand-primary/10 text-brand-primary font-bold text-[11px] px-2 py-0.5">
                          {formatCampusLabel(ev.campus) || 'ĐH FPT'}
                        </Badge>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(ev.startTime).toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {ev.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {ev.location}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Users className="h-3.5 w-3.5 text-brand-secondary" />
                          {ev.goingCount} người tham gia
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center gap-2 shrink-0 w-full sm:w-36">
                      <Button
                        onClick={() => void handleRsvp(ev.id, 'Going')}
                        className={`w-full text-xs font-bold h-9 rounded-xl transition-all ${
                          myRsvp === 'Going'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            : 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                        }`}
                      >
                        {myRsvp === 'Going' ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Đã đăng ký
                          </span>
                        ) : (
                          'Tham gia (RSVP)'
                        )}
                      </Button>

                      <Button
                        onClick={() => void handleRsvp(ev.id, 'Interested')}
                        variant="secondary"
                        className={`w-full text-xs font-semibold h-8 rounded-xl ${
                          myRsvp === 'Interested' ? 'bg-amber-100 text-amber-800' : ''
                        }`}
                      >
                        {myRsvp === 'Interested' ? '★ Đã quan tâm' : '☆ Quan tâm'}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-brand-primary" />
              {activeTab === 'jobs' && 'Danh sách Việc làm từ Cựu sinh viên & Đối tác'}
              {activeTab === 'internships' && 'Cơ hội Thực tập OJT (Kỳ 5 - Kỳ 7)'}
              {activeTab === 'scholarships' && 'Học bổng & Quỹ hỗ trợ nghiên cứu ĐH FPT'}
              {activeTab === 'all' && 'Tất cả Cơ hội Việc làm & Thực tập'}
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {filteredOpportunities.length} cơ hội
            </span>
          </div>

          {filteredOpportunities.length === 0 && (
            <Card className="p-10 text-center bg-white border-slate-200">
              <p className="text-xs text-slate-500">Không tìm thấy cơ hội phù hợp với bộ lọc.</p>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-3.5">
            {filteredOpportunities.map((opp) => (
              <Card
                key={opp.id}
                className="overflow-hidden border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm hover:border-brand-primary/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={opp.alumniContact.avatar}
                        fallback={opp.alumniContact.name.slice(0, 2).toUpperCase()}
                        size="md"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{opp.company}</span>
                          <Badge
                            className={`text-[10px] font-bold px-2 py-0.5 border-none ${
                              opp.type === 'job'
                                ? 'bg-blue-50 text-blue-700'
                                : opp.type === 'internship'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}
                          >
                            {opp.type === 'job'
                              ? 'Full-time'
                              : opp.type === 'internship'
                              ? 'OJT Intern'
                              : 'Học bổng'}
                          </Badge>
                        </div>
                        <h3
                          onClick={() => navigate(`/app/posts/${opp.id}`)}
                          className="cursor-pointer text-base font-bold text-slate-900 mt-0.5 hover:text-brand-primary transition-colors"
                        >
                          {opp.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 whitespace-pre-line">
                      {opp.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {opp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {opp.campus === 'All' ? 'Toàn quốc' : formatCampusLabel(opp.campus)}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        Đăng ngày: {opp.createdAtLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-stretch justify-between gap-2 shrink-0 w-full sm:w-44 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={opp.alumniContact.avatar}
                        fallback={opp.alumniContact.name.slice(0, 2).toUpperCase()}
                        size="sm"
                        isVerified
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {opp.alumniContact.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {opp.alumniContact.title}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => openContactModal(opp)}
                      className="w-full text-xs font-bold h-9 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white shadow-sm gap-1.5"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Kết nối người đăng</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate(`/app/posts/${opp.id}`)}
                      className="w-full text-xs font-semibold h-8 rounded-xl gap-1"
                    >
                      <span>Xem chi tiết</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Direct Recruiter Chat Modal */}
      <Modal
        isOpen={Boolean(selectedContactOpp)}
        onClose={() => setSelectedContactOpp(null)}
        title="Nhắn tin cho người đăng cơ hội"
        description={selectedContactOpp?.title}
      >
        {selectedContactOpp && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Thông tin liên hệ:</p>
              <p>• Người đăng: <span className="font-medium text-slate-900">{selectedContactOpp.alumniContact.name}</span></p>
              <p>• Email của bạn: <span className="font-medium text-slate-900">{currentUser?.email}</span></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tin nhắn mở đầu:
              </label>
              <textarea
                rows={3}
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            {contactError && (
              <p className="text-xs font-medium text-rose-600">{contactError}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelectedContactOpp(null)} className="text-xs rounded-xl">
                Hủy
              </Button>
              <Button
                onClick={() => void handleSendDirectMessage()}
                disabled={isSendingIntro}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl gap-1.5"
              >
                {isSendingIntro && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Gửi tin nhắn & Mở Chat</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
