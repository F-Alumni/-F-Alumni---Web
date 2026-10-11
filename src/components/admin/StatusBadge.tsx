import type { FC } from 'react'
import { cn } from '@/lib/utils'

export type StatusType =
  | 'verified'
  | 'approved'
  | 'active'
  | 'pending'
  | 'rejected'
  | 'banned'
  | 'urgent'
  | 'new'
  | 'inactive'
  | 'archived'

export interface StatusBadgeProps {
  status: StatusType
  label?: string
  className?: string
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status, label, className }) => {
  const configs: Record<StatusType, { bg: string; text: string; border: string; defaultLabel: string; dot: string }> = {
    verified: {
      bg: 'bg-[#E7F7ED]',
      text: 'text-[#0DB04B]',
      border: 'border-[#0DB04B]/30',
      dot: 'bg-[#0DB04B]',
      defaultLabel: 'Verified',
    },
    approved: {
      bg: 'bg-[#E7F7ED]',
      text: 'text-[#0DB04B]',
      border: 'border-[#0DB04B]/30',
      dot: 'bg-[#0DB04B]',
      defaultLabel: 'Approved',
    },
    active: {
      bg: 'bg-[#E7F7ED]',
      text: 'text-[#0DB04B]',
      border: 'border-[#0DB04B]/30',
      dot: 'bg-[#0DB04B]',
      defaultLabel: 'Active',
    },
    pending: {
      bg: 'bg-[#FFF7ED]',
      text: 'text-[#F27024]',
      border: 'border-[#F27024]/30',
      dot: 'bg-[#F27024]',
      defaultLabel: 'Pending',
    },
    rejected: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-600',
      defaultLabel: 'Rejected',
    },
    banned: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-600',
      defaultLabel: 'Suspended',
    },
    urgent: {
      bg: 'bg-rose-100',
      text: 'text-rose-800',
      border: 'border-rose-300 font-bold',
      dot: 'bg-rose-700 animate-pulse',
      defaultLabel: 'Urgent',
    },
    new: {
      bg: 'bg-sky-50',
      text: 'text-[#0066B2]',
      border: 'border-[#0066B2]/30',
      dot: 'bg-[#0066B2]',
      defaultLabel: 'New',
    },
    inactive: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
      defaultLabel: 'Inactive',
    },
    archived: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
      defaultLabel: 'Archived',
    },
  }

  const config = configs[status] || configs.inactive

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap min-w-[90px]',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dot)} />
      <span className="shrink-0">{label || config.defaultLabel}</span>
    </span>
  )
}
