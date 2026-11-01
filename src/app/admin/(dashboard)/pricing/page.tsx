import { PricingCalculator } from "@/components/admin/PricingCalculator";
import { UnitEconomicsCalculator } from "@/components/admin/UnitEconomicsCalculator";

export default function AdminPricingPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-brand-umber-dark">Pricing &amp; economics</h1>
        <p className="mt-1 font-body text-sm text-brand-charcoal/60">
          Everything persists in this browser, so it&apos;s exactly as you left it next time you open it.
        </p>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold text-brand-umber-dark">Price calculator</h2>
        <p className="mt-1 font-body text-sm text-brand-charcoal/60">
          Work out what a piece needs to sell for — sourcing, packaging, courier, and your margin.
        </p>
        <div className="mt-5">
          <PricingCalculator />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-brand-umber-dark">Unit economics &amp; ad spend</h2>
        <p className="mt-1 font-body text-sm text-brand-charcoal/60">
          What COD failure actually costs you, and the Meta ROAS you need just to break even.
        </p>
        <div className="mt-5">
          <UnitEconomicsCalculator />
        </div>
      </section>
    </div>
  );
}
