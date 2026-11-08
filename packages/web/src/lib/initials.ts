/** First letter of the first two words, e.g. "Ada Lovelace" → "AL". */
export function initialsOf(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
  return letters.join('') || '?'
}
