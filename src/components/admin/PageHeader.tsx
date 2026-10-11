import type { FC, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconChevronRight } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  className?: string
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}) => {
  return (
    <div className={cn('mb-6 space-y-2', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-500">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <span key={item.label} className="flex items-center gap-1.5">
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className="font-medium hover:text-brand-secondary transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={cn(isLast && 'font-semibold text-slate-800')}>
                    {item.label}
                  </span>
                )}
                {!isLast && <IconChevronRight size={14} stroke={1.8} className="text-slate-400" />}
              </span>
            )
          })}
        </nav>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-8 tracking-tight text-slate-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
