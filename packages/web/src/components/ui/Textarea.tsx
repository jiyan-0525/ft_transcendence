import { useId } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/cn'

export type TextareaProps = ComponentPropsWithoutRef<'textarea'> & {
  label: string
  hint?: string
  error?: string
}

/**
 * Textarea — the multi-line sibling of Input. Same label/hint/error wiring so
 * a form can mix both without changing how errors are announced.
 */
export default function Textarea({
  label,
  hint,
  error,
  id,
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const hintId = hint ? `${textareaId}-hint` : undefined
  const errorId = error ? `${textareaId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={textareaId}
        className="block text-sm font-medium text-ink"
      >
        {label}
      </label>

      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full resize-y rounded border bg-surface px-3 py-2 text-ink placeholder:text-ink-muted transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted',
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
