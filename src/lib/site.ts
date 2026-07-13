/**
 * Single source of truth for the canonical site origin (S5). Every
 * SEO-facing surface — root metadataBase, sitemap.ts, robots.ts, and
 * JSON-LD — imports this instead of hardcoding the domain, so the URL only
 * ever needs to change in one place if the Vercel project domain changes.
 *
 * `NEXT_PUBLIC_SITE_URL` lets a preview/staging deploy override the
 * canonical origin without a code change; production has no env var set,
 * so it falls back to the live domain below.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-harsh-gahlot-s-projects.vercel.app";
