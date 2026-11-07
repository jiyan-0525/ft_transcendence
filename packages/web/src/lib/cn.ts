/**
 * Join class names, dropping anything falsy.
 *
 * Components accept a `className` prop and merge it last, so a caller can
 * override a default utility without fighting specificity.
 *
 *   cn('px-4 py-2', isActive && 'bg-brand', className)
 */
export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(' ')
}
