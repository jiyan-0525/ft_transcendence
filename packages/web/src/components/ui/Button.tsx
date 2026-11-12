import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  // The gradient is deep enough for white text (see the accessibility note in
  // style.css). Primary actions are always this gradient.
  primary: 'bg-aurora text-white shadow-soft hover:opacity-90',
  secondary:
    'border border-line bg-surface text-ink hover:bg-surface-muted',
  ghost: 'text-ink-muted hover:bg-surface-muted hover:text-ink',
  danger: 'bg-danger text-white shadow-soft hover:opacity-90',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Shows a spinner and disables the button while an action is running. */
  loading?: boolean
  fullWidth?: boolean
  /** Optional element rendered before the label, e.g. an icon. */
  leadingIcon?: ReactNode
}

/**
 * Button — the single source of truth for clickable actions.
 *
 * It always renders a real `<button>` with an explicit `type="button"`
 * default. Forms must pass `type="submit"` themselves, which prevents the
 * classic "button inside a form submits it" surprise.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leadingIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors',
        'disabled:pointer-events-none disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        leadingIcon
      )}
      {children}
    </button>
  )
}
