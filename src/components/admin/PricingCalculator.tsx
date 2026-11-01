"use client";

import { useMemo } from "react";
import clsx from "clsx";
import {
  calculatePieceCost,
  checkPriceAgainstCost,
  SOURCING_PRODUCTS,
  type CostMode,
} from "@/lib/pricing-math";
import { usePersistedState } from "@/lib/use-persisted-state";
import { formatPKR } from "@/lib/format";

interface FormState {
  productIndex: string; // index into SOURCING_PRODUCTS, or "custom"
  costMode: CostMode;
  productCostRmb: number;
  exchangeRate: number;
  productCostPkr: number;
  agentFeePct: number;
  freightRatePerKg: number;
  unitWeightGrams: number;
  customsDuty: number;
  packagingCost: number;
  courierFee: number;
  codFee: number;
  rtoEnabled: boolean;
  rtoRatePct: number;
  targetMarginPct: number;
  yourPrice: number;
}

const DEFAULTS: FormState = {
  productIndex: "custom",
  costMode: "rmb",
  productCostRmb: 35,
  exchangeRate: 39.5,
  productCostPkr: 0,
  agentFeePct: 10,
  freightRatePerKg: 4000,
  unitWeightGrams: 20,
  customsDuty: 0,
  packagingCost: 98.98,
  courierFee: 200,
  codFee: 0,
  rtoEnabled: false,
  rtoRatePct: 15,
  targetMarginPct: 50,
  yourPrice: 0,
};

function marginTone(marginPct: number) {
  if (marginPct >= 40) return "good" as const;
  if (marginPct >= 20) return "thin" as const;
  return "bad" as const;
}

const marginToneClass: Record<ReturnType<typeof marginTone>, string> = {
  good: "bg-brand-success/10 text-brand-success",
  thin: "bg-brand-brass/15 text-brand-brass",
  bad: "bg-brand-error/10 text-brand-error",
};

function NumberField({
  label,
  hint,
  prefix,
  suffix,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-body text-xs font-semibold text-brand-charcoal">{label}</span>
      <span className="flex items-center overflow-hidden rounded-md border border-brand-umber/20 bg-brand-butter-light">
        {prefix && (
          <span className="border-r border-brand-umber/20 px-2.5 py-2 font-body text-xs text-brand-charcoal/60">
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 font-body text-sm text-brand-charcoal outline-none focus-visible:ring-2 focus-visible:ring-brand-sky"
        />
        {suffix && (
          <span className="border-l border-brand-umber/20 px-2.5 py-2 font-body text-xs text-brand-charcoal/60">
            {suffix}
          </span>
        )}
      </span>
      {hint && <span className="mt-1 block font-body text-xs leading-snug text-brand-charcoal/50">{hint}</span>}
    </label>
  );
}

export function PricingCalculator() {
  const [form, setForm] = usePersistedState<FormState>("admin-1720-pricing-calculator", DEFAULTS);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyProduct(productIndex: string) {
    setForm((prev) => {
      if (productIndex === "custom") return { ...prev, productIndex };
      const product = SOURCING_PRODUCTS[parseInt(productIndex, 10)];
      if (!product) return prev;
      return {
        ...prev,
        productIndex,
        costMode: "rmb",
        productCostRmb: product.rmb,
        unitWeightGrams: product.weightGrams,
        yourPrice: 0,
      };
    });
  }

  const result = useMemo(() => calculatePieceCost(form), [form]);

  const effectiveYourPrice = form.yourPrice > 0 ? form.yourPrice : Math.round(result.suggestedPrice / 50) * 50;
  const yourCheck = useMemo(
    () => checkPriceAgainstCost(effectiveYourPrice, result.totalCostPerPieceSold),
    [effectiveYourPrice, result.totalCostPerPieceSold],
  );
  const tone = marginTone(yourCheck.marginPct);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
      {/* Inputs */}
      <div className="space-y-5">
        <section className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
          <h2 className="font-display text-lg font-semibold text-brand-umber-dark">Sourcing cost</h2>
          <p className="mt-1 font-body text-xs text-brand-charcoal/60">
            What the piece itself costs, landed from your 1688 supplier.
          </p>

          <div className="mt-4">
            <label className="block">
              <span className="mb-1 block font-body text-xs font-semibold text-brand-charcoal">Product</span>
              <select
                value={form.productIndex}
                onChange={(e) => applyProduct(e.target.value)}
                className="w-full rounded-md border border-brand-umber/20 bg-brand-butter-light px-3 py-2 font-body text-sm text-brand-charcoal"
              >
                <option value="custom">Custom (type your own)</option>
                {SOURCING_PRODUCTS.map((p, i) => (
                  <option key={p.name} value={i}>
                    {p.name} — ¥{p.rmb}, {p.weightGrams}g
                  </option>
                ))}
              </select>
              <span className="mt-1 block font-body text-xs leading-snug text-brand-charcoal/50">
                Pick one of your products to auto-fill its cost &amp; weight, or choose Custom.
              </span>
            </label>
          </div>

          <div className="mt-4 flex gap-5 font-body text-sm text-brand-charcoal">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="costMode"
                checked={form.costMode === "rmb"}
                onChange={() => set("costMode", "rmb")}
              />
              Quoted in RMB
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="costMode"
                checked={form.costMode === "pkr"}
                onChange={() => set("costMode", "pkr")}
              />
              Quoted in PKR
            </label>
          </div>

          {form.costMode === "rmb" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Cost per unit (¥)"
                prefix="¥"
                step={0.01}
                value={form.productCostRmb}
                onChange={(v) => set("productCostRmb", v)}
              />
              <NumberField
                label="Exchange rate (¥ → Rs)"
                prefix="Rs"
                step={0.01}
                hint="Check today's rate before relying on this — it moves often."
                value={form.exchangeRate}
                onChange={(v) => set("exchangeRate", v)}
              />
            </div>
          ) : (
            <div className="mt-4">
              <NumberField
                label="Cost per unit (Rs)"
                prefix="Rs"
                value={form.productCostPkr}
                onChange={(v) => set("productCostPkr", v)}
              />
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Sourcing agent fee (%)"
              suffix="%"
              step={0.1}
              hint="Applied to the product cost above."
              value={form.agentFeePct}
              onChange={(v) => set("agentFeePct", v)}
            />
            <NumberField
              label="Freight rate (Rs per kg)"
              prefix="Rs"
              value={form.freightRatePerKg}
              onChange={(v) => set("freightRatePerKg", v)}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Weight per piece (g)"
              suffix="g"
              step={0.1}
              hint="Varies by piece — rings/studs run lighter than chains/bangles."
              value={form.unitWeightGrams}
              onChange={(v) => set("unitWeightGrams", v)}
            />
            <NumberField
              label="Customs duty (Rs per unit)"
              prefix="Rs"
              value={form.customsDuty}
              onChange={(v) => set("customsDuty", v)}
            />
          </div>
        </section>

        <section className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
          <h2 className="font-display text-lg font-semibold text-brand-umber-dark">Packaging</h2>
          <p className="mt-1 font-body text-xs text-brand-charcoal/60">
            Box, filler, stickers, card, and seal — per order.
          </p>
          <div className="mt-4">
            <NumberField
              label="Packaging cost (Rs per order)"
              prefix="Rs"
              step={0.01}
              hint="Prefilled from a packaging batch — adjust if your kit or quantities change."
              value={form.packagingCost}
              onChange={(v) => set("packagingCost", v)}
            />
          </div>
        </section>

        <section className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
          <h2 className="font-display text-lg font-semibold text-brand-umber-dark">Fulfilment &amp; courier</h2>
          <p className="mt-1 font-body text-xs text-brand-charcoal/60">PostEx COD costs, per order.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Courier fee (Rs per order)"
              prefix="Rs"
              hint="Confirm against your current PostEx rate card."
              value={form.courierFee}
              onChange={(v) => set("courierFee", v)}
            />
            <NumberField
              label="COD handling fee (Rs)"
              prefix="Rs"
              hint="Leave at 0 if it's bundled into the courier fee."
              value={form.codFee}
              onChange={(v) => set("codFee", v)}
            />
          </div>

          <label className="mt-4 flex items-start gap-2">
            <input
              type="checkbox"
              checked={form.rtoEnabled}
              onChange={(e) => set("rtoEnabled", e.target.checked)}
              className="mt-0.5"
            />
            <span className="font-body text-sm font-semibold text-brand-charcoal">
              Account for returned (RTO) orders
              <span className="mt-0.5 block font-body text-xs font-normal leading-snug text-brand-charcoal/60">
                COD orders that get sent back still cost packaging and courier both ways. Spread that cost across the
                orders that do sell.
              </span>
            </span>
          </label>

          {form.rtoEnabled && (
            <div className="mt-3 border-l-2 border-brand-umber/15 pl-5">
              <NumberField
                label="Expected return rate (%)"
                suffix="%"
                hint="Share of shipped orders that come back undelivered or refused."
                value={form.rtoRatePct}
                onChange={(v) => set("rtoRatePct", v)}
              />
            </div>
          )}
        </section>

        <section className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
          <h2 className="font-display text-lg font-semibold text-brand-umber-dark">Margin</h2>
          <p className="mt-1 font-body text-xs text-brand-charcoal/60">
            What you want to keep once product, packaging, and courier are covered.
          </p>
          <div className="mt-4">
            <NumberField
              label="Target margin (% of selling price)"
              suffix="%"
              hint="50% margin means half of what a customer pays is profit."
              value={form.targetMarginPct}
              onChange={(v) => set("targetMarginPct", v)}
            />
          </div>
          <button
            type="button"
            onClick={() => setForm(DEFAULTS)}
            className="mt-4 rounded-full border border-brand-umber/30 px-4 py-1.5 font-body text-xs font-medium text-brand-umber-dark hover:bg-brand-sky/10"
          >
            Reset to defaults
          </button>
        </section>
      </div>

      {/* Summary */}
      <div className="space-y-5 lg:sticky lg:top-6">
        <div className="rounded-xl bg-brand-umber-dark p-6 text-brand-ivory">
          <p className="font-body text-xs text-brand-ivory/70">Suggested selling price</p>
          <p className="mt-1 font-display text-4xl font-semibold">{formatPKR(result.suggestedPrice)}</p>
          <p className="mt-1 font-body text-xs text-brand-ivory/70">
            Profit {formatPKR(result.profitAtSuggestedPrice)} per piece at this price
          </p>

          <div className="mt-4 space-y-1.5 border-t border-brand-ivory/15 pt-4 font-body text-sm">
            <div className="flex justify-between text-brand-ivory/85">
              <span>Product + agent fee + freight/customs</span>
              <span>{formatPKR(result.baseProductCost)}</span>
            </div>
            <div className="flex justify-between text-brand-ivory/85">
              <span>Packaging</span>
              <span>{formatPKR(result.packagingCost)}</span>
            </div>
            <div className="flex justify-between text-brand-ivory/85">
              <span>Courier + COD</span>
              <span>{formatPKR(result.courierAndCodCost)}</span>
            </div>
            {form.rtoEnabled && result.rtoAdjustment > 0 && (
              <div className="flex justify-between text-brand-ivory/85">
                <span>Return-order adjustment</span>
                <span>{formatPKR(result.rtoAdjustment)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-brand-ivory/15 pt-2 font-semibold text-brand-ivory">
              <span>Total cost per piece sold</span>
              <span>{formatPKR(result.totalCostPerPieceSold)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
          <h2 className="font-display text-base font-semibold text-brand-umber-dark">Check your price</h2>
          <p className="mt-1 font-body text-xs text-brand-charcoal/60">Type what you&apos;re actually charging.</p>
          <div className="mt-3">
            <NumberField
              label="Your price (Rs)"
              prefix="Rs"
              value={effectiveYourPrice}
              onChange={(v) => set("yourPrice", v)}
            />
          </div>
          <div className="mt-3 space-y-1.5 font-body text-sm text-brand-charcoal">
            <div className="flex justify-between">
              <span className="text-brand-charcoal/60">Profit at this price</span>
              <span className="font-medium">{formatPKR(yourCheck.profit)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-brand-charcoal/60">Margin at this price</span>
              <span className={clsx("rounded-full px-2.5 py-0.5 font-semibold", marginToneClass[tone])}>
                {yourCheck.marginPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
