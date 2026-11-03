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
      bg: 'bg-[#F0FDF4]',
      text: 'text-[#15803D]',
      border: 'border-[#15803D]/25',
      dot: 'bg-[#15803D]',
      defaultLabel: 'Verified',
    },
    approved: {
      bg: 'bg-[#F0FDF4]',
      text: 'text-[#15803D]',
      border: 'border-[#15803D]/25',
      dot: 'bg-[#15803D]',
      defaultLabel: 'Approved',
    },
    active: {
      bg: 'bg-[#F0FDF4]',
      text: 'text-[#15803D]',
      border: 'border-[#15803D]/25',
      dot: 'bg-[#15803D]',
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
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#DC2626]',
      border: 'border-[#DC2626]/25',
      dot: 'bg-[#DC2626]',
      defaultLabel: 'Rejected',
    },
    banned: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#DC2626]',
      border: 'border-[#DC2626]/25',
      dot: 'bg-[#DC2626]',
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
      bg: 'bg-[#F0F9FF]',
      text: 'text-[#0369A1]',
      border: 'border-[#0369A1]/30',
      dot: 'bg-[#0369A1]',
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
