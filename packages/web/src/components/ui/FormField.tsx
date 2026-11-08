import { useId } from 'react'
import type { ReactNode } from 'react'

/** Attributes the wrapper hands to the control so it is labelled and described. */
export type FormControlProps = {
  id: string
  required: boolean
  'aria-invalid': true | undefined
  'aria-describedby': string | undefined
}

export type FormFieldProps = {
  label: string
  hint?: string
  error?: string
  required?: boolean
  /** Receives the wiring props; spread them onto the control. */
  children: (control: FormControlProps) => ReactNode
  className?: string
}

/**
 * FormField — label, control, hint and error, wired together.
 *
 * Input and Textarea already do this for their own markup. Use FormField for
 * controls that are not built in, such as a native select or a custom picker,
 * so they get the same label, hint and error behaviour as the rest of the app.
 */
export default function FormField({
  label,
  hint,
  error,
  required = false,
  children,
  className,
}: FormFieldProps) {
  const generatedId = useId()
  const hintId = hint ? `${generatedId}-hint` : undefined
  const errorId = error ? `${generatedId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`space-y-1.5 ${className ?? ''}`.trim()}>
      <div className="flex items-baseline gap-0.5">
        <label htmlFor={generatedId} className="block text-sm font-medium text-ink">
          {label}
        </label>
        {required ? (
          <span aria-hidden="true" className="text-sm font-medium text-danger">
            *
          </span>
        ) : null}
      </div>

      {children({
        id: generatedId,
        required,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}

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
