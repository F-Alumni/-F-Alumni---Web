import type { FC } from 'react'
import { Filter, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PostCategoryFilter =
  'ALL' | 'EXPERIENCES' | 'QUESTIONS' | 'JOBS' | 'INTERNSHIPS' | 'SCHOLARSHIPS'

interface PostFeedFiltersProps {
  activeCategory: PostCategoryFilter
  onCategoryChange: (category: PostCategoryFilter) => void
  selectedCommunity: string
  onCommunityChange: (community: string) => void
}

export const PostFeedFilters: FC<PostFeedFiltersProps> = ({
  activeCategory,
  onCategoryChange,
  selectedCommunity,
  onCommunityChange,
}) => {
  const categories: { id: PostCategoryFilter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'EXPERIENCES', label: 'Experiences', count: 24 },
    { id: 'QUESTIONS', label: 'Questions', count: 18 },
    { id: 'JOBS', label: 'Jobs', count: 12 },
    { id: 'INTERNSHIPS', label: 'Internships', count: 9 },
    { id: 'SCHOLARSHIPS', label: 'Scholarships', count: 5 },
  ]

  const communities = [
    'All Communities',
    'Software Engineering (SE)',
    'Artificial Intelligence (AI)',
    'Information Assurance (IA)',
    'Digital Design (GD)',
    'Business Administration (BA)',
    'Startup Founders Hub',
  ]

  return (
    <div className="space-y-3">
      {/* Top Bar: Horizontal Scrollable Category Filter Pills + Community Dropdown */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
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

        {/* Community Dropdown Filter */}
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
    </div>
  )
}


