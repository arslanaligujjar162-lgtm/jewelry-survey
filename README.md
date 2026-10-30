# 7teen2wenty (1720)

Demi-fine, PVD-coated 316L stainless steel jewelry for the Pakistani market.
**Not fast. Not a fortune. Just good jewelry.**

Next.js 14 (App Router, TypeScript) + Tailwind CSS + Supabase (Postgres, Auth, Storage), built for Vercel.

Ready to put it online? See **[docs/GO_LIVE_RUNBOOK.md](docs/GO_LIVE_RUNBOOK.md)** for the exact,
click-by-click steps — Supabase, Vercel, domain, analytics, Search Console, WhatsApp Business, payment
gateway, and a pre-launch content review.

## Status

The site runs fully **without** a Supabase project configured — it falls back to a local seed catalog
(`src/data/seed-products.ts`) and in-memory order/OTP/promo stores so you can browse, add to cart, check out,
verify OTP, and land on an order confirmation page immediately after `npm install && npm run dev`.

The admin dashboard (`/admin`) genuinely requires Supabase — there is no fake/insecure login fallback. Follow
**Supabase setup** below to enable it, place real orders that persist, and manage the catalog.

## Getting started

```bash
npm install
npm run dev
```

Visit http://localhost:3000. To exercise the full checkout flow locally, the OTP endpoint returns a `devCode` in
non-production builds — the checkout page shows it inline under "Dev mode" so you don't need a real SMS gateway.

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you have. Every variable is optional for local browsing; the
app degrades gracefully (see **Status** above) when Supabase, analytics, or the payment gateway aren't configured.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project — catalog, orders, auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used for checkout writes and the admin dashboard. Never expose client-side. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used in metadata, sitemap, robots.txt and link previews. Falls back to Vercel's production domain when unset |
| `NEXT_PUBLIC_GATEWAY_ENABLED` | Flip to `true` only after the NayaPay adapter (`src/lib/payments/nayapay.ts`) is implemented and its credentials are set — it also shows the "pay the advance online" option at checkout |
| `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID` | Analytics — omit to skip loading either script |
| `RESEND_API_KEY`, `ORDER_ALERT_EMAIL`, `ORDER_ALERT_FROM` | New-order email alerts to the owner via Resend — omit to skip |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | Optional SMS phone verification at checkout. Unset: COD orders go through without a code and are confirmed on WhatsApp |
| `POSTEX_API_TOKEN` | PostEx courier integration (`src/lib/postex.ts`) — booking, tracking and COD payout status from Admin → Orders. Unset: the "Book with PostEx" panel shows a config error instead |

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run every file in `supabase/migrations/` in numeric order (`0001` onwards). An existing
   project that predates the real catalogue can instead run `supabase/RUN_THIS_IN_SUPABASE.sql` once.
3. Run `supabase/seed.sql` to load the placeholder catalog (replace the product photography referenced there with
   real images before launch — see **Known placeholders**).
4. In Authentication → Users, create a single admin user (email + password). That's the account used to sign in at
   `/admin/login`.
5. Copy the project URL and keys (Settings → API) into your environment: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

Once set, `/admin` is auth-gated by Supabase Auth (see `src/middleware.ts` and
`src/app/admin/(dashboard)/layout.tsx`), orders written at checkout persist to the `orders` table, and product
photos uploaded from the admin dashboard go to the `product-images` Storage bucket.

## Payments

`src/lib/payments/` defines a `PaymentProvider` interface. `cod.ts` is the live provider: checkout succeeds with
`payment_status: "pending"` and the order settles in cash on delivery (the optional Rs. 500 advance is currently off — see
`src/lib/advance-payment.ts`).

`gateway.ts` is the online-advance option, built but switched off. Flow: checkout creates a payment session
(`createSession`) and saves the order unpaid with the gateway's reference, the customer pays on the gateway's page,
and the gateway calls `POST /api/payments/webhook`. The webhook verifies the signature on the raw body, checks the
amount and reference against the order, then marks it paid and confirmed and sends the owner alert (once, even if
the gateway retries). With no configured adapter the webhook answers 404, so it is inert until set up.

To go live, implement the three functions of the NayaPay adapter in `nayapay.ts` (`isConfigured`, `createSession`,
`parseWebhook`) from NayaPay's merchant docs, run migration `0017_order_payment_reference.sql`, set the
credentials, register `https://<domain>/api/payments/webhook` with NayaPay, test in their sandbox, then set
`NEXT_PUBLIC_GATEWAY_ENABLED=true`. Known gap: stock is reserved when an online order is created, so an abandoned
payment holds stock until it is cancelled by hand.

## WhatsApp order confirmations

`src/lib/whatsapp.ts` builds the full context an automated confirmation message needs (name, phone, order summary,
status) on every order, and currently just logs it (`sendWhatsAppOrderConfirmation`). Wire in the WhatsApp Cloud
API `/messages` call there once a Business phone number and access token are available.

## Known placeholders (flagged for real content before launch)

- **Product photography** — `public/products/*.svg` are flat-colour placeholders (solid matte backgrounds, per
  brand rules) generated by `scripts/generate-placeholders.mjs`. Replace with real photography and re-run/update
  `supabase/seed.sql` or the admin product editor.
- **Business contact details** — `src/lib/brand.ts` (`CONTACT`) has a placeholder address and WhatsApp number.
- **Legal pages** — Privacy Policy, Terms, and Return & Exchange Policy are placeholder text, flagged on-page, and
  need review by a lawyer familiar with Pakistani consumer/e-commerce law before launch.
- **Serviceable areas** — `src/lib/serviceable-areas.ts` is a static coverage list. Wire to a real courier API when
  available.
- **OTP delivery** — codes are generated and logged server-side (`src/lib/otp.ts`) but not actually sent by SMS/WhatsApp yet; wire an SMS gateway before launch.
- **Brand colour palette** — `tailwind.config.ts` (`brand.*`) is this build's interpretation of "Retro Sky Blue /
  Umber Brown / Pale Butter Yellow"; swap in exact brand hex values if you have them.

## Deploying

See **[docs/GO_LIVE_RUNBOOK.md](docs/GO_LIVE_RUNBOOK.md)** for the full walkthrough. Short version: push to
GitHub, import into [Vercel](https://vercel.com/new) (framework preset "Next.js"), add the environment
variables above, connect your domain under Settings → Domains, then run the smoke test below against the
production URL.

## Smoke test checklist

- [ ] Browse home → shop → filter by category/price/new → product detail
- [ ] Add to cart (including a ring size selection) → view cart → adjust quantity
- [ ] Checkout: address form validates Pakistani phone format, serviceability check, delivery fee/time shown
- [ ] OTP: send code, verify, "Place order" blocked until verified
- [ ] Promo code: valid code applies discount, invalid code shows an error
- [ ] Order confirmation page shows correct totals and address
- [ ] With Supabase configured: order appears in `/admin/orders`, status update persists
- [ ] Product CRUD in `/admin/products`, including image upload to Storage
- [ ] Return request from `/request-return` shows up in `/admin/returns`

## Scripts

- `npm run dev` / `npm run build` / `npm run start` — standard Next.js
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests (`src/**/*.test.ts`) for validation, formatting, serviceability, payments, and
  the rate limiter
- `npx playwright test` — e2e regression test for the critical guest-checkout path (`e2e/checkout.spec.ts`).
  Run it against `npm run dev` (the default) so the dev-only OTP code is exposed; point `E2E_BASE_URL` at another
  server to run it elsewhere. If the pinned Playwright browser binary isn't installed, run `npx playwright install`
  or set `PLAYWRIGHT_CHROMIUM_PATH` to an existing Chromium executable.
- `node scripts/generate-placeholders.mjs` — regenerates placeholder product SVGs and
  `src/data/seed-products.ts` / `supabase/seed.sql` from the product list in that script

## Security & reliability notes

- **Rate limiting** (`src/lib/rate-limit.ts`) caps OTP sends/verifies, checkout submissions, and promo lookups per
  phone/IP. It's in-memory and per-instance — fine for a single-region deploy, but swap it for a durable store
  (e.g. Upstash Redis) if you scale to multiple regions/instances.
- **Security headers** (CSP, HSTS, X-Frame-Options, etc.) are set in `next.config.mjs`. The CSP allows
  `'unsafe-inline'` for the GA4/Meta Pixel snippets; a nonce-based CSP would tighten this further if needed.
- **Error monitoring** (`src/lib/monitoring.ts`) logs to the console always, and POSTs to
  `MONITORING_WEBHOOK_URL` if set — point it at a Sentry ingestion endpoint or any webhook. `global-error.tsx`
  catches uncaught render errors with a brand-voiced fallback page.
