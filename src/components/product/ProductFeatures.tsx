import type { Product } from "@/lib/types";
import { QUALITY_HEADING } from "@/lib/brand";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-brand-umber" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductFeatures({ product }: { product: Product }) {
  const facts = [product.plating_spec, "Water and sweat resistant — safe for everyday wear"];
  if (product.material_spec.toLowerCase().includes("cubic zirconia")) {
    facts.push("Set with cubic zirconia stones");
  }

  return (
    <div className="mt-6 border-t border-brand-umber/10 pt-5">
      <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">
        {QUALITY_HEADING}
      </h2>
      <ul className="mt-3 space-y-2.5">
        {facts.map((fact) => (
          <li key={fact} className="flex items-start gap-2.5 font-body text-sm text-brand-charcoal">
            <CheckIcon />
            <span>{fact}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
