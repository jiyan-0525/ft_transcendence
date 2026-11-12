import { useId } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

export type InputProps = ComponentPropsWithoutRef<'input'> & {
  label: string
  /** Helper text shown below the field. Hidden while an error is present. */
  hint?: string
  /** Error message. Sets `aria-invalid` and is announced as an alert. */
  error?: string
}

const fieldBase =
  'h-11 w-full rounded border bg-surface px-3 text-ink placeholder:text-ink-muted transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted'

export default function Input({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-ink"
      >
        {label}
      </label>

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          fieldBase,
          error
            ? 'border-danger focus:border-danger'
            : 'border-line focus:border-brand',
          className,
        )}
        {...props}
      />

      {hint && !error ? (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
