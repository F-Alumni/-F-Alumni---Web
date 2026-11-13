import { useEffect, type FC, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './button'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  maxWidthClassName?: string
  children: ReactNode
}

export const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  maxWidthClassName = 'max-w-lg',
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Hộp thoại'}
    >
      <div
        className={`w-full ${maxWidthClassName} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
            <div>
              {title && <h3 className="text-sm sm:text-base font-bold text-slate-900">{title}</h3>}
              {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng hộp thoại"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  isLoading?: boolean
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidthClassName="max-w-md">
      <div className="p-5 space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl text-xs font-semibold"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => void onConfirm()}
            className={`rounded-xl text-xs font-bold text-white ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-brand-primary hover:bg-brand-primary-hover'
            }`}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
