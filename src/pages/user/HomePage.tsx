import { useState, useEffect, type FC } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import {
  PostComposer,
  PostFeedFilters,
  PostFeed,
  type PostCategoryFilter,
  type PostSortOption,
  type QuestionStatusFilter,
} from '@/features/posts'

/**
 * HomePage View Orchestrator.
 * Renders the primary community feed, category filters, and post composer.
 */
export const HomePage: FC = () => {
  const [searchParams] = useSearchParams()
  const { id, postId } = useParams<{ id?: string; postId?: string }>()
  const targetPostId = id || postId

  const [activeCategory, setActiveCategory] = useState<PostCategoryFilter>('ALL')
  const [selectedCommunity, setSelectedCommunity] = useState<string>('ALL')
  const [selectedCampus, setSelectedCampus] = useState<string>('ALL')
  const [searchKeyword, setSearchKeyword] = useState<string>(searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState<PostSortOption>('latest')
  const [questionStatus, setQuestionStatus] = useState<QuestionStatusFilter>('ALL')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const qParam = searchParams.get('q')
    if (qParam !== null) {
      setSearchKeyword(qParam)
    }
    if (searchParams.get('compose') === 'true') {
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
      {/* 1. Category, Community, Campus, Search, Sort & Question Status Filter Bar */}
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

      {/* 2. "What's on your mind?" Post Composer */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* 3. Community Feed Stream */}
      <PostFeed
        targetPostId={targetPostId}
        category={activeCategory}
        community={selectedCommunity}
        campus={selectedCampus}
        searchKeyword={searchKeyword}
        sortBy={sortBy}
        questionStatus={questionStatus}
        refreshTrigger={refreshTrigger}
      />
    </div>
  )
}

export default HomePage
