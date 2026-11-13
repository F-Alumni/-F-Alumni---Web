import { useState, useEffect, type FC } from 'react'
import { useSearchParams } from 'react-router-dom'
import { IconSparkles } from '@tabler/icons-react'
import { AiChatWindow } from './AiChatWindow'

export const FloatingAiWidget: FC = () => {
  const [searchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('ai') === 'open') {
      setIsOpen(true)
    }
  }, [searchParams])

  return (
    <>
      {/* 1. Facebook Messenger-Style AI Chat Window */}
      <AiChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* 2. Floating Action Bubble Launcher (Visible when Chat Window is Closed) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in zoom-in duration-200">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-brand-primary via-[#ff782e] to-brand-secondary p-0 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95 focus:outline-hidden"
            title="Mở Trợ lý AI FPT Alumni (Messenger style)"
            aria-label="FPT AI Assistant"
          >
            {/* Animated Glow Halo */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary opacity-40 blur-sm transition-all duration-300 group-hover:opacity-75 animate-pulse" />

            {/* Button Icon */}
            <div className="relative flex items-center justify-center">
              <IconSparkles className="h-7 w-7 text-white transition-transform duration-300 group-hover:rotate-12" />
            </div>

            {/* Online status indicator dot */}
            <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 ring-1 ring-emerald-400/50" />
          </button>
        </div>
      )}
    </>
  )
}
