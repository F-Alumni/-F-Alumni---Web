import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isVerified?: boolean
  isOnline?: boolean
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      fallback = 'U',
      size = 'md',
      isVerified = false,
      isOnline = false,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0 select-none overflow-visible rounded-full',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-semibold text-slate-700',
            isVerified && 'ring-2 ring-brand-secondary/40 ring-offset-1'
          )}
        >
          {src && !imageError ? (
            <img
              src={src}
              alt={alt ?? 'User avatar'}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span>{fallback}</span>
          )}
        </div>

        {isOnline && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-brand-accent ring-2 ring-white" />
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export { Avatar }

