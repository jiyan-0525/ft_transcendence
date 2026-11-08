import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'
import { initialsOf } from '@/lib/initials'

export type AvatarSize = 'sm' | 'md' | 'lg'
export type AvatarStatus = 'online' | 'offline'

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

const statusClasses: Record<AvatarStatus, string> = {
  online: 'bg-mint',
  offline: 'bg-ink-muted',
}

const statusLabels: Record<AvatarStatus, string> = {
  online: 'Online',
  offline: 'Offline',
}

export type AvatarProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  /** The person's name. Used as alt text and to build the initials fallback. */
  name: string
  src?: string
  size?: AvatarSize
  /** Omit to hide the presence dot. */
  status?: AvatarStatus
}

/**
 * Avatar — a round user picture with an initials fallback.
 *
 * With no `src`, the initials are shown on the brand gradient, so every user
 * gets a recognisable picture without an upload. The presence dot is text too
 * (screen-reader only), so colour is never the only signal.
 */
export default function Avatar({
  name,
  src,
  size = 'md',
  status,
  className,
  ...props
}: AvatarProps) {
  return (
    <span
      className={cn('relative inline-flex shrink-0', className)}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover', sizeClasses[size])}
        />
      ) : (
        <span
          role="img"
          aria-label={name}
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-aurora font-semibold text-white',
            sizeClasses[size],
          )}
        >
          {initialsOf(name)}
        </span>
      )}

      {status ? (
        <span
          className={cn(
            'absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-surface',
            statusClasses[status],
          )}
        >
          <span className="sr-only">{statusLabels[status]}</span>
        </span>
      ) : null}
    </span>
  )
}
