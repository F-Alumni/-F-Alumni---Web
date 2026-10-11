import { useState, type FC } from 'react'
import { IconEye, IconTrash, IconHeart, IconMessageCircle } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { PageHeader, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'

interface PostRecord {
  id: string
  authorName: string
  authorRole: string
  community: string
  title: string
  contentSnippet: string
  likesCount: number
  commentsCount: number
  status: 'active' | 'pending' | 'rejected'
  createdAt: string
}

export const PostsManagementPage: FC = () => {
  const [posts, setPosts] = useState<PostRecord[]>([
    {
      id: 'POST-4831',
      authorName: 'Minh Hoang',
      authorRole: 'Alumni (K12)',
      community: 'Software Engineering (SE)',
      title: 'Tips for passing FPT Software On-the-Job Training (OJT)',
      contentSnippet: 'Sharing my personal journey navigating OJT in Da Nang...',
      likesCount: 142,
      commentsCount: 38,
      status: 'active',
      createdAt: '2026-10-10 10:15',
    },
    {
      id: 'POST-4830',
      authorName: 'Maya Lin',
      authorRole: 'Student (SE \'25)',
      community: 'AI & Robotics',
      title: 'Looking for alumni teammates for FPT Edu Hackathon 2026',
      contentSnippet: 'We are a group of 3 students looking for 1 mentor...',
      likesCount: 56,
      commentsCount: 12,
      status: 'active',
      createdAt: '2026-10-09 20:45',
    },
    {
      id: 'POST-4829',
      authorName: 'Spam Bot 99',
      authorRole: 'Student',
      community: 'General Announcements',
      title: 'Earn easy money with crypto investment link here',
      contentSnippet: 'Join our telegram channel to earn 500% profit...',
      likesCount: 1,
      commentsCount: 0,
      status: 'rejected',
      createdAt: '2026-10-09 19:40',
    },
  ])

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const columns: Column<PostRecord>[] = [
    {
      key: 'title',
      header: 'Post Title & Content',
      render: (p) => (
        <div className="flex flex-col max-w-md">
          <span className="font-bold text-slate-900 line-clamp-1">{p.title}</span>
          <span className="text-[11px] text-slate-500 line-clamp-1">{p.contentSnippet}</span>
        </div>
      ),
    },
    {
      key: 'authorName',
      header: 'Author',
      render: (p) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{p.authorName}</span>
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
          <span className="flex items-center gap-1">
            <IconHeart size={14} stroke={1.8} className="text-rose-500" />
            {p.likesCount}
          </span>
          <span className="flex items-center gap-1">
            <IconMessageCircle size={14} stroke={1.8} className="text-sky-500" />
            {p.commentsCount}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <StatusBadge
          status={p.status}
          label={p.status === 'rejected' ? 'Removed' : 'Published'}
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Posted Date',
      render: (p) => <span className="text-slate-500 text-[11px]">{p.createdAt}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-slate-200 hover:text-brand-primary"
          >
            <IconEye size={14} stroke={1.8} className="mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(p.id)}
            className="h-7 text-xs border-slate-200 text-rose-600 hover:bg-rose-50"
            title="Remove post"
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
      <PageHeader
        title="Post Management"
        description="Monitor user-generated discussions, community articles, and remove policy violations."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Post Management' },
        ]}
      />

      <DataTable
        data={posts}
        columns={columns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search post titles or authors..."
        searchFilter={(p, q) =>
          p.title.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.community.toLowerCase().includes(q)
        }
      />
    </div>
  )
}

export default PostsManagementPage
