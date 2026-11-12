import { useState, useEffect, type FC } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare, Calendar } from 'lucide-react'
import {
  PostComposer,
  PostFeedFilters,
  PostFeed,
  type PostCategoryFilter,
  type PostSortOption,
  type QuestionStatusFilter,
} from '@/features/posts'
import { EventsSection } from '@/features/events'

export type HomeTab = 'FEED' | 'EVENTS'

/**
 * HomePage View Orchestrator.
 * Renders the primary community feed, category filters, and events stream.
 */
export const HomePage: FC = () => {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<HomeTab>('FEED')
  const [activeCategory, setActiveCategory] = useState<PostCategoryFilter>('ALL')
  const [selectedCommunity, setSelectedCommunity] = useState<string>('Tất cả cộng đồng')
  const [selectedCampus, setSelectedCampus] = useState<string>('ALL')
  const [searchKeyword, setSearchKeyword] = useState<string>(searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState<PostSortOption>('latest')
  const [questionStatus, setQuestionStatus] = useState<QuestionStatusFilter>('ALL')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const qParam = searchParams.get('q')
    if (qParam !== null) {
      setSearchKeyword(qParam)
      setActiveTab('FEED')
    }
    if (searchParams.get('compose') === 'true') {
      setActiveTab('FEED')
      setTimeout(() => {
        const composerEl = document.getElementById('post-composer')
        if (composerEl) {
          composerEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
          const textarea = composerEl.querySelector('textarea')
          textarea?.focus()
        }
      }, 150)
    }
  }, [searchParams])

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-4">
      {/* 1. Main Feed vs Events Switcher */}
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('FEED')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
            activeTab === 'FEED'
              ? 'bg-gradient-to-r from-brand-primary to-[#ff782e] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Bảng tin & Thảo luận</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EVENTS')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
            activeTab === 'EVENTS'
              ? 'bg-gradient-to-r from-brand-secondary to-[#004e8a] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Sự kiện & Workshop (RSVP)</span>
        </button>
      </div>

      {activeTab === 'FEED' ? (
        <>
          {/* 2. "What's on your mind?" Post Composer */}
          <PostComposer onPostCreated={handlePostCreated} />

          {/* 3. Category, Community, Campus, Search, Sort & Question Status Filter Bar */}
          <PostFeedFilters
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            selectedCommunity={selectedCommunity}
            onCommunityChange={setSelectedCommunity}
            selectedCampus={selectedCampus}
            onCampusChange={setSelectedCampus}
            searchKeyword={searchKeyword}
            onSearchChange={setSearchKeyword}
            sortBy={sortBy}
            onSortChange={setSortBy}
            questionStatus={questionStatus}
            onQuestionStatusChange={setQuestionStatus}
          />

          {/* 4. Community Feed Stream */}
          <PostFeed
            category={activeCategory}
            community={selectedCommunity}
            campus={selectedCampus}
            searchKeyword={searchKeyword}
            sortBy={sortBy}
            questionStatus={questionStatus}
            refreshTrigger={refreshTrigger}
          />
        </>
      ) : (
        /* Events & Workshops Stream */
        <EventsSection />
      )}
    </div>
  )
}

export default HomePage
