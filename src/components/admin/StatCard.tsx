import type { FC, ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value?: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: string
    isPositive?: boolean
  }
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral'
  className?: string
  isLoading?: boolean
}

export const StatCard: FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  variant = 'neutral',
  className,
  isLoading = false,
}) => {
  const iconVariantStyles = {
    primary: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    secondary: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20',
    accent: 'bg-brand-accent/10 text-brand-accent border-brand-accent/20',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  if (isLoading) {
    return (
      <Card
        className={cn(
          'rounded-xl border border-slate-200 bg-white p-5 shadow-xs animate-pulse',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-24 rounded-sm bg-slate-200" />
          <div className="h-10 w-10 rounded-xl bg-slate-100" />
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="h-7 w-20 rounded-sm bg-slate-200" />
          <div className="h-3.5 w-16 rounded-sm bg-slate-100" />
        </div>
        <div className="mt-2.5 h-3 w-36 rounded-sm bg-slate-100" />
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border',
            iconVariantStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-semibold',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
    </Card>
  )
}
