import { useState, useEffect, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconTrendingUp,
  IconClock,
  IconSparkles,
  IconCircleCheck,
  IconChevronRight,
  IconLoader2,
  IconMessageCircle,
  IconCalendar,
  IconCheck,
} from '@tabler/icons-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { aiService, type MentorItem } from '@/services/ai'
import { chatService } from '@/services/chat'
import {
  opportunitiesService,
  type CommunityEventItem,
  type EventRsvpStatus,
} from '@/services/opportunities'
import { useAuthStore } from '@/stores/authStore'

interface DisplayMentor {
  id: string
  userId?: string
  name: string
  role: string
  major: string
  avatar: string
  isVerified: boolean
  matchScore?: number
  mentorship: boolean
}

export const RightSidebar: FC = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()

  const [mentors, setMentors] = useState<DisplayMentor[]>([])
  const [isLoadingMentors, setIsLoadingMentors] = useState(true)
  const [connectingId, setConnectingId] = useState<string | null>(null)

  const [events, setEvents] = useState<CommunityEventItem[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [rsvpingEventId, setRsvpingEventId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadAiMentors = async () => {
      setIsLoadingMentors(true)
      try {
        const data = await aiService.recommendMentors({
          major: currentUser?.department || 'SE',
          targetSkills: [],
        })

        if (isMounted && data && data.length > 0) {
          const mapped: DisplayMentor[] = data.slice(0, 4).map((m: MentorItem) => ({
            id: m.id,
            userId: m.userId,
            name: m.fullName,
            role: m.jobTitle ? `${m.jobTitle} @ ${m.currentCompany}` : m.skills || 'Alumni Mentor',
            major: `Khoa ${m.major || 'CNTT'}`,
            avatar: m.avatarUrl || '',
            isVerified: true,
            matchScore: m.matchScore,
            mentorship: true,
          }))
          setMentors(mapped)
          return
        }
      } catch (err) {
        console.warn('AI Mentor recommendation API unavailable:', err)
      } finally {
        if (isMounted) setIsLoadingMentors(false)
      }

      if (isMounted) {
        setMentors([])
      }
    }

    loadAiMentors()
    return () => {
      isMounted = false
    }
  }, [currentUser?.department])

  const handleConnect = async (alum: DisplayMentor) => {
    if (!alum.userId) {
      navigate(ROUTES.APP.CHAT)
      return
    }

    setConnectingId(alum.id)
    try {
      await chatService.createDirectRoom({
        targetUserId: alum.userId,
        targetUserName: alum.name,
      })
      navigate(ROUTES.APP.CHAT)
    } catch (err) {
      console.warn('Failed to start chat with mentor:', err)
      navigate(ROUTES.APP.CHAT)
    } finally {
      setConnectingId(null)
    }
  }

  // Load real upcoming events from Backend
  useEffect(() => {
    let isMounted = true
    const loadEvents = async () => {
      setIsLoadingEvents(true)
      try {
        const res = await opportunitiesService.getEvents({ pageSize: 3, upcomingOnly: true })
        if (isMounted && res.items && res.items.length > 0) {
          setEvents(res.items)
        }
      } catch (err) {
        console.warn('Failed to fetch events for sidebar:', err)
      } finally {
        if (isMounted) setIsLoadingEvents(false)
      }
    }
    void loadEvents()
    return () => {
      isMounted = false
    }
  }, [])

  const handleRsvpInSidebar = async (eventId: string, status: EventRsvpStatus) => {
    setRsvpingEventId(eventId)
    try {
      await opportunitiesService.rsvpEvent(eventId, status)
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                myStatus: e.myStatus === status ? null : status,
                goingCount:
                  status === 'Going'
                    ? e.myStatus === 'Going'
                      ? Math.max(0, e.goingCount - 1)
                      : e.goingCount + 1
                    : e.goingCount,
              }
            : e
        )
      )
    } catch (err) {
      console.error('RSVP from sidebar failed:', err)
    } finally {
      setRsvpingEventId(null)
    }
  }

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])

  useEffect(() => {
    let isMounted = true
    import('@/services/communities')
      .then(({ communitiesService }) => communitiesService.getCategories())
      .then((res) => {
        if (isMounted && Array.isArray(res)) {
          setCategories(res)
        }
      })
      .catch(() => {
        if (isMounted) setCategories([])
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <aside className="w-full space-y-4">
      {/* 1. Recommended Alumni / AI Mentors Widget */}
      <Card className="border-slate-200/90 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <IconSparkles className="h-4 w-4 text-brand-primary animate-pulse" />
            <span>AI Mentor Gợi ý</span>
          </CardTitle>
          <Link
            to={ROUTES.APP.ALUMNI}
            title="Xem tất cả danh bạ mentor"
            aria-label="Xem tất cả"
            className="text-slate-400 hover:text-brand-primary p-1 rounded-full transition-colors"
          >
            <IconChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {isLoadingMentors ? (
            <div className="flex h-24 items-center justify-center">
              <IconLoader2 className="h-5 w-5 animate-spin text-brand-primary" />
              <span className="ml-2 text-xs text-slate-400">Đang gợi ý mentor...</span>
            </div>
          ) : mentors.length === 0 ? (
            <p className="py-3 text-center text-xs text-slate-400">
              Chưa có dữ liệu gợi ý Mentor từ AI Service.
            </p>
          ) : (
            mentors.map((alum) => (
              <div key={alum.id} className="flex items-start justify-between gap-2.5">
                <div className="flex min-w-0 items-start gap-2.5">
                  <Avatar
                    src={alum.avatar}
                    fallback={alum.name.slice(0, 2).toUpperCase()}
                    size="md"
                    isVerified={alum.isVerified}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="cursor-pointer truncate text-xs font-bold text-slate-900 hover:text-brand-primary">
                        {alum.name}
                      </span>
                      {alum.isVerified && <IconCircleCheck className="h-3 w-3 shrink-0 text-brand-secondary" />}
                    </div>
                    <p className="truncate text-[11px] text-slate-600">{alum.role}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{alum.major}</p>

                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      {alum.matchScore !== undefined && (
                        <span className="rounded bg-brand-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-brand-primary">
                          {alum.matchScore}% Match
                        </span>
                      )}
                      {alum.mentorship && (
                        <span className="py-0.2 inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 text-[9px] font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                          Accepting Mentees
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnect(alum)}
                  disabled={connectingId === alum.id}
                  title={`Kết nối trao đổi với ${alum.name}`}
                  aria-label={`Kết nối với ${alum.name}`}
                  className="h-8 w-8 shrink-0 rounded-full border-slate-200 p-0 text-slate-700 hover:border-brand-primary/40 hover:text-brand-primary inline-flex items-center justify-center"
                >
                  {connectingId === alum.id ? (
                    <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <IconMessageCircle className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))
          )}

          <Link
            to={ROUTES.APP.ALUMNI}
            className="flex items-center justify-center gap-1 pt-2 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
          >
            <span>Khám phá danh bạ cựu sinh viên FPT</span>
            <IconChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      {/* 2. Upcoming Community Events & RSVP */}
      <Card className="border-slate-200/90 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <IconCalendar className="h-4 w-4 text-brand-primary" />
            <span>Sự Kiện Sắp Tới</span>
          </CardTitle>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            RSVP
          </span>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {isLoadingEvents ? (
            <div className="flex h-20 items-center justify-center">
              <IconLoader2 className="h-4 w-4 animate-spin text-brand-primary" />
              <span className="ml-2 text-xs text-slate-400">Đang tải sự kiện...</span>
            </div>
          ) : events.length > 0 ? (
            events.map((evt) => {
              const startDate = new Date(evt.startTime)
              const dateStr = startDate.toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'numeric',
              })
              const isGoing = evt.myStatus === 'Going'

              return (
                <div
                  key={evt.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 transition-colors hover:bg-slate-100/70"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <Badge className="bg-brand-secondary/90 text-white px-1.5 py-0 text-[10px]">
                      {evt.campus || 'Toàn quốc'}
                    </Badge>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-brand-primary">
                      <IconClock className="h-2.5 w-2.5" />
                      {dateStr}
                    </span>
                  </div>

                  <h4 className="line-clamp-2 text-xs font-bold leading-snug text-slate-900">
                    {evt.title}
                  </h4>
                  <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">
                    📍 {evt.location}
                  </p>

                  <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-2">
                    <span className="text-[10px] font-semibold text-slate-600">
                      👥 {evt.goingCount || 0} đã tham gia
                    </span>

                    <Button
                      size="sm"
                      variant={isGoing ? 'default' : 'outline'}
                      onClick={() => handleRsvpInSidebar(evt.id, 'Going')}
                      disabled={rsvpingEventId === evt.id}
                      title={isGoing ? 'Đã RSVP (Bấm để hủy)' : 'Đăng ký tham gia sự kiện'}
                      aria-label={isGoing ? 'Đã RSVP' : 'Tham gia'}
                      className={`h-7 w-7 rounded-full p-0 inline-flex items-center justify-center ${
                        isGoing
                          ? 'bg-brand-primary text-white hover:bg-brand-primary-hover'
                          : 'border-slate-200 text-slate-700 hover:text-brand-primary'
                      }`}
                    >
                      {rsvpingEventId === evt.id ? (
                        <IconLoader2 className="h-3 w-3 animate-spin" />
                      ) : isGoing ? (
                        <IconCheck className="h-3.5 w-3.5" />
                      ) : (
                        <IconCalendar className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="py-3 text-center text-xs text-slate-400">
              Chưa có sự kiện nào sắp tới.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 3. Forum Categories Widget */}
      <Card className="border-slate-200/90 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <IconTrendingUp className="h-4 w-4 text-brand-secondary" />
            <span>Chuyên mục thảo luận</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          {categories.length === 0 ? (
            <p className="py-2 text-xs text-slate-400">Chưa có chuyên mục nào.</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between py-1 text-xs">
                <Link
                  to={`${ROUTES.APP.COMMUNITIES}?tag=${encodeURIComponent(cat.slug || cat.name)}`}
                  className="font-semibold text-slate-900 hover:text-brand-primary"
                >
                  #{cat.slug || cat.name}
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 4. Footer Brand Info */}
      <div className="px-2 text-[11px] leading-relaxed text-slate-400">
        <p className="text-[10px]">© 2026 Đại học FPT • Mạng lưới Cựu sinh viên & Sinh viên</p>
      </div>
    </aside>
  )
}
