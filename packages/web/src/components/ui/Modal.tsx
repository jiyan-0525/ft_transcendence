import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

export type ModalSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export type ModalProps = {
  open: boolean
  title: string
  description?: string
  size?: ModalSize
  onClose: () => void
  children: ReactNode
  /** Action row shown below the body, e.g. Cancel and Confirm. */
  footer?: ReactNode
}

/**
 * Modal — a dialog that takes over focus until it is closed.
 *
 * While open it traps Tab inside the dialog, closes on Escape or a backdrop
 * click, locks page scroll, and returns focus to whatever opened it. Nothing is
 * rendered while closed, so a closed modal costs nothing on the page.
 */
export default function Modal({
  open,
  title,
  description,
  size = 'md',
  onClose,
  children,
  footer,
}: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  // Keep the latest callback without re-running the effect on every render.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return

    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const dialog = dialogRef.current
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? dialog)?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialog) return

      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }
      const firstItem = items[0]!
      const lastItem = items[items.length - 1]!
      const active = document.activeElement

      if (event.shiftKey && (active === firstItem || active === dialog)) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && active === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previous?.focus()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'flex max-h-[90vh] w-full flex-col rounded-lg border border-line bg-surface shadow-soft focus:outline-none',
          sizeClasses[size],
        )}
      >
        <div className="border-b border-line px-5 py-4">
          <h2 id={titleId} className="font-display text-lg font-semibold text-ink">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="mt-1 text-sm text-ink-muted">
              {description}
            </p>
          ) : null}
        </div>

        <div className="overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
