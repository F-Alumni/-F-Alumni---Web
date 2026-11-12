import { useState, useEffect, type FC } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Users2,
  Search,
  MessageSquare,
  CheckCircle2,
  Plus,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'
import { communitiesService, type ForumCategoryItem } from '@/services/communities'

interface CommunityGroup {
  id: string
  name: string
  tag: string
  category: string
  description: string
  memberCount: number
  discussionCount: number
  isJoined?: boolean
  bannerGradient: string
  avatarUrl: string
  topContributors: string[]
}

const BANNER_GRADIENTS = [
  'from-blue-600 via-indigo-600 to-slate-900',
  'from-purple-600 via-brand-primary to-slate-900',
  'from-amber-600 via-orange-600 to-slate-900',
  'from-emerald-600 via-teal-600 to-slate-900',
  'from-slate-800 via-red-900 to-slate-900',
]

function mapCategoryToCommunity(cat: ForumCategoryItem, idx: number): CommunityGroup {
  return {
    id: cat.id,
    name: cat.name,
    tag: `#${cat.slug || cat.name.replace(/\s+/g, '-')}`,
    category: cat.name,
    description: cat.description || `Cộng đồng thảo luận chuyên ngành ${cat.name} tại Đại học FPT.`,
    memberCount: 0,
    discussionCount: 0,
    isJoined: false,
    bannerGradient: BANNER_GRADIENTS[idx % BANNER_GRADIENTS.length]!,
    avatarUrl: 'https://images.unsplash.com/photo-1522071823999-b867e9b049d5?auto=format&fit=crop&q=80&w=128',
    topContributors: [],
  }
}

export const CommunitiesPage: FC = () => {
  const [searchParams] = useSearchParams()
  const tagParam = searchParams.get('tag')
  const [communities, setCommunities] = useState<CommunityGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCommName, setNewCommName] = useState('')
  const [newCommDesc, setNewCommDesc] = useState('')
  const [newCommCategory, setNewCommCategory] = useState('Kỹ thuật phần mềm')
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  useEffect(() => {
    if (tagParam) {
      setSearchQuery(tagParam)
    }
  }, [tagParam])

  useEffect(() => {
    const loadCommunities = async () => {
      setIsLoading(true)
      try {
        const categories = await communitiesService.getCategories()
        setCommunities((categories || []).map(mapCategoryToCommunity))
      } catch (err) {
        console.error('Failed to load communities from ForumService:', err)
        setCommunities([])
      } finally {
        setIsLoading(false)
      }
    }
    void loadCommunities()
  }, [])

  const toggleJoin = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const isJoined = !c.isJoined
          return {
            ...c,
            isJoined,
            memberCount: isJoined ? c.memberCount + 1 : c.memberCount - 1,
          }
        }
        return c
      })
    )
  }

  const handleCreateCommunity = () => {
    if (!newCommName.trim()) return
    const newComm: CommunityGroup = {
      id: `comm-${Date.now()}`,
      name: newCommName.trim(),
      tag: `#${newCommName.trim().replace(/\s+/g, '-')}`,
      category: newCommCategory,
      description: newCommDesc.trim() || 'Cộng đồng kết nối sinh viên và cựu sinh viên FPT.',
      memberCount: 1,
      discussionCount: 0,
      isJoined: true,
      bannerGradient: 'from-brand-primary via-orange-600 to-slate-900',
      avatarUrl: 'https://images.unsplash.com/photo-1522071823999-b867e9b049d5?auto=format&fit=crop&q=80&w=128',
      topContributors: [],
    }
    setCommunities((prev) => [newComm, ...prev])
    setShowCreateModal(false)
    setNewCommName('')
    setNewCommDesc('')
    setSuccessBanner(`Đã khởi tạo thành công cộng đồng "${newComm.name}"!`)
    setTimeout(() => setSuccessBanner(null), 4000)
  }

  const filtered = communities.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="space-y-4">
      {/* 1. Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-secondary p-6 text-white shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2">
          <Badge className="bg-brand-primary text-white border-none font-bold px-2.5 py-0.5 text-xs">
            Cộng đồng chuyên môn & Hứng thú
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Cộng đồng FPT Alumni & Circles
          </h1>
          <p className="text-xs text-slate-200 leading-relaxed sm:text-sm">
            Tham gia các nhóm thảo luận theo chuyên ngành, công nghệ, đồ án và câu lạc bộ. Cùng cựu sinh viên chia sẻ kinh nghiệm và phát triển sự nghiệp.
          </p>
        </div>
      </div>

      {successBanner && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* 2. Controls & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1">
          {['All', 'Kỹ thuật phần mềm', 'Trí tuệ nhân tạo', 'Khởi nghiệp & Đầu tư', 'Học thuật & Đồ án', 'An toàn thông tin'].map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat === 'All' ? 'Tất cả nhóm' : cat}
              </button>
            )
          )}
        </div>

        {/* Actions & Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc #hashtag..."
              className="h-8 w-full rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/40"
            />
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="h-8 rounded-full bg-brand-secondary hover:bg-slate-800 text-white text-xs font-bold px-3 shrink-0"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Tạo nhóm
          </Button>
        </div>
      </div>

      {/* 3. Community Grid */}
      {isLoading ? (
        <Card className="p-12 text-center bg-white border-slate-200 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
          <span className="text-xs font-medium text-slate-500">Đang tải danh sách chuyên mục cộng đồng...</span>
        </Card>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((comm) => (
          <Card
            key={comm.id}
            className="overflow-hidden border-slate-200/90 bg-white shadow-xs hover:border-brand-primary/30 transition-all flex flex-col justify-between"
          >
            {/* Banner Header */}
            <div className={`relative h-20 w-full bg-gradient-to-r ${comm.bannerGradient} p-3 flex items-start justify-between text-white`}>
              <Badge className="bg-black/30 backdrop-blur-xs text-white border-none text-[10px] font-semibold">
                {comm.category}
              </Badge>
              <span className="text-[11px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                {comm.tag}
              </span>
            </div>

            {/* Body */}
            <div className="p-4 pt-0 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                {/* Avatar & Title */}
                <div className="flex items-end justify-between -mt-7">
                  <img
                    src={comm.avatarUrl}
                    alt={comm.name}
                    className="h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-sm bg-white"
                  />
                  <Button
                    onClick={() => toggleJoin(comm.id)}
                    variant={comm.isJoined ? 'secondary' : 'default'}
                    className={`h-8 rounded-full text-xs font-bold px-3 transition-all ${
                      comm.isJoined
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                    }`}
                  >
                    {comm.isJoined ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Đã tham gia
                      </span>
                    ) : (
                      '+ Tham gia'
                    )}
                  </Button>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 hover:text-brand-primary transition-colors">
                    {comm.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {comm.description}
                  </p>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Users2 className="h-3.5 w-3.5 text-brand-secondary" />
                    {comm.memberCount.toLocaleString()} thành viên
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-brand-primary" />
                    {comm.discussionCount} bài viết
                  </span>
                </div>

                <Link
                  to={`${ROUTES.APP.HOME}?tag=${encodeURIComponent(comm.tag)}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-primary-hover hover:underline"
                >
                  <span>Khám phá</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}

      {/* 4. Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Khởi tạo Cộng đồng Mới</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên cộng đồng:
                </label>
                <input
                  type="text"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="Ví dụ: FPT FinTech & Blockchain Enthusiasts"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chuyên mục:
                </label>
                <select
                  value={newCommCategory}
                  onChange={(e) => setNewCommCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="Kỹ thuật phần mềm">Kỹ thuật phần mềm</option>
                  <option value="Trí tuệ nhân tạo">Trí tuệ nhân tạo</option>
                  <option value="Khởi nghiệp & Đầu tư">Khởi nghiệp & Đầu tư</option>
                  <option value="Học thuật & Đồ án">Học thuật & Đồ án</option>
                  <option value="An toàn thông tin">An toàn thông tin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả mục tiêu hoạt động:
                </label>
                <textarea
                  rows={3}
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  placeholder="Mô tả tôn chỉ và đối tượng tham gia nhóm..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                className="text-xs rounded-xl"
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateCommunity}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl"
              >
                Tạo nhóm ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
