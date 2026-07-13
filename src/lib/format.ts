/**
 * Shared formatting helpers for blog post metadata (S5). `date` is stored as
 * an ISO yyyy-mm-dd string in frontmatter; parsed as UTC so the displayed day
 * doesn't shift depending on the reader's timezone.
 */
export function formatPostDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
