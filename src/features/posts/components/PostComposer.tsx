import { useState, type FC } from 'react'
import {
  Sparkles,
  HelpCircle,
  Briefcase,
  Award,
  Image as ImageIcon,
  Paperclip,
  Send,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface PostComposerProps {
  onPostCreated?: (content: string) => void
}

export const PostComposer: FC<PostComposerProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState<string>('EXPERIENCE')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = () => {
    if (!content.trim()) return
    onPostCreated?.(content)
    setContent('')
    setIsExpanded(false)
  }

  const postTypes = [
    { id: 'EXPERIENCE', label: 'Experiences', icon: Sparkles, color: 'text-amber-500' },
    { id: 'QUESTION', label: 'Q&A', icon: HelpCircle, color: 'text-brand-secondary' },
    { id: 'JOB', label: 'Jobs & OJT', icon: Briefcase, color: 'text-brand-accent' },
    { id: 'SCHOLARSHIP', label: 'Scholarships', icon: Award, color: 'text-brand-primary' },
  ]

  return (
    <Card className="overflow-hidden border-slate-200/90 bg-white shadow-sm transition-all">
      <div className="p-4">
        {/* Top: Avatar & Composer Input */}
        <div className="flex items-start gap-3">
          <Avatar
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
            fallback="ML"
            size="md"
            isVerified
            isOnline
          />

          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Chia sẻ cơ hội việc làm, Experiences phỏng vấn, hoặc đặt câu hỏi cho cộng đồng cựu sinh viên FPT..."
              rows={isExpanded ? 3 : 2}
              className="w-full resize-none rounded-xl border-0 bg-slate-50/80 p-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/40"
            />
          </div>
        </div>

        {/* Bottom Options Toolbar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          {/* Post Type Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {postTypes.map((type) => {
              const Icon = type.icon
              const isSelected = selectedType === type.id
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(type.id)
                    setIsExpanded(true)
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'shadow-xs bg-slate-900 text-white'
                      : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : type.color}`} />
                  <span>{type.label}</span>
                </button>
              )
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="Add Image"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="Attach File"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <Button
              onClick={handleSubmit}
              disabled={!content.trim()}
              size="sm"
              className="shadow-xs rounded-full bg-brand-primary px-4 text-xs font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-40"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Post
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}


