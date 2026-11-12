import type { FC } from 'react'
import { Filter, ChevronDown, Search, Building2, ArrowUpDown, HelpCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PostCategoryFilter =
  'ALL' | 'EXPERIENCES' | 'QUESTIONS' | 'JOBS' | 'INTERNSHIPS' | 'SCHOLARSHIPS'

export type PostSortOption = 'latest' | 'popular'
export type QuestionStatusFilter = 'ALL' | 'UNANSWERED' | 'ANSWERED'

interface PostFeedFiltersProps {
  activeCategory: PostCategoryFilter
  onCategoryChange: (category: PostCategoryFilter) => void
  selectedCommunity: string
  onCommunityChange: (community: string) => void
  selectedCampus?: string
  onCampusChange?: (campus: string) => void
  searchKeyword?: string
  onSearchChange?: (keyword: string) => void
  sortBy?: PostSortOption
  onSortChange?: (sort: PostSortOption) => void
  questionStatus?: QuestionStatusFilter
  onQuestionStatusChange?: (status: QuestionStatusFilter) => void
}

export const PostFeedFilters: FC<PostFeedFiltersProps> = ({
  activeCategory,
  onCategoryChange,
  selectedCommunity,
  onCommunityChange,
  selectedCampus = 'ALL',
  onCampusChange,
  searchKeyword = '',
  onSearchChange,
  sortBy = 'latest',
  onSortChange,
  questionStatus = 'ALL',
  onQuestionStatusChange,
}) => {
  const categories: { id: PostCategoryFilter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'EXPERIENCES', label: 'Kinh nghiệm', count: 24 },
    { id: 'QUESTIONS', label: 'Hỏi đáp Q&A', count: 18 },
    { id: 'JOBS', label: 'Tuyển dụng', count: 12 },
    { id: 'INTERNSHIPS', label: 'Thực tập OJT', count: 9 },
    { id: 'SCHOLARSHIPS', label: 'Học bổng', count: 5 },
  ]

  const communities = [
    'Tất cả cộng đồng',
    'Software Engineering (SE)',
    'Artificial Intelligence (AI)',
    'Information Assurance (IA)',
    'Digital Design (GD)',
    'Business Administration (BA)',
    'International Business (IB)',
  ]

  const campuses = [
    { value: 'ALL', label: 'Tất cả Campus' },
    { value: 'Hòa Lạc', label: 'FU Hòa Lạc' },
    { value: 'Hồ Chí Minh', label: 'FU Hồ Chí Minh' },
    { value: 'Đà Nẵng', label: 'FU Đà Nẵng' },
    { value: 'Cần Thơ', label: 'FU Cần Thơ' },
    { value: 'Quy Nhơn', label: 'FU Quy Nhơn' },
  ]

  return (
    <div className="space-y-2.5">
      {/* Row 1: Horizontal Scrollable Category Filter Pills + Community Dropdown (FO-12) */}
      <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
        {/* Category Filter Tabs */}
        <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                  isActive
                    ? 'shadow-xs bg-brand-primary text-white shadow-brand-primary/20'
                    : 'border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span
                    className={cn(
                      'py-0.2 ml-1.5 rounded-full px-1.5 text-[10px]',
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Community / Major Dropdown Filter (FO-12) */}
        <div className="relative shrink-0">
          <div className="shadow-xs flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedCommunity}
              onChange={(e) => onCommunityChange(e.target.value)}
              className="cursor-pointer appearance-none bg-transparent pr-4 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              {communities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none -ml-3 h-3 w-3 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Row 2: Search Keyword (FO-13), Campus Filter (FO-12), Sort (FO-14) & Question Status (FO-15, FO-16) */}
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        {/* FO-13: Search input */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Tìm bài viết theo tiêu đề, từ khóa (FO-13)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* FO-12: Campus Filter */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">
            <Building2 className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
            <select
              value={selectedCampus}
              onChange={(e) => onCampusChange?.(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              {campuses.map((cp) => (
                <option key={cp.value} value={cp.value}>
                  {cp.label}
                </option>
              ))}
            </select>
          </div>

          {/* FO-14: Sort Option */}
          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">
            <ArrowUpDown className="h-3.5 w-3.5 text-brand-primary shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value as PostSortOption)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="latest">Mới nhất (FO-14)</option>
              <option value="popular">Phổ biến nhất</option>
            </select>
          </div>

          {/* FO-15 & FO-16: Question Status Filter */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => onQuestionStatusChange?.('ALL')}
              className={cn(
                'rounded-lg px-2 py-1 transition-colors',
                questionStatus === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => onQuestionStatusChange?.('UNANSWERED')}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-2 py-1 transition-colors',
                questionStatus === 'UNANSWERED'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-amber-700'
              )}
              title="Lọc câu hỏi chưa có câu trả lời (FO-15)"
            >
              <HelpCircle className="h-3 w-3" />
              <span>Chưa giải đáp</span>
            </button>
            <button
              type="button"
              onClick={() => onQuestionStatusChange?.('ANSWERED')}
              className={cn(
                'inline-flex items-center gap-1 rounded-lg px-2 py-1 transition-colors',
                questionStatus === 'ANSWERED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-emerald-700'
              )}
              title="Lọc câu hỏi đã có lời giải (FO-16)"
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>Đã giải đáp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


