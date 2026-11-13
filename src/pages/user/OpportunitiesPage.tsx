import { useState, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconBriefcase,
  IconStack2,
  IconAward,
  IconCalendar,
  IconSearch,
  IconMapPin,
  IconClock,
  IconCircleCheck,
  IconCurrencyDollar,
  IconUsers,
  IconLoader2,
  IconSparkles,
  IconMessageDots,
  IconExternalLink,
  IconTarget,
  IconBrain,
} from '@tabler/icons-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { ROUTES } from '@/constants/routes'
import {
  opportunitiesService,
  type CommunityEventItem,
} from '@/services/opportunities'
import { postsService, type ForumPostItem } from '@/services/posts'
import { aiService, type MentorItem } from '@/services/ai'
import { chatService } from '@/services/chat'
import { useAuthStore } from '@/stores/authStore'
import { PublicProfileModal } from '@/features/users'

export type OpportunityTab = 'all' | 'jobs' | 'internships' | 'scholarships' | 'events' | 'mentors'

interface OpportunityItem {
  id: string
  authorId?: string
  title: string
  company: string
  companyLogo?: string
  type: 'job' | 'internship' | 'scholarship'
  campus: string
  location: string
  stipendOrSalary: string
  tags: string[]
  description: string
  deadline: string
  alumniContact?: {
    name: string
    avatar: string
    title: string
  }
}

function mapRecruitmentPostToOpportunity(post: ForumPostItem): OpportunityItem {
  const lowerTitle = (post.title || '').toLowerCase()
  const lowerContent = (post.content || '').toLowerCase()
  let type: 'job' | 'internship' | 'scholarship' = 'job'
  if (lowerTitle.includes('intern') || lowerTitle.includes('ojt') || lowerTitle.includes('thực tập')) {
    type = 'internship'
  } else if (lowerTitle.includes('học bổng') || lowerTitle.includes('scholarship') || lowerContent.includes('học bổng')) {
    type = 'scholarship'
  }

  return {
    id: post.id,
    authorId: post.authorId,
    title: post.title,
    company: post.major ? `Khoa ${post.major} • FPT Alumni Partner` : 'FPT Alumni Network',
    companyLogo: post.authorAvatarUrl,
    type,
    campus: post.campus || 'All',
    location: post.campus || 'FPT University',
    stipendOrSalary: 'Thỏa thuận theo năng lực',
    tags: post.tags && post.tags.length > 0 ? post.tags : [post.major || 'FPT', post.postType || 'Recruitment'],
    description: post.content,
    deadline: new Date(post.createdAt).toLocaleDateString('vi-VN'),
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
  const [events, setEvents] = useState<CommunityEventItem[]>([])
  const [rsvpStatusMap, setRsvpStatusMap] = useState<Record<string, string>>({})
  const [recruiterChatLoadingId, setRecruiterChatLoadingId] = useState<string | null>(null)

  // AI Mentor Matching States
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Microservices', '.NET 10', 'React'])
  const [mentorMajor, setMentorMajor] = useState<string>(currentUser?.department || 'SE')
  const [careerGoal, setCareerGoal] = useState<string>('Trở thành Senior Software Engineer / Solution Architect')
  const [mentors, setMentors] = useState<MentorItem[]>([])
  const [isLoadingMentors, setIsLoadingMentors] = useState<boolean>(false)
  const [hasSearchedMentors, setHasSearchedMentors] = useState<boolean>(false)
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null)
  const [selectedMentorForProfile, setSelectedMentorForProfile] = useState<MentorItem | null>(null)

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const handleFindMentors = async () => {
    setIsLoadingMentors(true)
    setHasSearchedMentors(true)
    try {
      const res = await aiService.recommendMentors({
        major: mentorMajor,
        targetSkills: selectedSkills,
        careerGoal: careerGoal.trim() || undefined,
      })
      setMentors(res || [])
    } catch (err) {
      console.error('Failed to get mentor recommendations:', err)
      setMentors([])
    } finally {
      setIsLoadingMentors(false)
    }
  }

  const handleChatWithMentor = async (mentor: MentorItem) => {
    setChatLoadingId(mentor.userId)
    try {
      await chatService.createDirectRoom({
        targetUserId: mentor.userId,
        targetUserName: mentor.fullName,
      })
      navigate(ROUTES.APP.CHAT)
    } catch (err) {
      console.error('Failed to open chat with mentor:', err)
    } finally {
      setChatLoadingId(null)
    }
  }

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  // Fetch Real Recruitment Posts & Community Events from ForumService
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoadingOpportunities(true)
      try {
        const [postsRes, eventsRes] = await Promise.all([
          postsService.getPosts({ postType: 'Recruitment', pageSize: 30 }),
          opportunitiesService.getEvents({ upcomingOnly: true, pageSize: 10 }),
        ])
        const oppList = (postsRes.items || []).map(mapRecruitmentPostToOpportunity)
        setOpportunities(oppList)

        const eventList = eventsRes.items || []
        setEvents(eventList)
        const statusObj: Record<string, string> = {}
        eventList.forEach((e) => {
          if (e.myStatus) statusObj[e.id] = e.myStatus
        })
        setRsvpStatusMap(statusObj)
      } catch (err) {
        console.error('Failed to load opportunities & events:', err)
      } finally {
        setIsLoadingOpportunities(false)
      }
    }
    void fetchAllData()
  }, [])

  const handleRsvp = async (eventId: string, status: 'Going' | 'Interested') => {
    try {
      await opportunitiesService.rsvpEvent(eventId, status)
      setRsvpStatusMap((prev) => ({ ...prev, [eventId]: status }))
    } catch (err) {
      console.error('Failed to RSVP event:', err)
    }
  }

  const handleChatWithRecruiter = async (opp: OpportunityItem) => {
    if (!opp.authorId) {
      navigate(ROUTES.APP.CHAT)
      return
    }
    setRecruiterChatLoadingId(opp.id)
    try {
      await chatService.createDirectRoom({
        targetUserId: opp.authorId,
        targetUserName: opp.alumniContact?.name || 'Nhà tuyển dụng',
      })
      navigate(ROUTES.APP.CHAT)
    } catch (err) {
      console.warn('Failed to open chat with recruiter:', err)
      navigate(ROUTES.APP.CHAT)
    } finally {
      setRecruiterChatLoadingId(null)
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
      opp.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCampus =
      selectedCampus === 'All' || opp.campus === 'All' || opp.campus === 'Toàn quốc' || opp.campus === selectedCampus

    return matchesTab && matchesSearch && matchesCampus
  })

  return (
    <div className="space-y-4">
      {/* 1. Unified Page Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <IconBriefcase className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Cơ hội Việc làm & Thực tập FPT</h1>
              <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-primary">
                {opportunities.length} vị trí
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kết nối trực tiếp Doanh nghiệp, Cựu sinh viên và Sinh viên ĐH FPT. Tuyển dụng chính thức, thực tập OJT và học bổng.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Unified Tabs & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Tất cả', icon: IconBriefcase },
            { id: 'jobs', label: 'Việc làm', icon: IconBriefcase },
            { id: 'internships', label: 'OJT', icon: IconStack2 },
            { id: 'scholarships', label: 'Học bổng', icon: IconAward },
            { id: 'events', label: 'Sự kiện', icon: IconCalendar },
            { id: 'mentors', label: 'AI Mentor', icon: IconSparkles },
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
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Search & Campus Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm việc, công ty, kỹ năng..."
              className="h-8.5 w-full rounded-xl border border-slate-200/90 bg-slate-50/70 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <div className="inline-flex h-8.5 items-center rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 text-xs text-slate-700">
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="All">Tất cả cơ sở</option>
              <option value="Hoa Lac">Hòa Lạc</option>
              <option value="HCM">TP. Hồ Chí Minh</option>
              <option value="Da Nang">Đà Nẵng</option>
              <option value="Can Tho">Cần Thơ</option>
              <option value="Quy Nhon">Quy Nhơn</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Tab Content */}
      {isLoadingOpportunities ? (
        <Card className="p-12 text-center bg-white border-slate-200 flex items-center justify-center gap-2">
          <IconLoader2 className="h-5 w-5 animate-spin text-brand-primary" />
          <span className="text-xs font-medium text-slate-500">Đang tải cơ hội nghề nghiệp & sự kiện...</span>
        </Card>
      ) : activeTab === 'events' ? (
        /* Events & Workshops RSVP Section */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <IconCalendar className="h-4 w-4 text-brand-primary" />
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
                <Card key={ev.id} className="overflow-hidden border-slate-200/90 bg-white shadow-xs p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-brand-primary/10 text-brand-primary font-bold text-[11px] px-2 py-0.5">
                          {ev.campus || 'ĐH FPT'}
                        </Badge>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <IconClock className="h-3 w-3" />
                          {new Date(ev.startTime).toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 hover:text-brand-primary transition-colors">
                        {ev.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5">
                          <IconMapPin className="h-3.5 w-3.5 text-slate-400" />
                          {ev.location}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <IconUsers className="h-3.5 w-3.5 text-brand-secondary" />
                          {ev.goingCount} người tham gia
                        </span>
                      </div>
                    </div>

                    {/* RSVP Buttons */}
                    <div className="flex flex-row sm:flex-col items-center gap-2 shrink-0 w-full sm:w-36">
                      <Button
                        onClick={() => handleRsvp(ev.id, 'Going')}
                        title={myRsvp === 'Going' ? 'Đã đăng ký tham gia (Bấm để hủy)' : 'Đăng ký tham gia (RSVP)'}
                        aria-label={myRsvp === 'Going' ? 'Đã đăng ký' : 'Tham gia'}
                        className={`w-full text-xs font-bold h-9 rounded-xl transition-all ${
                          myRsvp === 'Going'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                        }`}
                      >
                        {myRsvp === 'Going' ? (
                          <span className="flex items-center gap-1.5">
                            <IconCircleCheck className="h-4 w-4" /> Đã RSVP
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <IconCalendar className="h-4 w-4" /> RSVP
                          </span>
                        )}
                      </Button>

                      <Button
                        onClick={() => handleRsvp(ev.id, 'Interested')}
                        variant="secondary"
                        title={myRsvp === 'Interested' ? 'Đã quan tâm' : 'Quan tâm sự kiện'}
                        aria-label={myRsvp === 'Interested' ? 'Đã quan tâm' : 'Quan tâm'}
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
      ) : activeTab === 'mentors' ? (
        /* AI Mentor Matching Hub */
        <div className="space-y-4">
          <Card className="overflow-hidden border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50/40 p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F27024] text-white shadow-md">
                  <IconBrain className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Trung Tâm Gợi Ý Mentor AI (AI Mentorship Matching Hub)
                    </h2>
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-[10px] font-bold">
                      Semantic Vector Matching
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-2xl">
                    Sử dụng mô hình AI kết hợp RAG để đối chiếu định hướng nghề nghiệp và kỹ năng công nghệ mong muốn của bạn với hồ sơ kinh nghiệm thực chiến của mạng lưới Cựu sinh viên FPT.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleFindMentors}
                disabled={isLoadingMentors}
                className="bg-[#F27024] hover:bg-[#d95e18] text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
              >
                {isLoadingMentors ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    <span>Đang AI matching...</span>
                  </>
                ) : (
                  <>
                    <IconSparkles className="h-4 w-4" />
                    <span>Tìm Mentor Phù Hợp</span>
                  </>
                )}
              </Button>
            </div>

            {/* Filter controls */}
            <div className="mt-4 pt-4 border-t border-orange-100/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Major Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chuyên ngành đào tạo:
                </label>
                <select
                  value={mentorMajor}
                  onChange={(e) => setMentorMajor(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-orange-500"
                >
                  <option value="SE">Kỹ thuật phần mềm (SE)</option>
                  <option value="AI">Trí tuệ nhân tạo (AI)</option>
                  <option value="IA">An toàn thông tin (IA)</option>
                  <option value="GD">Thiết kế mỹ thuật số (GD)</option>
                  <option value="IB">Kinh doanh quốc tế (IB)</option>
                  <option value="BA">Quản trị kinh doanh (BA)</option>
                </select>
              </div>

              {/* Career Goal */}
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Mục tiêu nghề nghiệp & Nguyện vọng OJT/Đi làm:
                </label>
                <div className="relative">
                  <IconTarget className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="VD: Trở thành Solution Architect, Senior Fullstack Dev tại Big Tech..."
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Quick Skill Tags Selection */}
            <div className="mt-3">
              <span className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Kỹ năng trọng tâm muốn được bảo trợ (bấm chọn nhanh):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Microservices',
                  '.NET 10',
                  'React',
                  'Docker',
                  'System Design',
                  'AI / Machine Learning',
                  'Cloud / AWS',
                  'DevOps',
                  'Kafka',
                  'Data Science',
                  'Cybersecurity',
                  'Flutter',
                ].map((skill) => {
                  const isSelected = selectedSkills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#F27024] text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected ? `✓ ${skill}` : `+ ${skill}`}
                    </button>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Mentors Results List */}
          {isLoadingMentors ? (
            <Card className="p-12 text-center bg-white border-slate-200 flex items-center justify-center gap-2">
              <IconLoader2 className="h-6 w-6 animate-spin text-[#F27024]" />
              <span className="text-xs font-semibold text-slate-600">
                Đang quét và tính điểm Match Score với các cựu sinh viên...
              </span>
            </Card>
          ) : mentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {mentors.map((mentor) => (
                <Card
                  key={mentor.id || mentor.userId}
                  className="p-4 rounded-2xl border-slate-200 bg-white shadow-sm hover:border-orange-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={mentor.avatarUrl}
                        fallback={mentor.fullName.slice(0, 2).toUpperCase()}
                        size="md"
                        isVerified
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{mentor.fullName}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {mentor.jobTitle} • {mentor.currentCompany}
                        </p>
                        <Badge variant="outline" className="mt-0.5 text-[10px] text-slate-600">
                          Khoa {mentor.major}
                        </Badge>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <IconSparkles className="h-3 w-3 text-emerald-600" />
                        <span>{Math.round(mentor.matchScore * 100)}% Match</span>
                      </span>
                    </div>
                  </div>

                  {mentor.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                      "{mentor.bio}"
                    </p>
                  )}

                  {mentor.skills && (
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {mentor.skills.split(',').map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedMentorForProfile(mentor)}
                      title="Xem hồ sơ chi tiết (US-05)"
                      aria-label="Xem hồ sơ"
                      className="h-8 w-8 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 p-0 inline-flex items-center justify-center"
                    >
                      <IconExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleChatWithMentor(mentor)}
                      disabled={chatLoadingId === mentor.userId}
                      title="Nhắn tin trao đổi với mentor"
                      aria-label="Nhắn tin trao đổi"
                      className="h-8 w-8 rounded-xl bg-brand-secondary hover:bg-brand-secondary/90 text-white p-0 inline-flex items-center justify-center"
                    >
                      {chatLoadingId === mentor.userId ? (
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconMessageDots className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : hasSearchedMentors ? (
            <Card className="p-8 text-center bg-white border-dashed border-slate-200">
              <IconUsers className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-xs font-semibold text-slate-700">
                Chưa tìm thấy Mentor khớp với bộ kỹ năng hiện tại
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hãy thử chọn thêm các kỹ năng phổ biến hoặc đổi chuyên ngành để nhận gợi ý phong phú hơn.
              </p>
            </Card>
          ) : (
            <Card className="p-8 text-center bg-white border-dashed border-slate-200">
              <IconSparkles className="mx-auto h-8 w-8 text-orange-400" />
              <p className="mt-2 text-xs font-semibold text-slate-700">
                Sẵn sàng khám phá mạng lưới Mentor cựu sinh viên
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bấm nút "Tìm Mentor Phù Hợp" ở trên để thuật toán AI phân tích và đề xuất mentor tốt nhất cho bạn!
              </p>
            </Card>
          )}
        </div>
      ) : (
        /* Jobs, Internships & Scholarships List */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <IconBriefcase className="h-4 w-4 text-brand-primary" />
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
            {filteredOpportunities.map((opp) => {
              return (
                <Card
                  key={opp.id}
                  className="overflow-hidden border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:border-brand-primary/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={opp.companyLogo}
                          alt={opp.company}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-xs"
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
                          <h3 className="text-base font-bold text-slate-900 mt-0.5">
                            {opp.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {opp.description}
                      </p>

                      {/* Meta Tags */}
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

                      {/* Footer Details */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2">
                        <span className="flex items-center gap-1 font-bold text-brand-primary">
                          <IconCurrencyDollar className="h-3.5 w-3.5" />
                          {opp.stipendOrSalary}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconMapPin className="h-3.5 w-3.5 text-slate-400" />
                          {opp.campus} • {opp.location}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <IconClock className="h-3.5 w-3.5" />
                          Hạn chót: {opp.deadline}
                        </span>
                      </div>
                    </div>

                    {/* Right: Recruiter / Apply Action */}
                    <div className="flex flex-row sm:flex-col items-end justify-between gap-3 shrink-0 w-full sm:w-44 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                      {opp.alumniContact && (
                        <div className="flex items-center gap-2 text-right sm:text-left">
                          <Avatar
                            src={opp.alumniContact.avatar}
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
                      )}

                      <Button
                        onClick={() => handleChatWithRecruiter(opp)}
                        disabled={recruiterChatLoadingId === opp.id}
                        title="Nhắn tin trao đổi trực tiếp với nhà tuyển dụng"
                        aria-label="Nhắn tin trực tiếp"
                        className="w-full text-xs font-bold h-9 rounded-xl transition-all bg-brand-primary hover:bg-brand-primary-hover text-white shadow-xs"
                      >
                        {recruiterChatLoadingId === opp.id ? (
                          <span className="flex items-center gap-1.5">
                            <IconLoader2 className="h-4 w-4 animate-spin" /> Đang kết nối...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <IconMessageDots className="h-4 w-4" /> Nhắn tin trao đổi
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Public Profile Modal for Mentors */}
      {selectedMentorForProfile && (
        <PublicProfileModal
          isOpen={Boolean(selectedMentorForProfile)}
          onClose={() => setSelectedMentorForProfile(null)}
          userId={selectedMentorForProfile.userId}
          initialUser={{
            id: selectedMentorForProfile.userId,
            fullName: selectedMentorForProfile.fullName,
            avatarUrl: selectedMentorForProfile.avatarUrl,
            major: selectedMentorForProfile.major,
            role: 'Alumni',
            bio: selectedMentorForProfile.bio,
            campus: 'FU-HCM',
            batch: null,
          }}
        />
      )}
    </div>
  )
}
