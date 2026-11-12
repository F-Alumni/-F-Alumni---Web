import { useState, useRef, useEffect, type FC } from 'react'
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Bot,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { aiService, type CitationItem } from '@/services/ai'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  citations?: CitationItem[]
  timestamp: string
}

interface AiChatWindowProps {
  isOpen: boolean
  onClose: () => void
}

const QUICK_PROMPTS = [
  'Quy định và điều kiện thực tập OJT?',
  'Gợi ý cựu sinh viên ngành Kỹ thuật phần mềm?',
  'Quy chế đồ án tốt nghiệp khóa mới?',
  'Chính sách xét học bổng cựu sinh viên?',
]

export const AiChatWindow: FC<AiChatWindowProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuthStore()

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Xin chào ${currentUser?.name || 'bạn'}! 👋\n\nMình là Trợ lý AI FPT Alumni Connect. Mình được huấn luyện để giải đáp các thắc mắc về quy chế đào tạo, định hướng OJT, kết nối mạng lưới cựu sinh viên các ngành (KTPM, QTKD, AI, Ngôn ngữ, TTDPT) và kho tri thức diễn đàn.\n\nBạn đang cần hỗ trợ vấn đề gì hôm nay?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [expandedCitationMessageId, setExpandedCitationMessageId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, messages, isLoading])

  if (!isOpen) return null

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim()
    if (!query || isLoading) return

    const userMsgId = `user-${Date.now()}`
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: timeStr,
    }

    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInput('')
    setIsLoading(true)

    try {
      const res = await aiService.ask({
        question: query,
        conversationId,
        campus: currentUser?.campus || 'FU-HCM',
        major: currentUser?.department || 'SE',
      })

      if (res.conversationId) {
        setConversationId(res.conversationId)
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        citations: res.citations || [],
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, assistantMessage])
      if (res.citations && res.citations.length > 0) {
        setExpandedCitationMessageId(assistantMessage.id)
      }
    } catch (err: unknown) {
      console.error('AI chat failed:', err)
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Xin lỗi bạn, hiện tại hệ thống AI đang bận hoặc đang kết nối lại. Vui lòng thử lại sau giây lát!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetChat = () => {
    setConversationId(null)
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Cuộc trò chuyện đã được làm mới. Bạn có thể hỏi bất kỳ chủ đề học thuật hoặc kết nối cựu sinh viên nào!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const toggleCitations = (msgId: string) => {
    setExpandedCitationMessageId((prev) => (prev === msgId ? null : msgId))
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200">
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-brand-primary via-[#ff782e] to-brand-secondary px-4 py-3 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-xs backdrop-blur-xs">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold leading-none">FPT AI Assistant</h3>
              <Badge className="bg-emerald-400/90 text-emerald-950 px-1.5 py-0 text-[10px] font-bold hover:bg-emerald-400">
                RAG v1.0
              </Badge>
            </div>
            <p className="mt-0.5 text-[11px] text-white/80 font-medium">Hỏi đáp quy chế & Kết nối Alumni</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleResetChat}
            className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            title="Làm mới cuộc trò chuyện"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            title="Đóng cửa sổ chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Chat Messages Viewport */}
      <div className="flex-1 space-y-3.5 overflow-y-auto p-4 text-xs scrollbar-thin scrollbar-thumb-slate-200">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user'

          return (
            <div
              key={msg.id}
              className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}
            >
              <div className={cn('flex items-end gap-2 max-w-[88%]', isUser && 'flex-row-reverse')}>
                {!isUser ? (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <Avatar
                    src={currentUser?.avatarUrl}
                    fallback={(currentUser?.name || 'ME').slice(0, 2).toUpperCase()}
                    className="h-6 w-6 shrink-0"
                  />
                )}

                <div
                  className={cn(
                    'rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap',
                    isUser
                      ? 'bg-gradient-to-r from-brand-primary to-[#ff782e] text-white rounded-br-xs shadow-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'
                  )}
                >
                  {msg.text}
                </div>
              </div>

              {/* Citations Accordion (if response has RAG citations) */}
              {!isUser && msg.citations && msg.citations.length > 0 && (
                <div className="ml-8 mt-1 max-w-[85%] rounded-xl border border-blue-200 bg-blue-50/60 p-2.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => toggleCitations(msg.id)}
                    className="flex w-full items-center justify-between font-bold text-brand-secondary hover:text-blue-800"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-brand-secondary" />
                      Nguồn trích dẫn ({msg.citations.length} tài liệu xác thực)
                    </span>
                    {expandedCitationMessageId === msg.id ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {expandedCitationMessageId === msg.id && (
                    <div className="mt-2 space-y-2 border-t border-blue-200/80 pt-2">
                      {msg.citations.map((cite, idx) => (
                        <div key={idx} className="rounded-lg bg-white/90 p-2 text-slate-700 shadow-2xs">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{cite.sourceTitle}</span>
                            {cite.programCode && (
                              <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] text-slate-600">
                                {cite.programCode}
                              </span>
                            )}
                          </div>
                          {cite.section && (
                            <p className="mt-0.5 font-semibold text-brand-secondary text-[10px]">
                              Mục: {cite.section}
                            </p>
                          )}
                          <p className="mt-1 text-[10px] text-slate-600 line-clamp-3 italic">
                            "{cite.snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <span className="text-[10px] text-slate-400 px-8">{msg.timestamp}</span>
            </div>
          )
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500 rounded-bl-xs border border-slate-200/60">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary" />
              <span>AI đang truy vấn tri thức và trích xuất tài liệu...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Prompt Chips (When not many messages) */}
      {messages.length <= 2 && (
        <div className="border-t border-slate-100 bg-slate-50/70 px-3 py-2">
          <p className="mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Gợi ý câu hỏi:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs transition-colors hover:border-brand-primary hover:text-brand-primary"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Chat Input Form */}
      <div className="border-t border-slate-200 bg-white p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSendMessage()
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi học thuật, OJT hoặc tìm Alumni..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-hidden"
          />

          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isLoading}
            className="h-8.5 w-8.5 shrink-0 rounded-xl bg-brand-primary text-white hover:bg-brand-primary-hover disabled:opacity-50 p-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
