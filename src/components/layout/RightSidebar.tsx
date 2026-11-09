import { useState, useEffect, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { aiService, type MentorItem } from '@/services/ai'
import { chatService } from '@/services/chat'
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
            avatar:
              m.avatarUrl ||
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
            isVerified: true,
            matchScore: m.matchScore,
            mentorship: true,
          }))
          setMentors(mapped)
          return
        }
      } catch (err) {
        console.warn('AI Mentor recommendation API unavailable, using fallback list:', err)
      } finally {
        if (isMounted) setIsLoadingMentors(false)
      }

      // Fallback initial list
      if (isMounted) {
        setMentors([
          {
            id: 'demo-1',
            name: 'Dr. Marcus Vance',
            role: 'Principal Architect @ Google',
            major: "Kỹ thuật PM '16",
            avatar:
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
            isVerified: true,
            matchScore: 98,
            mentorship: true,
          },
          {
            id: 'demo-2',
            name: 'Sarah Al-Mansoor',
            role: 'Product Lead @ Stripe',
            major: "Hệ thống TT '18",
            avatar:
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
            isVerified: true,
            matchScore: 92,
            mentorship: false,
          },
          {
            id: 'demo-3',
            name: 'David Chen',
            role: 'VP Engineering @ Hyperion',
            major: "CS '14",
            avatar:
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
            isVerified: true,
            matchScore: 88,
            mentorship: true,
          },
        ])
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

  const upcomingDeadlines = [
    {
      id: '1',
      title: 'Google Student Research Fellowship 2026',
      organization: 'Google Research & FPT',
      deadline: '3 days left',
      tag: '100% Funded',
      tagVariant: 'brand-primary' as const,
    },
    {
      id: '2',
      title: 'Alumni Endowment STEM Grant',
      organization: 'Quỹ Cựu Sinh Viên FPT',
      deadline: '5 days left',
      tag: '$10,000 Grant',
      tagVariant: 'brand-accent' as const,
    },
    {
      id: '3',
      title: 'Goldman Sachs Early Insight Series',
      organization: 'Goldman Sachs Singapore',
      deadline: 'Ends today',
      tag: 'OJT / Fast-track',
      tagVariant: 'destructive' as const,
    },
  ]

  const trendingCommunities = [
    { name: '#AI-Robotics-Hub', members: '1,840 members', growth: '+18% this week' },
    { name: '#Consulting-Case-Prep', members: '920 members', growth: '+12% this week' },
    { name: '#FinTech-Founders', members: '650 members', growth: '+24% this week' },
  ]

  return (
    <aside className="w-full space-y-4">
      {/* 1. Recommended Alumni / AI Mentors Widget */}
      <Card className="border-slate-200/90 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Sparkles className="h-4 w-4 text-brand-primary animate-pulse" />
            <span>AI Mentor Gợi ý</span>
          </CardTitle>
          <Link
            to={ROUTES.APP.ALUMNI}
            className="text-[11px] font-semibold text-brand-primary hover:underline"
          >
            Tất cả
          </Link>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {isLoadingMentors ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
              <span className="ml-2 text-xs text-slate-400">Đang gợi ý mentor...</span>
            </div>
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
                      {alum.isVerified && <CheckCircle2 className="h-3 w-3 shrink-0 text-brand-secondary" />}
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
                  className="h-7 shrink-0 rounded-full border-slate-200 px-2.5 text-[11px] font-semibold text-slate-700 hover:border-brand-primary/40 hover:text-brand-primary"
                >
                  {connectingId === alum.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="mr-1 h-3 w-3" />
                      Kết nối
                    </>
                  )}
                </Button>
              </div>
            ))
          )}

          <Link
            to={ROUTES.APP.ALUMNI}
            className="flex items-center justify-center gap-1 pt-2 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
          >
            <span>Khám phá 1,400+ cựu sinh viên FPT</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      {/* 2. Upcoming Opportunity Deadlines */}
      <Card className="border-slate-200/90 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Clock className="h-4 w-4 text-amber-500" />
            Upcoming Deadlines
          </CardTitle>
          <Link
            to={ROUTES.APP.SCHOLARSHIPS}
            className="text-[11px] font-semibold text-brand-primary hover:underline"
          >
            Calendar
          </Link>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {upcomingDeadlines.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 transition-colors hover:bg-slate-100/70"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <Badge variant={item.tagVariant} className="px-1.5 py-0 text-[10px]">
                  {item.tag}
                </Badge>
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                  <Clock className="h-2.5 w-2.5" />
                  {item.deadline}
                </span>
              </div>
              <h4 className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900">
                {item.title}
              </h4>
              <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                <Award className="h-3 w-3 text-slate-400" />
                {item.organization}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 3. Trending Communities Widget */}
      <Card className="border-slate-200/90 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <TrendingUp className="h-4 w-4 text-brand-secondary" />
            Trending Communities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 pt-0">
          {trendingCommunities.map((circle) => (
            <div key={circle.name} className="flex items-center justify-between py-1 text-xs">
              <div>
                <p className="cursor-pointer font-semibold text-slate-900 hover:text-brand-primary">
                  {circle.name}
                </p>
                <span className="text-[10px] text-slate-500">{circle.members}</span>
              </div>
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                {circle.growth}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 4. Footer Mini Links */}
      <div className="space-y-2 px-2 text-[11px] leading-relaxed text-slate-400">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <Link to="/about" className="hover:underline">
            About
          </Link>
          <span>•</span>
          <Link to="/privacy" className="hover:underline">
            Privacy
          </Link>
          <span>•</span>
          <Link to="/guidelines" className="hover:underline">
            Community Guidelines
          </Link>
        </div>
        <p className="text-[10px]">© 2026 FPT University • Alumni & Student Network</p>
      </div>
    </aside>
  )
}
