/**
 * Absolute origin for canonical URLs, the sitemap and link-preview images.
 * Without NEXT_PUBLIC_SITE_URL this falls back to Vercel's production domain
 * (which becomes the custom domain automatically once one is attached),
 * rather than a hard-coded domain the store may not own — a wrong origin here
 * breaks the preview image whenever the link is shared on WhatsApp or Instagram.
 * Server-side only: the Vercel variable isn't exposed to the browser.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
