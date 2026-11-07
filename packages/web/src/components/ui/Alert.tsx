import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type AlertTone = 'info' | 'success' | 'warning' | 'danger'

const toneClasses: Record<AlertTone, string> = {
  info: 'border-brand/30 bg-brand/5',
  success: 'border-success/30 bg-success/5',
  warning: 'border-warning/40 bg-warning/10',
  danger: 'border-danger/30 bg-danger/5',
}

const iconClasses: Record<AlertTone, string> = {
  info: 'bg-brand text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  danger: 'bg-danger text-white',
}

const iconGlyphs: Record<AlertTone, string> = {
  info: 'i',
  success: '✓',
  warning: '!',
  danger: '!',
}

export type AlertProps = ComponentPropsWithoutRef<'div'> & {
  tone?: AlertTone
  title?: ReactNode
}

/**
 * Alert — inline feedback for a form or a page section.
 *
 * Errors use `role="alert"` so they are announced immediately; informational
 * messages use the politer `role="status"`.
 */
export default function Alert({
  tone = 'info',
  title,
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'flex gap-3 rounded border p-4 text-sm text-ink',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold',
          iconClasses[tone],
        )}
      >
        {iconGlyphs[tone]}
      </span>

      <div className="min-w-0 space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="text-ink-muted">{children}</div> : null}
      </div>
    </div>
  )
}
