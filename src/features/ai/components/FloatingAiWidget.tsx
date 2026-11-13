import { useState, useEffect, type FC } from 'react'
import { useSearchParams, useLocation } from 'react-router-dom'
import { Sparkles, MessageSquareCode } from 'lucide-react'
import { AiChatWindow } from './AiChatWindow'
import { ROUTES } from '@/constants/routes'

export const FloatingAiWidget: FC = () => {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('ai') === 'open') {
      setIsOpen(true)
    }
  }, [searchParams])

  // Do not cover ChatPage's Send button on desktop/mobile
  if (location.pathname.startsWith(ROUTES.APP.CHAT) && !isOpen) {
    return null
  }

  return (
    <>
      <AiChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-gradient-to-tr from-brand-primary via-[#ff782e] to-brand-secondary p-0 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          title="Mở Trợ lý AI FPT Alumni Connect"
          aria-label="FPT AI Assistant"
        >
          <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary opacity-40 blur-sm transition-all duration-300 group-hover:opacity-75 animate-pulse" />

          <div className="relative flex items-center justify-center">
            {isOpen ? (
              <MessageSquareCode className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            ) : (
              <Sparkles className="h-6 w-6 lg:h-7 lg:w-7 text-white transition-transform duration-300 group-hover:rotate-12" />
            )}
          </div>

          <span className="absolute right-0.5 top-0.5 h-3 w-3 lg:h-3.5 lg:w-3.5 rounded-full border-2 border-white bg-emerald-500" />
        </button>
      </div>
    </>
  )
}
