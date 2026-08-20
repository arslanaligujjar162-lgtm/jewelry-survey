# Go-Live Runbook

The codebase is built and tested. This is what's left to actually put it online: nine phases, in order,
each with exact steps. Phases 1–2 make the site live at a Vercel URL; the rest make it findable and trustworthy.

A more readable, linked version of this same content is also available as a published artifact from the
session that wrote it — ask for the link if you have it, or follow this file directly.

## 1. Supabase — database, auth, storage

Everything the app needs from Supabase already exists as SQL migrations in this repo
(`supabase/migrations/`). This phase runs them against a real project.

1. **Create a Supabase account and project.** Go to supabase.com → *Start your project* → sign in with
   GitHub. *New project* → name it `7teen2wenty` → set a strong database password (save it) → pick a region
   close to Pakistan (`ap-southeast-1` / Singapore is nearest).
2. **Run the migrations, in order**, in the SQL Editor:
   1. `supabase/migrations/0001_init.sql`
   2. `supabase/migrations/0002_decrement_stock.sql`
   3. `supabase/migrations/0003_storage.sql`
   4. `supabase/migrations/0004_reviews.sql`
3. **Load the starter catalog:** run `supabase/seed.sql` the same way.
4. **Create your admin login:** Authentication → Users → Add user. This is the account you'll use at
   `/admin/login`.
5. **Copy your API keys** from Settings → API:

   | Supabase calls it | Env var name |
   |---|---|
   | Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
   | anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | service_role secret | `SUPABASE_SERVICE_ROLE_KEY` |

   The service_role key bypasses every database permission check — never expose it client-side or commit it.

## 2. Vercel — deploy the site

1. **Import the repo:** vercel.com/new → sign in with GitHub → select this repo → framework auto-detects
   Next.js. Don't deploy yet.
2. **Add environment variables** (Production):
   ```
   NEXT_PUBLIC_SUPABASE_URL          = from Phase 1
   NEXT_PUBLIC_SUPABASE_ANON_KEY     = from Phase 1
   SUPABASE_SERVICE_ROLE_KEY         = from Phase 1
   NEXT_PUBLIC_SITE_URL              = your domain, e.g. https://7teen2wenty.pk
   NEXT_PUBLIC_GATEWAY_ENABLED       = false
   ```
   Leave analytics/WhatsApp/monitoring vars blank until those phases.
3. **Deploy.** First build takes 2–3 minutes.
4. **Verify the database connected:** visit `/admin/login` on the deployed URL and sign in. If the dashboard
   loads instead of a "not configured" notice, it's wired correctly.

## 3. Domain

Skip if already registered and pointed at Vercel.

1. Register a domain (`.pk` via PKNIC/a local registrar reads more established locally; `.com` works too).
2. Vercel project → Settings → Domains → enter the domain → add the DNS records it gives you at your registrar.
3. Wait for propagation (minutes to a few hours); Vercel issues SSL automatically.
4. Set `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy — it feeds the sitemap, canonical URLs, and OG tags.

## 4. Analytics

The GA4/Meta Pixel loading code already exists — it just checks whether these variables are set.

1. Create a GA4 property (analytics.google.com) → Web data stream → copy the Measurement ID (`G-...`).
2. Create a Meta Pixel (business.facebook.com → Events Manager) → copy the Pixel ID.
3. Add to Vercel and redeploy:
   ```
   NEXT_PUBLIC_GA4_ID          = G-XXXXXXXXXX
   NEXT_PUBLIC_META_PIXEL_ID   = 123456789012345
   ```
   `add_to_cart`/`purchase` (GA4) and `AddToCart`/`Purchase` (Pixel) events already fire at the right points.

## 5. Search Console & Google Business Profile

1. Verify the domain in Search Console (Domain property, DNS TXT verification).
2. Submit `sitemap.xml` — it's generated automatically from the live catalog.
3. Set up a Google Business Profile (business.google.com) with category "Jewelry store" and the real address —
   this is what surfaces the shop in local "jewellery near me" searches and Google Maps.

## 6. WhatsApp Business

`src/lib/whatsapp.ts` already builds the full order-confirmation payload (name, phone, order summary, status)
on every order — the send itself is stubbed pending your Business account.

1. Register a dedicated business number at business.facebook.com → WhatsApp. Requires Meta Business
   verification (can take days — start early).
2. Once approved, generate a permanent access token and note the phone number ID.
3. Add credentials:
   ```
   WHATSAPP_CLOUD_API_TOKEN    = your permanent token
   WHATSAPP_PHONE_NUMBER_ID    = your number's ID
   ```
4. **Follow-up build needed:** `sendWhatsAppOrderConfirmation()` in `src/lib/whatsapp.ts` currently only logs
   what it would send — it needs the actual Cloud API `/messages` call added once you have credentials to
   test against.

## 7. Payment gateway

COD is fully live; this phase only matters once you're ready for card/JazzCash/Easypaisa.

1. Apply for a merchant account (JazzCash, Easypaisa, or a bank gateway). Review can take days — apply early,
   independent of the rest of this runbook.
2. **Follow-up build needed:** implement `src/lib/payments/gateway.ts` against the approved gateway's SDK.
   Checkout, order creation, and the admin dashboard already talk to payment methods through this one
   abstraction, so nothing else needs to change.
3. Flip `NEXT_PUBLIC_GATEWAY_ENABLED=true` only once that integration is tested end to end.

## 8. Content review

Everything below is placeholder content, clearly flagged in the code so it isn't mistaken for launch-ready:

- **Product photography** — every image is a flat-colour placeholder. Replace via `/admin/products` (uploads
  to Supabase Storage).
- **Business address & WhatsApp number** — `src/lib/brand.ts` (`CONTACT` object).
- **Legal pages** — Privacy Policy, Terms, Return & Exchange Policy are structurally complete but marked
  placeholder on each page. Have a lawyer familiar with Pakistani consumer/e-commerce law review them.
- **Courier coverage list** — `src/lib/serviceable-areas.ts` has ten major cities with estimated windows/fees.
  Confirm against your actual courier's real coverage and rates.
- **Brand colour values** — `tailwind.config.ts` is this build's interpretation of "Retro Sky Blue / Umber
  Brown / Pale Butter Yellow." Swap in exact hex values if brand guidelines specify them.

## 9. Smoke test & launch

Run this against the real production URL — not a preview URL, not localhost:

- [ ] Browse home → shop → filter by category/price/new/search → product detail
- [ ] Add to cart (including a ring size) → view cart → adjust quantity
- [ ] Wishlist a product, confirm it appears at `/wishlist`
- [ ] Checkout: phone validation, serviceability check, delivery estimate all appear
- [ ] OTP: request by real SMS, verify, confirm "Place order" is blocked until verified
- [ ] Promo code: valid applies a discount, invalid shows a clear error
- [ ] Order confirmation shows correct totals/address; order appears in `/admin/orders`
- [ ] Update an order's status in the admin dashboard, confirm it persists
- [ ] Submit a return at `/request-return`, confirm it shows in `/admin/returns`
- [ ] Submit a review, approve it in `/admin/reviews`, confirm it appears on the product page
- [ ] Check the site on an actual phone

Only once every box above is checked against the live domain is this launch-ready.
