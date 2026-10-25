/** URL slug that keeps Hebrew and other non-Latin letters (previously stripped to ""). */
export function slugify(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

/** slugify() with a fallback for titles made only of symbols/emoji. */
export function slugOrFallback(text: string, prefix: string): string {
  return slugify(text) || `${prefix}-${Date.now().toString(36)}`
}
