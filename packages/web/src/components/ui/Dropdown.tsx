import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type DropdownItem = {
  label: string
  onSelect: () => void
  /** `danger` is for destructive actions such as delete or sign out. */
  tone?: 'default' | 'danger'
  disabled?: boolean
}

export type DropdownProps = {
  /** Content of the button that opens the menu. */
  trigger: ReactNode
  /** Accessible name for the trigger when its content is only an icon. */
  triggerLabel?: string
  items: DropdownItem[]
  align?: 'start' | 'end'
  className?: string
}

const itemToneClasses: Record<NonNullable<DropdownItem['tone']>, string> = {
  default: 'text-ink hover:bg-surface-muted',
  danger: 'text-danger hover:bg-danger/10',
}

/**
 * Dropdown — a button that opens a list of actions.
 *
 * Opening moves focus to the first enabled item. Arrow keys, Home and End move
 * between items, Escape closes and returns focus to the trigger, and a click
 * outside closes the menu. Disabled items are skipped by the keyboard.
 */
export default function Dropdown({
  trigger,
  triggerLabel,
  items,
  align = 'start',
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  // Read items through a ref so a parent that re-renders with a new array
  // does not pull focus back to the first item while the menu is open.
  const itemsRef = useRef(items)
  useEffect(() => {
    itemsRef.current = items
  })

  useEffect(() => {
    if (!open) return
    const firstEnabled = itemsRef.current.findIndex((item) => !item.disabled)
    if (firstEnabled >= 0) itemRefs.current[firstEnabled]?.focus()
  }, [open])

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function enabledIndices() {
    return items.flatMap((item, index) => (item.disabled ? [] : [index]))
  }

  function moveFocus(direction: 'first' | 'last' | 'next' | 'prev') {
    const enabled = enabledIndices()
    if (enabled.length === 0) return
    const active = itemRefs.current.findIndex(
      (node) => node === document.activeElement,
    )
    const position = enabled.indexOf(active)

    let target: number
    if (direction === 'first') target = enabled[0]!
    else if (direction === 'last') target = enabled[enabled.length - 1]!
    else if (direction === 'next')
      target = enabled[position < 0 || position === enabled.length - 1 ? 0 : position + 1]!
    else target = enabled[position <= 0 ? enabled.length - 1 : position - 1]!

    itemRefs.current[target]?.focus()
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowDown':
        moveFocus('next')
        break
      case 'ArrowUp':
        moveFocus('prev')
        break
      case 'Home':
        moveFocus('first')
        break
      case 'End':
        moveFocus('last')
        break
      case 'Escape':
        close()
        break
      case 'Tab':
        setOpen(false)
        return
      default:
        return
    }
    event.preventDefault()
  }

  return (
    <div ref={rootRef} className={cn('relative inline-block', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={triggerLabel}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-medium text-ink hover:bg-surface-muted"
      >
        {trigger}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          onKeyDown={onMenuKeyDown}
          className={cn(
            'absolute top-full z-40 mt-2 min-w-48 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-soft',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, index) => (
            <button
              key={item.label}
              ref={(node) => {
                itemRefs.current[index] = node
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={item.disabled}
              onClick={() => {
                item.onSelect()
                close()
              }}
              className={cn(
                'block w-full px-4 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50',
                itemToneClasses[item.tone ?? 'default'],
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
