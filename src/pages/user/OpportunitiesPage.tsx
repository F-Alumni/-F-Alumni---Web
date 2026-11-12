import { useState, useEffect, type FC } from 'react'
import {
  Briefcase,
  Layers,
  Award,
  Calendar,
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  DollarSign,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import {
  opportunitiesService,
  type CommunityEventItem,
} from '@/services/opportunities'
import { useAuthStore } from '@/stores/authStore'

export type OpportunityTab = 'all' | 'jobs' | 'internships' | 'scholarships' | 'events'

interface OpportunityItem {
  id: string
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

const SAMPLE_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: 'opp-1',
    title: 'Junior Backend Engineer (.NET 10 & Microservices)',
    company: 'FPT Software Global',
    companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80&w=128',
    type: 'job',
    campus: 'Hoa Lac',
    location: 'F-Town 3, Khu Công Nghệ Cao Q9 / F-Ville 2 Hòa Lạc',
    stipendOrSalary: '15.000.000 - 25.000.000 VND',
    tags: ['C#', '.NET', 'Microservices', 'Kafka', 'SQL Server'],
    description: 'Tham gia dự án chuyển đổi số ngân hàng quốc tế. Yêu cầu nắm vững OOP, Clean Architecture, REST API & gRPC. Ưu tiên cựu sinh viên FPT K15-K17.',
    deadline: '30/11/2026',
    alumniContact: {
      name: 'Nguyễn Tuấn Anh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=128',
      title: 'Engineering Lead K13',
    },
  },
  {
    id: 'opp-2',
    title: 'Thực tập sinh OJT AI & LLM Engineering (Full-time / Part-time)',
    company: 'FPT Smart Cloud & AI Center',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=128',
    type: 'internship',
    campus: 'HCM',
    location: 'FPT Complex & Remote Hybrid',
    stipendOrSalary: '6.000.000 - 9.000.000 VND / tháng + Trợ cấp',
    tags: ['Python', 'PyTorch', 'RAG', 'LangChain', 'FastAPI'],
    description: 'Dành riêng cho sinh viên FPT kỳ 5-7 chuẩn bị đi OJT. Huấn luyện 1-1 với AI Scientist cựu sinh viên FPT. Cơ hội lên nhân viên chính thức sau 3 tháng.',
    deadline: '15/12/2026',
    alumniContact: {
      name: 'Trần Hoài Nam',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=128',
      title: 'Senior AI Specialist K14',
    },
  },
  {
    id: 'opp-3',
    title: 'Học bổng Cựu sinh viên FPT - Ươm mầm Khởi nghiệp & Thạc sĩ Tech 2026',
    company: 'FPT Alumni Angel Fund & ĐH FPT',
    companyLogo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=128',
    type: 'scholarship',
    campus: 'Toàn quốc',
    location: 'Online Mentor & Campus Pitching',
    stipendOrSalary: '50.000.000 VND / suất (Tài trợ 100%)',
    tags: ['Scholarship', 'Startup', 'Research', 'Capstone Funding'],
    description: 'Quỹ Cựu sinh viên FPT tài trợ chi phí nghiên cứu và làm đồ án Capstone xuất sắc cho các nhóm sinh viên có đề tài ứng dụng thực tế hoặc khởi nghiệp.',
    deadline: '20/12/2026',
    alumniContact: {
      name: 'Lê Minh Quân',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=128',
      title: 'Founder & Alumni K11',
    },
  },
  {
    id: 'opp-4',
    title: 'Frontend React / Next.js Developer (OJT Intern to Fresher)',
    company: 'Base.vn (FPT Ecosystem)',
    companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=128',
    type: 'internship',
    campus: 'Hoa Lac',
    location: 'Tòa nhà FPT Cầu Giấy, Hà Nội',
    stipendOrSalary: '7.000.000 - 10.000.000 VND / tháng',
    tags: ['React', 'TypeScript', 'TailwindCSS', 'Zustand'],
    description: 'Phát triển các module SaaS quản trị doanh nghiệp. Môi trường agile năng động, hỗ trợ dấu mộc thực tập OJT và báo cáo thực tập tại trường.',
    deadline: '05/12/2026',
    alumniContact: {
      name: 'Võ Quốc Huy',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=128',
      title: 'Frontend Team Lead K15',
    },
  },
]

interface OpportunitiesPageProps {
  defaultTab?: OpportunityTab
}

export const OpportunitiesPage: FC<OpportunitiesPageProps> = ({ defaultTab = 'all' }) => {
  const { currentUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<OpportunityTab>(defaultTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampus, setSelectedCampus] = useState('All')
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [events, setEvents] = useState<CommunityEventItem[]>([])
  const [rsvpStatusMap, setRsvpStatusMap] = useState<Record<string, string>>({})
  const [selectedApplyOpp, setSelectedApplyOpp] = useState<OpportunityItem | null>(null)
  const [applySuccessMsg, setApplySuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  // Fetch Community Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await opportunitiesService.getEvents({ upcomingOnly: true, pageSize: 6 })
        const eventList = res.items || []
        setEvents(eventList)
        const statusObj: Record<string, string> = {}
        eventList.forEach((e) => {
          if (e.myStatus) statusObj[e.id] = e.myStatus
        })
        setRsvpStatusMap(statusObj)
      } catch {
        // Fallback demo events
        setEvents([
          {
            id: 'ev-demo-1',
            creatorId: 'c1',
            creatorName: 'Alumni Tech Club',
            creatorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=128',
            title: 'FPT AI & Cloud Career Day 2026',
            description: 'Ngày hội kết nối tuyển dụng trực tiếp giữa 30 doanh nghiệp công nghệ và 500 sinh viên, cựu sinh viên FPT.',
            location: 'Hội trường Trống Đồng - FPT University Hòa Lạc',
            campus: 'Hoa Lac',
            startTime: '2026-11-20T09:00:00Z',
            endTime: '2026-11-20T17:00:00Z',
            goingCount: 142,
            interestedCount: 89,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'ev-demo-2',
            creatorId: 'c2',
            creatorName: 'FPT Startup Incubator',
            creatorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=128',
            title: 'Workshop: Từ Đồ án Tốt nghiệp (Capstone) Đến Gọi vốn Vòng Seed',
            description: 'Chia sẻ kinh nghiệm thực chiến từ 4 Founder cựu sinh viên FPT đã gọi vốn thành công từ 100k - 1M USD.',
            location: 'Online qua Zoom & FPT HCM Hall B',
            campus: 'HCM',
            startTime: '2026-11-25T19:30:00Z',
            endTime: '2026-11-25T21:30:00Z',
            goingCount: 96,
            interestedCount: 65,
            createdAt: new Date().toISOString(),
          },
        ])
      }
    }
    fetchEvents()
  }, [])

  const handleRsvp = async (eventId: string, status: 'Going' | 'Interested') => {
    try {
      await opportunitiesService.rsvpEvent(eventId, status)
      setRsvpStatusMap((prev) => ({ ...prev, [eventId]: status }))
    } catch {
      setRsvpStatusMap((prev) => ({ ...prev, [eventId]: status }))
    }
  }

  const handleApply = (opp: OpportunityItem) => {
    setSelectedApplyOpp(opp)
  }

  const confirmApply = () => {
    if (selectedApplyOpp) {
      setAppliedIds((prev) => [...prev, selectedApplyOpp.id])
      setApplySuccessMsg(`Đã gửi hồ sơ ứng tuyển vị trí "${selectedApplyOpp.title}" thành công đến ${selectedApplyOpp.alumniContact?.name || 'nhà tuyển dụng'}!`)
      setSelectedApplyOpp(null)
      setTimeout(() => setApplySuccessMsg(null), 5000)
    }
  }

  const filteredOpportunities = SAMPLE_OPPORTUNITIES.filter((opp) => {
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
      selectedCampus === 'All' || opp.campus === 'Toàn quốc' || opp.campus === selectedCampus

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
            Kết nối trực tiếp giữa Doanh nghiệp, Cựu sinh viên (Alumni) và Sinh viên trường ĐH FPT. Cơ hội thực tập, việc làm chính thức và quỹ học bổng độc quyền.
          </p>
        </div>
      </div>

      {applySuccessMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{applySuccessMsg}</span>
        </div>
      )}

      {/* 2. Tabs & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
        {/* Navigation Tabs */}
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
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Search Bar */}
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
            className="h-8 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="All">Tất cả Campus</option>
            <option value="Hoa Lac">Hòa Lạc</option>
            <option value="HCM">TP. Hồ Chí Minh</option>
            <option value="Da Nang">Đà Nẵng</option>
            <option value="Can Tho">Cần Thơ</option>
            <option value="Quy Nhon">Quy Nhơn</option>
          </select>
        </div>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'events' ? (
        /* Events & Workshops RSVP Section */
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
                <Card key={ev.id} className="overflow-hidden border-slate-200/90 bg-white shadow-xs p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-brand-primary/10 text-brand-primary font-bold text-[11px] px-2 py-0.5">
                          {ev.campus || 'ĐH FPT'}
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

                      <h3 className="text-base font-bold text-slate-900 hover:text-brand-primary transition-colors">
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

                    {/* RSVP Buttons */}
                    <div className="flex flex-row sm:flex-col items-center gap-2 shrink-0 w-full sm:w-36">
                      <Button
                        onClick={() => handleRsvp(ev.id, 'Going')}
                        className={`w-full text-xs font-bold h-9 rounded-xl transition-all ${
                          myRsvp === 'Going'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
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
                        onClick={() => handleRsvp(ev.id, 'Interested')}
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
        /* Jobs, Internships & Scholarships List */
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
            {filteredOpportunities.map((opp) => {
              const isApplied = appliedIds.includes(opp.id)
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
                          <DollarSign className="h-3.5 w-3.5" />
                          {opp.stipendOrSalary}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {opp.campus} • {opp.location}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
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
                        onClick={() => handleApply(opp)}
                        disabled={isApplied}
                        className={`w-full text-xs font-bold h-9 rounded-xl transition-all ${
                          isApplied
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-brand-primary hover:bg-brand-primary-hover text-white shadow-xs'
                        }`}
                      >
                        {isApplied ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Đã ứng tuyển
                          </span>
                        ) : (
                          'Ứng tuyển / Kết nối'
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

      {/* 4. Apply Modal Dialog */}
      {selectedApplyOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Ứng tuyển cơ hội</h3>
                <p className="text-xs text-slate-500">{selectedApplyOpp.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplyOpp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="rounded-xl bg-slate-50 p-3 space-y-1">
                <p className="font-semibold text-slate-800">Thông tin ứng viên gửi đi:</p>
                <p>• Họ tên: <span className="font-medium text-slate-900">{currentUser?.name || 'Học viên FPT'}</span></p>
                <p>• Email: <span className="font-medium text-slate-900">{currentUser?.email}</span></p>
                <p>• Chuyên ngành: <span className="font-medium text-slate-900">{currentUser?.department || 'Kỹ thuật phần mềm'}</span></p>
                <p>• Campus: <span className="font-medium text-slate-900">{currentUser?.campus || 'Hòa Lạc'}</span></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lời nhắn / Giới thiệu bản thân ngắn gọn:
                </label>
                <textarea
                  rows={3}
                  placeholder="Chào anh/chị, em là sinh viên FPT quan tâm đến vị trí..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  defaultValue={`Em chào anh ${selectedApplyOpp.alumniContact?.name || 'tuyển dụng'}, em là sinh viên ĐH FPT muốn kết nối và ứng tuyển vị trí này ạ!`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setSelectedApplyOpp(null)}
                className="text-xs rounded-xl"
              >
                Hủy
              </Button>
              <Button
                onClick={confirmApply}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl"
              >
                Xác nhận gửi hồ sơ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
