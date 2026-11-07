import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { cn } from '@/lib/cn'

export type CardVariant = 'default' | 'muted'

const variantClasses: Record<CardVariant, string> = {
  default: 'border-line bg-surface',
  // A quieter surface for nested or secondary content.
  muted: 'border-line bg-surface-muted',
}

export type CardProps = ComponentPropsWithoutRef<'div'> & {
  variant?: CardVariant
}

/**
 * Card — the shared container for grouped content.
 *
 * Card itself adds no padding, so a plain `<Card className="p-5">` is valid.
 * The CardHeader/CardContent/CardFooter parts add their own spacing when a
 * card needs a title and an action row.
 */
export default function Card({
  variant = 'default',
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border shadow-card',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('px-5 pt-5', className)} {...props} />
}

export function CardTitle({
  as: Tag = 'h3',
  className,
  ...props
}: ComponentPropsWithoutRef<'h3'> & { as?: ElementType }) {
  return (
    <Tag
      className={cn(
        'font-display text-base font-semibold text-ink',
        className,
      )}
      {...props}
    />
  )
}

export function CardDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<'p'>) {
  return (
    <p className={cn('text-sm text-ink-muted', className)} {...props} />
  )
}

export function CardContent({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('p-5', className)} {...props} />
}

export function CardFooter({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 border-t border-line px-5 py-3',
        className,
      )}
      {...props}
    />
  )
}
