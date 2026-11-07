import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'accent'
  | 'mint'
  | 'success'
  | 'warning'
  | 'danger'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-ink-muted',
  brand: 'bg-brand/10 text-ink',
  accent: 'bg-accent/10 text-ink',
  mint: 'bg-mint/10 text-ink',
  success: 'bg-success/10 text-ink',
  warning: 'bg-warning/15 text-ink',
  danger: 'bg-danger/10 text-ink',
}

const dotClasses: Record<BadgeTone, string> = {
  neutral: 'bg-ink-muted',
  brand: 'bg-brand',
  accent: 'bg-accent',
  mint: 'bg-mint',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

export type BadgeProps = ComponentPropsWithoutRef<'span'> & {
  tone?: BadgeTone
  /** Hide the leading colour dot when the label alone is enough. */
  dot?: boolean
}

/**
 * Badge — a short status or category label.
 *
 * The tone is carried by a tinted background plus a coloured dot, while the
 * text stays `ink`. That keeps contrast readable: white text on the pink or
 * mint accents would fail WCAG AA at this size.
 */
export default function Badge({
  tone = 'neutral',
  dot = true,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn('h-1.5 w-1.5 rounded-full', dotClasses[tone])}
        />
      ) : null}
      {children}
    </span>
  )
}
