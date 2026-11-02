import { getProducts } from "@/lib/products";
import { countAdOrderLogEntries } from "@/lib/admin/queries";
import type { CatalogProductOption } from "@/lib/pricing-math";
import { PricingCalculator } from "@/components/admin/PricingCalculator";
import { UnitEconomicsCalculator } from "@/components/admin/UnitEconomicsCalculator";
import { SkuPricingSheet } from "@/components/admin/SkuPricingSheet";
import { ReadinessPanel } from "@/components/admin/ReadinessPanel";

export default async function AdminPricingPage() {
  // The real, live storefront catalog — Supabase in production, the local
  // fallback seed otherwise — so the calculator's product picker shows the
  // actual selling price and a real photo, not a hand-typed guess.
  const products = await getProducts({ sort: "newest" });
  const catalogProducts: CatalogProductOption[] = products
    .map((p) => ({ id: p.id, name: p.name, priceRs: p.price, image: p.images[0] }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const orderLogEntryCount = await countAdOrderLogEntries();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold text-brand-umber-dark">Pricing &amp; economics</h1>
        <p className="mt-1 font-body text-base text-brand-charcoal/60">
          Everything persists in this browser, so it&apos;s exactly as you left it next time you open it.
        </p>
      </div>

      <section>
        <h2 className="font-display text-2xl font-semibold text-brand-umber-dark">Readiness</h2>
        <p className="mt-1 font-body text-base text-brand-charcoal/60">
          Are you actually ready to spend ad money yet? From the Meta Ads Phase 1 readiness test.
        </p>
        <div className="mt-5">
          <ReadinessPanel catalogProducts={catalogProducts} orderLogEntryCount={orderLogEntryCount} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold text-brand-umber-dark">SKU pricing sheet</h2>
        <p className="mt-1 font-body text-base text-brand-charcoal/60">
          Every real product, its real price, and its real margin — worst margin first.
        </p>
        <div className="mt-5">
          <SkuPricingSheet catalogProducts={catalogProducts} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold text-brand-umber-dark">Price calculator</h2>
        <p className="mt-1 font-body text-base text-brand-charcoal/60">
          Work out what a piece needs to sell for — sourcing, packaging, courier, and your margin.
        </p>
        <div className="mt-5">
          <PricingCalculator catalogProducts={catalogProducts} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold text-brand-umber-dark">Unit economics &amp; ad spend</h2>
        <p className="mt-1 font-body text-base text-brand-charcoal/60">
          What COD failure actually costs you, and the Meta ROAS you need just to break even.
        </p>
        <div className="mt-5">
          <UnitEconomicsCalculator />
        </div>
      </section>
    </div>
  );
}
