import { useState, useEffect, useMemo, type FC } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  IconSearch,
  IconArrowRight,
  IconLoader2,
  IconBuildingCommunity,
} from '@tabler/icons-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'
import { communitiesService, type ForumCategoryItem } from '@/services/communities'

interface CommunityGroup {
  id: string
  name: string
  tag: string
  category: string
  description: string
  bannerGradient: string
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
    bannerGradient: BANNER_GRADIENTS[idx % BANNER_GRADIENTS.length]!,
  }
}

export const CommunitiesPage: FC = () => {
  const [searchParams] = useSearchParams()
  const tagParam = searchParams.get('tag')
  const [communities, setCommunities] = useState<CommunityGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

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

  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(communities.map((c) => c.category)))
    return ['All', ...cats]
  }, [communities])

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
      {/* 1. Unified Page Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-secondary/10 text-brand-secondary">
            <IconBuildingCommunity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Cộng đồng FPT Circles</h1>
              <span className="rounded-full bg-brand-secondary/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-secondary">
                {communities.length} nhóm
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Khám phá các nhóm thảo luận theo chuyên ngành, công nghệ, đồ án và câu lạc bộ sinh viên ĐH FPT.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Unified Controls & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
        {/* Dynamic Category Filter Chips from Backend */}
        <div className="flex flex-wrap items-center gap-1.5">
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {cat === 'All' ? 'Tất cả nhóm' : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc #hashtag..."
              className="h-8.5 w-full rounded-xl border border-slate-200/90 bg-slate-50/70 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 3. Community Grid */}
      {isLoading ? (
        <Card className="p-12 text-center bg-white border-slate-200 flex items-center justify-center gap-2">
          <IconLoader2 className="h-5 w-5 animate-spin text-brand-primary" />
          <span className="text-xs font-medium text-slate-500">Đang tải danh sách chuyên mục cộng đồng...</span>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center bg-white border-slate-200">
          <IconBuildingCommunity className="mx-auto h-8 w-8 text-slate-300 mb-2" />
          <p className="text-xs font-medium text-slate-500">Không tìm thấy nhóm cộng đồng phù hợp.</p>
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
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 hover:text-brand-primary transition-colors">
                    {comm.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mt-1.5 leading-relaxed">
                    {comm.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Kênh thảo luận công khai
                  </span>

                  <Link
                    to={`${ROUTES.APP.HOME}?tag=${encodeURIComponent(comm.tag)}`}
                    title="Khám phá thảo luận nhóm này"
                    aria-label="Khám phá"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-hover hover:underline"
                  >
                    <span>Khám phá thảo luận</span>
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
