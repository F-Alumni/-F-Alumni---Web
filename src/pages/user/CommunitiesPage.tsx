import { useState, useEffect, type FC } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Users2,
  Search,
  MessageSquare,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'
import { communitiesService, type ForumCategoryItem } from '@/services/communities'
import { postsService, type ForumPostItem } from '@/services/posts'

interface CommunityGroup {
  id: string
  name: string
  slug: string
  description: string
  discussionCount: number
  bannerGradient: string
}

const BANNER_GRADIENTS = [
  'from-blue-600 via-indigo-600 to-slate-900',
  'from-purple-600 via-brand-primary to-slate-900',
  'from-amber-600 via-orange-600 to-slate-900',
  'from-emerald-600 via-teal-600 to-slate-900',
  'from-slate-800 via-red-900 to-slate-900',
]

function mapCategoryToCommunity(
  cat: ForumCategoryItem,
  idx: number,
  posts: ForumPostItem[]
): CommunityGroup {
  const slugLower = (cat.slug || '').toLowerCase()
  const nameLower = cat.name.toLowerCase()
  const discussionCount = posts.filter((p) => {
    const majorLower = (p.major || '').toLowerCase()
    const ptLower = (p.postType || '').toLowerCase()
    return (
      (majorLower && (nameLower.includes(majorLower) || majorLower.includes(slugLower))) ||
      (ptLower && nameLower.includes(ptLower))
    )
  }).length

  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
    description: cat.description || `Không gian trao đổi chuyên đề ${cat.name} tại Đại học FPT.`,
    discussionCount,
    bannerGradient: BANNER_GRADIENTS[idx % BANNER_GRADIENTS.length]!,
  }
}

export const CommunitiesPage: FC = () => {
  const [searchParams] = useSearchParams()
  const tagParam = searchParams.get('tag')
  const [communities, setCommunities] = useState<CommunityGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (tagParam) {
      setSearchQuery(tagParam.replace(/^#/, ''))
    }
  }, [tagParam])

  const loadCommunities = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [categories, postsRes] = await Promise.all([
        communitiesService.getCategories(),
        postsService.getPosts({ page: 1, pageSize: 50 }).catch(() => ({ items: [] })),
      ])
      const posts = postsRes.items || []
      setCommunities(
        (categories || []).map((cat, idx) => mapCategoryToCommunity(cat, idx, posts))
      )
    } catch (err) {
      console.error('Failed to load communities from ForumService:', err)
      setErrorMessage('Không thể tải danh sách chuyên mục cộng đồng. Vui lòng thử lại.')
      setCommunities([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCommunities()
  }, [])

  const filtered = communities.filter((c) => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      {/* 1. Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-secondary p-6 text-white shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2">
          <Badge className="bg-brand-primary text-white border-none font-bold px-2.5 py-0.5 text-xs">
            Chuyên mục thảo luận & Cộng đồng
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Cộng đồng FPT Alumni & Circles
          </h1>
          <p className="text-xs text-slate-200 leading-relaxed sm:text-sm">
            Khám phá các chuyên mục thảo luận theo lĩnh vực, công nghệ, đồ án và định hướng nghề nghiệp tại Đại học FPT.
          </p>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Users2 className="h-4 w-4 text-brand-primary" />
          <span>{filtered.length} chuyên mục cộng đồng</span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm chuyên mục hoặc từ khóa..."
            className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/40"
          />
        </div>
      </div>

      {/* 3. Community Grid */}
      {isLoading ? (
        <Card className="p-12 text-center bg-white border-slate-200 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
          <span className="text-xs font-medium text-slate-500">Đang tải danh sách chuyên mục cộng đồng...</span>
        </Card>
      ) : errorMessage ? (
        <Card className="p-8 text-center bg-white border-rose-200 space-y-3">
          <AlertCircle className="mx-auto h-7 w-7 text-rose-500" />
          <p className="text-xs font-medium text-rose-600">{errorMessage}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadCommunities()} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center bg-white border-slate-200">
          <p className="text-xs text-slate-500">Không tìm thấy chuyên mục phù hợp.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((comm) => (
            <Card
              key={comm.id}
              className="overflow-hidden border-slate-200/90 bg-white shadow-sm hover:border-brand-primary/30 transition-all flex flex-col justify-between"
            >
              {/* Banner Header */}
              <div className={`relative h-20 w-full bg-gradient-to-r ${comm.bannerGradient} p-3 flex items-start justify-between text-white`}>
                <Badge className="bg-black/30 backdrop-blur-sm text-white border-none text-[10px] font-semibold">
                  #{comm.slug}
                </Badge>
              </div>

              {/* Body */}
              <div className="p-4 pt-0 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-end justify-between -mt-7">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-brand-primary to-amber-500 text-lg font-extrabold text-white shadow-sm">
                      {comm.name.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {comm.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {comm.description}
                    </p>
                  </div>
                </div>

                {/* Footer & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MessageSquare className="h-3.5 w-3.5 text-brand-primary" />
                    {comm.discussionCount} bài viết liên quan
                  </span>

                  <Link
                    to={`${ROUTES.APP.HOME}?q=${encodeURIComponent(comm.name)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-primary-hover hover:underline"
                  >
                    <span>Xem thảo luận</span>
                    <ArrowRight className="h-3 w-3" />
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
