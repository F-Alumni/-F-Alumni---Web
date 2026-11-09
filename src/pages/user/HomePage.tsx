import { useState, type FC } from 'react'
import { PostComposer, PostFeedFilters, PostFeed, type PostCategoryFilter } from '@/features/posts'

/**
 * HomePage View Orchestrator.
 * Renders the primary community feed, category filters, and post composer.
 */
export const HomePage: FC = () => {
  const [activeCategory, setActiveCategory] = useState<PostCategoryFilter>('ALL')
  const [selectedCommunity, setSelectedCommunity] = useState<string>('Tất cả cộng đồng')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="space-y-4">
      {/* 1. "What's on your mind?" Post Composer */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* 2. Category & Community Filter Bar */}
      <PostFeedFilters
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        selectedCommunity={selectedCommunity}
        onCommunityChange={setSelectedCommunity}
      />

      {/* 3. Community Feed Stream */}
      <PostFeed
        category={activeCategory}
        community={selectedCommunity}
        refreshTrigger={refreshTrigger}
      />
    </div>
  )
}

export default HomePage
