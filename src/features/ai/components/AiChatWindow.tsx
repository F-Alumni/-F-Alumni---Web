import { useState, useRef, useEffect, type FC } from 'react'
import {
  IconSparkles,
  IconSend,
  IconX,
  IconMinus,
  IconRefresh,
  IconBook2,
  IconChevronDown,
  IconChevronUp,
  IconRobot,
  IconLoader2,
} from '@tabler/icons-react'
import { Avatar } from '@/components/ui/avatar'
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

  const [isMinimized, setIsMinimized] = useState(false)
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
    if (isOpen && !isMinimized) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, isMinimized, messages, isLoading])

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

  const handleResetChat = (e: React.MouseEvent) => {
    e.stopPropagation()
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
    <div
      className={cn(
        'fixed bottom-0 right-4 sm:right-6 md:right-8 z-50 flex flex-col overflow-hidden rounded-t-2xl border border-slate-200/90 border-b-0 bg-white shadow-2xl transition-all duration-200 animate-in slide-in-from-bottom-5',
        isMinimized
          ? 'h-13 w-[280px] sm:w-[320px] cursor-pointer'
          : 'h-[500px] w-[360px] sm:w-[380px] max-w-[calc(100vw-1.5rem)]'
      )}
    >
      {/* 1. Facebook Messenger-Style Header Bar */}
      <div
        onClick={() => isMinimized && setIsMinimized(false)}
        className="flex h-13 min-h-[52px] items-center justify-between border-b border-slate-100 bg-white px-3.5 py-2 select-none hover:bg-slate-50/60 transition-colors"
      >
        {/* Left: AI Avatar & Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-primary to-orange-400 text-white shadow-xs">
              <IconSparkles className="h-4.5 w-4.5" />
            </div>
            {/* Green active dot */}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-900 truncate">Trợ lý AI FPT</h3>
              <span className="hidden sm:inline-block rounded bg-emerald-50 text-emerald-700 font-bold text-[9px] px-1 py-0.2 border border-emerald-200/80 shrink-0">
                Gemini 2.5 Flash • RAG Boost
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
              <span>Đang hoạt động</span>
            </p>
          </div>
        </div>

        {/* Right: Messenger Window Controls */}
        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleResetChat}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-primary transition-colors"
            title="Làm mới cuộc trò chuyện"
            aria-label="Reset Chat"
          >
            <IconRefresh className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title={isMinimized ? 'Mở rộng cửa sổ' : 'Thu nhỏ'}
            aria-label={isMinimized ? 'Expand' : 'Minimize'}
          >
            <IconMinus className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Đóng cửa sổ chat"
            aria-label="Close"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* When Minimized: Hide body & footer */}
      {!isMinimized && (
        <>
          {/* 2. Messenger Chat Messages Viewport */}
          <div className="no-scrollbar scrollbar-none flex-1 space-y-3 overflow-y-auto p-3 text-xs bg-slate-50/40">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user'

              return (
                <div
                  key={msg.id}
                  className={cn('flex flex-col gap-0.5', isUser ? 'items-end' : 'items-start')}
                >
                  <div
                    className={cn(
                      'flex items-end gap-1.5 max-w-[85%]',
                      isUser && 'flex-row-reverse'
                    )}
                  >
                    {!isUser ? (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-brand-primary font-bold text-[10px]">
                        <IconRobot className="h-3.5 w-3.5" />
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
                        'rounded-2xl px-3.5 py-2 text-xs leading-relaxed whitespace-pre-wrap',
                        isUser
                          ? 'bg-brand-primary text-white rounded-br-xs shadow-2xs'
                          : 'bg-[#F0F2F5] text-slate-900 rounded-bl-xs border border-slate-200/40'
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>

                  {/* Citations Accordion (if response has RAG citations) */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="ml-7 mt-1 max-w-[85%] rounded-xl border border-blue-200/80 bg-blue-50/70 p-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => toggleCitations(msg.id)}
                        className="flex w-full items-center justify-between font-bold text-brand-secondary hover:text-blue-800"
                      >
                        <span className="flex items-center gap-1.5">
                          <IconBook2 className="h-3.5 w-3.5 text-brand-secondary" />
                          Nguồn trích dẫn ({msg.citations.length} tài liệu)
                        </span>
                        {expandedCitationMessageId === msg.id ? (
                          <IconChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <IconChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {expandedCitationMessageId === msg.id && (
                        <div className="mt-1.5 space-y-1.5 border-t border-blue-200/80 pt-1.5">
                          {msg.citations.map((cite, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg bg-white p-2 text-slate-700 shadow-2xs"
                            >
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
                              <p className="mt-1 text-[10px] text-slate-600 line-clamp-2 italic">
                                "{cite.snippet}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <span
                    className={cn(
                      'text-[9px] text-slate-400',
                      isUser ? 'pr-8 text-right' : 'pl-8 text-left'
                    )}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              )
            })}

            {/* AI Typing Loading Indicator */}
            {isLoading && (
              <div className="flex items-end gap-1.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-brand-primary">
                  <IconRobot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-[#F0F2F5] px-3.5 py-2 text-xs text-slate-500 rounded-bl-xs border border-slate-200/40">
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin text-brand-primary" />
                  <span>AI đang soạn câu trả lời...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3. Quick Prompt Chips (Messenger Quick Replies) */}
          {messages.length <= 2 && (
            <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2">
              <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Gợi ý câu hỏi:
              </p>
              <div className="no-scrollbar flex flex-wrap gap-1">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10.5px] font-medium text-slate-700 shadow-2xs transition-colors hover:border-brand-primary hover:text-brand-primary hover:bg-orange-50/40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Messenger-Style Bottom Input Bar */}
          <div className="border-t border-slate-200/90 bg-white p-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void handleSendMessage()
              }}
              className="flex items-center gap-1.5"
            >
              {/* Left Action Icon */}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-brand-primary hover:bg-orange-50 cursor-pointer transition-colors"
                title="Trợ lý AI Gemini Flash"
              >
                <IconSparkles className="h-4.5 w-4.5" />
              </div>

              {/* Pill-shaped Messenger Input Box */}
              <div className="flex-1 rounded-full bg-[#F0F2F5] px-3.5 py-1.5 flex items-center gap-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary/30 focus-within:border focus-within:border-brand-primary transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi Trợ lý AI FPT..."
                  disabled={isLoading}
                  className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                title="Gửi câu hỏi"
                aria-label="Gửi câu hỏi"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white hover:bg-brand-primary-hover disabled:opacity-40 disabled:hover:bg-brand-primary shadow-xs transition-all active:scale-95"
              >
                {isLoading ? (
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <IconSend className="h-3.5 w-3.5" />
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
