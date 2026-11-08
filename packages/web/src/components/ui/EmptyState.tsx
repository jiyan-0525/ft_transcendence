import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type EmptyStateProps = Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
  title: string
  description?: string
  /** Optional decorative element above the title, e.g. an icon. */
  icon?: ReactNode
  /** Optional call to action, usually a Button. */
  action?: ReactNode
}

/**
 * EmptyState — what a list shows when it has nothing to list yet.
 *
 * Every list page uses this instead of a blank area, so the user always knows
 * whether the page is empty or still loading, and what they can do next.
 */
export default function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      {icon ? (
        <div
          aria-hidden="true"
          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand"
        >
          {icon}
        </div>
      ) : null}
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
