import {
  createContext,
  useContext,
  useId,
  useRef,
} from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type TabItem = {
  value: string
  label: string
}

type TabsContextValue = {
  baseId: string
  value: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

export type TabsProps = {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  /** Names the tab list for screen readers, e.g. "Profile sections". */
  label: string
  className?: string
  children?: ReactNode
}

/**
 * Tabs — switches between sibling views without leaving the page.
 *
 * Only the selected tab is in the tab order; the arrow keys move between tabs,
 * Home and End jump to the ends, and focus follows the selection. Pair it with
 * `TabPanel` so each tab controls a labelled region.
 */
export default function Tabs({
  items,
  value,
  onChange,
  label,
  className,
  children,
}: TabsProps) {
  const baseId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  function focusAndSelect(index: number) {
    const next = items[index]
    if (!next) return
    onChange(next.value)
    tabRefs.current[index]?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = items.findIndex((item) => item.value === value)
    const last = items.length - 1

    switch (event.key) {
      case 'ArrowRight':
        focusAndSelect(current >= last ? 0 : current + 1)
        break
      case 'ArrowLeft':
        focusAndSelect(current <= 0 ? last : current - 1)
        break
      case 'Home':
        focusAndSelect(0)
        break
      case 'End':
        focusAndSelect(last)
        break
      default:
        return
    }
    event.preventDefault()
  }

  return (
    <TabsContext.Provider value={{ baseId, value }}>
      <div className={className}>
        <div
          role="tablist"
          aria-label={label}
          onKeyDown={onKeyDown}
          className="flex gap-1 overflow-x-auto border-b border-line"
        >
          {items.map((item, index) => {
            const selected = item.value === value
            return (
              <button
                key={item.value}
                ref={(node) => {
                  tabRefs.current[index] = node
                }}
                type="button"
                role="tab"
                id={tabId(baseId, item.value)}
                aria-selected={selected}
                aria-controls={selected ? panelId(baseId, item.value) : undefined}
                tabIndex={selected ? 0 : -1}
                onClick={() => onChange(item.value)}
                className={cn(
                  '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                  selected
                    ? 'border-brand text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export type TabPanelProps = {
  value: string
  className?: string
  children: ReactNode
}

/** Renders its children only while its tab is selected. */
export function TabPanel({ value, className, children }: TabPanelProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabPanel must be used inside <Tabs>.')
  }
  if (context.value !== value) return null

  return (
    <div
      role="tabpanel"
      id={panelId(context.baseId, value)}
      aria-labelledby={tabId(context.baseId, value)}
      tabIndex={0}
      className={cn('pt-5 focus:outline-none', className)}
    >
      {children}
    </div>
  )
}

function tabId(baseId: string, value: string) {
  return `${baseId}-tab-${value}`
}

function panelId(baseId: string, value: string) {
  return `${baseId}-panel-${value}`
}
