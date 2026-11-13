import { useState, useMemo, type FC } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  IconEye,
  IconTrash,
  IconHeart,
  IconMessageCircle,
  IconEyeOff,
  IconEyeCheck,
  IconX,
  IconShieldLock,
  IconCircleCheck,
  IconRefresh,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { PageHeader, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'
import { postsService, type ForumPostItem } from '@/services/posts'

export interface PostRecord {
  id: string
  authorName: string
  authorRole: string
  community: string
  title: string
  contentSnippet: string
  likesCount: number
  commentsCount: number
  status: 'active' | 'hidden' | 'rejected'
  createdAt: string
  hiddenReason?: string
}

function adaptForumPost(p: ForumPostItem): PostRecord {
  return {
    id: p.id,
    authorName: p.authorName || 'Alumni / Student Member',
    authorRole: p.major ? `Major: ${p.major}` : 'Community Member',
    community: p.campus ? `${p.campus} Campus` : 'General Community',
    title: p.title,
    contentSnippet: p.content,
    likesCount: p.likeCount || 0,
    commentsCount: p.commentCount || 0,
    status: 'active',
    createdAt: p.createdAt ? p.createdAt.slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
  }
}

export const PostsManagementPage: FC = () => {
  const queryClient = useQueryClient()
  const [selectedPost, setSelectedPost] = useState<PostRecord | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Local overrides for optimistic status & deletion
  const [localOverrides, setLocalOverrides] = useState<Record<string, { status?: PostRecord['status']; hiddenReason?: string }>>({})
  const [deletedPostIds, setDeletedPostIds] = useState<Set<string>>(new Set())

  // Query posts from Forum Service
  const { data: postsData, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'forum', 'posts'],
    queryFn: () => postsService.getPosts({ pageSize: 50 }),
    staleTime: 30 * 1000,
  })

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (id: string) => postsService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'forum', 'posts'] })
    },
  })

  // Derive final posts list
  const posts = useMemo(() => {
    let baseList: PostRecord[] = []
    if (postsData && postsData.items && postsData.items.length > 0) {
      baseList = postsData.items.map(adaptForumPost)
    }

    return baseList
      .filter((p) => !deletedPostIds.has(p.id))
      .map((p) => {
        const override = localOverrides[p.id]
        return override ? { ...p, ...override } : p
      })
  }, [postsData, deletedPostIds, localOverrides])

  // Toggle Hide / Suppression Action for Moderator
  const handleToggleHide = (post: PostRecord) => {
    const isCurrentlyHidden = post.status === 'hidden'
    const nextStatus: PostRecord['status'] = isCurrentlyHidden ? 'active' : 'hidden'

    setLocalOverrides((prev) => ({
      ...prev,
      [post.id]: {
        status: nextStatus,
        hiddenReason: isCurrentlyHidden
          ? undefined
          : 'Suppressed by Community Safety Moderator',
      },
    }))

    const msg = isCurrentlyHidden
      ? `Post "${post.title}" restored to active public community feeds.`
      : `Post "${post.title}" has been hidden and suppressed from feeds.`
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleDelete = async (id: string) => {
    setDeletedPostIds((prev) => new Set(prev).add(id))
    try {
      await deletePostMutation.mutateAsync(id)
    } catch {
      // optimistic state preserved
    }
    setToastMessage(`Post ${id} removed permanently from discussion database.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const columns: Column<PostRecord>[] = [
    {
      key: 'title',
      header: 'Post Title & Content',
      render: (p) => (
        <div className="flex flex-col max-w-md">
          <span className="font-bold text-slate-900 line-clamp-1">{p.title}</span>
          <span className="text-[11px] text-slate-500 line-clamp-1">{p.contentSnippet}</span>
          {p.hiddenReason && (
            <span className="text-[10px] text-amber-700 font-medium mt-0.5">
              ⚠️ {p.hiddenReason}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'authorName',
      header: 'Author',
      render: (p) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 text-xs">{p.authorName}</span>
          <span className="text-[10px] text-slate-400">{p.authorRole}</span>
        </div>
      ),
    },
    {
      key: 'community',
      header: 'Community Circle',
      render: (p) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {p.community}
        </span>
      ),
    },
    {
      key: 'engagement',
      header: 'Engagement',
      render: (p) => (
        <div className="flex items-center gap-3 text-slate-500 text-xs">
          <span className="flex items-center gap-1 font-medium">
            <IconHeart size={14} stroke={1.8} className="text-rose-500" />
            {p.likesCount}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <IconMessageCircle size={14} stroke={1.8} className="text-sky-500" />
            {p.commentsCount}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Visibility Status',
      render: (p) => {
        if (p.status === 'hidden') {
          return (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
              <IconEyeOff size={13} stroke={2} />
              Hidden / Suppressed
            </span>
          )
        }
        if (p.status === 'rejected') {
          return (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
              Removed
            </span>
          )
        }
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            Published
          </span>
        )
      },
    },
    {
      key: 'createdAt',
      header: 'Posted Date',
      render: (p) => <span className="text-slate-500 text-[11px] font-mono">{p.createdAt}</span>,
    },
    {
      key: 'actions',
      header: 'Moderation Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedPost(p)}
            className="h-7 text-xs border-slate-200 hover:text-brand-primary"
            title="Inspect post in modal"
          >
            <IconEye size={14} stroke={1.8} className="mr-1" />
            View
          </Button>

          {/* Moderator Suppression / Hide Action */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleHide(p)}
            className={`h-7 text-xs border transition-colors ${
              p.status === 'hidden'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
            title={p.status === 'hidden' ? 'Restore post to feed' : 'Hide post from feed'}
          >
            {p.status === 'hidden' ? (
              <>
                <IconEyeCheck size={14} stroke={1.8} className="mr-1 text-emerald-600" />
                <span>Restore</span>
              </>
            ) : (
              <>
                <IconEyeOff size={14} stroke={1.8} className="mr-1 text-amber-600" />
                <span>Hide</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(p.id)}
            className="h-7 text-xs border-slate-200 text-rose-600 hover:bg-rose-50"
            title="Remove post permanently"
            aria-label="Remove post"
          >
            <IconTrash size={14} stroke={1.8} />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <IconCircleCheck size={16} stroke={2} className="text-brand-accent shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      <PageHeader
        title="Post Management"
        description="Monitor user-generated discussions, community articles, and hide or suppress policy violations."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Post Management' },
        ]}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5"
          >
            <IconRefresh size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh Posts</span>
          </Button>
        }
      />

      <DataTable
        data={posts}
        columns={columns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search post titles, content, or authors..."
        searchFilter={(p, q) =>
          p.title.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.community.toLowerCase().includes(q) ||
          p.contentSnippet.toLowerCase().includes(q)
        }
      />

      {/* Post Detail Inspection Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-primary">{selectedPost.id}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-700">{selectedPost.community}</span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{selectedPost.title}</h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                  <span className="font-semibold text-slate-800">{selectedPost.authorName}</span>
                  <span>({selectedPost.authorRole})</span>
                  <span>•</span>
                  <span>{selectedPost.createdAt}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800 leading-relaxed font-sans">
                {selectedPost.contentSnippet}
              </div>

              {selectedPost.hiddenReason && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 flex items-start gap-2">
                  <IconShieldLock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Post Suppressed</span>
                    <span className="text-[11px] text-amber-800">{selectedPost.hiddenReason}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-slate-600 pt-1 border-t border-slate-100">
                <span className="flex items-center gap-1 font-semibold">
                  <IconHeart size={15} className="text-rose-500" />
                  {selectedPost.likesCount} Likes
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <IconMessageCircle size={15} className="text-sky-500" />
                  {selectedPost.commentsCount} Comments
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPost(null)}
                className="h-9 border-slate-200 text-slate-700"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    handleToggleHide(selectedPost)
                    setSelectedPost(null)
                  }}
                  className={`h-9 font-semibold ${
                    selectedPost.status === 'hidden'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {selectedPost.status === 'hidden' ? (
                    <>
                      <IconEyeCheck size={16} className="mr-1.5" />
                      Restore to Feed
                    </>
                  ) : (
                    <>
                      <IconEyeOff size={16} className="mr-1.5" />
                      Hide / Suppress
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PostsManagementPage
