import type { FC } from 'react'
import {
  IconSchool,
  IconChevronDown,
  IconSearch,
  IconBuilding,
  IconArrowsSort,
  IconHelpCircle,
  IconCircleCheck,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

export type PostCategoryFilter = 'ALL' | 'EXPERIENCES' | 'QUESTIONS' | 'JOBS'
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
  // Real Backend PostType filters: Sharing, Question, Recruitment (All = empty/undefined)
  const categories: { id: PostCategoryFilter; label: string }[] = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'EXPERIENCES', label: 'Kinh nghiệm' },
    { id: 'QUESTIONS', label: 'Hỏi đáp Q&A' },
    { id: 'JOBS', label: 'Tuyển dụng' },
  ]

  // Real Backend Major query parameters: SE, AI, IA, GD, IB, BA
  const majors = [
    { value: 'ALL', label: 'Tất cả chuyên ngành' },
    { value: 'SE', label: 'Kỹ thuật phần mềm (SE)' },
    { value: 'AI', label: 'Trí tuệ nhân tạo (AI)' },
    { value: 'IA', label: 'An toàn thông tin (IA)' },
    { value: 'GD', label: 'Thiết kế mỹ thuật số (GD)' },
    { value: 'IB', label: 'Kinh doanh quốc tế (IB)' },
    { value: 'BA', label: 'Quản trị kinh doanh (BA)' },
  ]

  // Real Backend Campus query parameters: FU-HL, FU-HCM, FU-DN, FU-CT, FU-QN
  const campuses = [
    { value: 'ALL', label: 'Tất cả cơ sở' },
    { value: 'FU-HL', label: 'FU Hòa Lạc' },
    { value: 'FU-HCM', label: 'FU Hồ Chí Minh' },
    { value: 'FU-DN', label: 'FU Đà Nẵng' },
    { value: 'FU-CT', label: 'FU Cần Thơ' },
    { value: 'FU-QN', label: 'FU Quy Nhơn' },
  ]

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs space-y-2.5">
      {/* Row 1: PostType Category Tabs + Major Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* PostType Filter Tabs (100% matched with Backend PostType values) */}
        <div className="no-scrollbar scrollbar-none flex items-center gap-1.5 overflow-x-auto py-0.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-brand-primary text-white shadow-xs shadow-brand-primary/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                )}
              >
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Backend Major (Chuyên ngành) Dropdown Filter */}
        <div className="relative shrink-0">
          <div className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 transition-colors hover:bg-slate-100">
            <IconSchool className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
            <select
              value={selectedCommunity}
              onChange={(e) => onCommunityChange(e.target.value)}
              className="cursor-pointer appearance-none bg-transparent pr-4 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              {majors.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <IconChevronDown className="pointer-events-none -ml-3 h-3 w-3 text-slate-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="h-px bg-slate-100" />

      {/* Row 2: Search (search), Campus (campus), Sort (sort) & Answer Status (isAnswered) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Backend Search Input (FO-13 query: search) */}
        <div className="relative flex-1 min-w-[180px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Tìm kiếm bài viết theo tiêu đề, từ khóa..."
            className="w-full h-8 rounded-xl border border-slate-200/90 bg-slate-50/70 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        {/* Backend Query Parameters Filters */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {/* Backend Campus Filter (FO-12 query: campus) */}
          <div className="inline-flex h-8 items-center gap-1 rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 text-xs text-slate-700">
            <IconBuilding className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
            <select
              value={selectedCampus}
              onChange={(e) => onCampusChange?.(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              {campuses.map((cp) => (
                <option key={cp.value} value={cp.value}>
                  {cp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Backend Sort Option (FO-14 query: sort) */}
          <div className="inline-flex h-8 items-center gap-1 rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 text-xs text-slate-700">
            <IconArrowsSort className="h-3.5 w-3.5 text-brand-primary shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange?.(e.target.value as PostSortOption)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="latest">Mới nhất</option>
              <option value="popular">Phổ biến</option>
            </select>
          </div>

          {/* Backend Question Answer Status Filter (FO-15, FO-16 query: isAnswered) */}
          <div className="inline-flex h-8 items-center rounded-xl border border-slate-200/90 bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onQuestionStatusChange?.('ALL')}
              title="Tất cả câu hỏi"
              aria-label="Tất cả câu hỏi"
              className={cn(
                'h-7 rounded-lg px-2 text-[11px] transition-colors',
                questionStatus === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => onQuestionStatusChange?.('UNANSWERED')}
              className={cn(
                'inline-flex h-7 items-center justify-center rounded-lg px-2 text-[11px] transition-colors gap-1',
                questionStatus === 'UNANSWERED'
                  ? 'bg-amber-500 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-amber-700'
              )}
              title="Lọc câu hỏi chưa giải đáp (isAnswered=false)"
              aria-label="Chưa giải đáp"
            >
              <IconHelpCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Chưa giải</span>
            </button>
            <button
              type="button"
              onClick={() => onQuestionStatusChange?.('ANSWERED')}
              className={cn(
                'inline-flex h-7 items-center justify-center rounded-lg px-2 text-[11px] transition-colors gap-1',
                questionStatus === 'ANSWERED'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-emerald-700'
              )}
              title="Lọc câu hỏi đã có lời giải (isAnswered=true)"
              aria-label="Đã giải đáp"
            >
              <IconCircleCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Đã giải</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
