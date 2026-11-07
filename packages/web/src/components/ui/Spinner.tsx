import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

export type SpinnerSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
}

export type SpinnerProps = ComponentPropsWithoutRef<'span'> & {
  size?: SpinnerSize
  /** Announced to screen readers. Pass a more specific message when needed. */
  label?: string
}

/**
 * Spinner — an indeterminate progress indicator.
 *
 * `role="status"` plus the visually hidden label makes it announce "Loading"
 * to assistive technology, so sighted and non-sighted users get the same
 * information. Decorative use (e.g. inside a button) should set
 * `aria-hidden` on the ring instead.
 */
export default function Spinner({
  size = 'md',
  label = 'Loading',
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      className={cn('inline-flex items-center gap-2 text-brand', className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'animate-spin rounded-full border-current border-t-transparent',
          sizeClasses[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
