"use client";

import { useMemo } from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  calculatePieceCost,
  checkPriceAgainstCost,
  SOURCING_DEFAULTS,
  type CatalogProductOption,
} from "@/lib/pricing-math";
import { usePersistedState } from "@/lib/use-persisted-state";
import { formatPKR } from "@/lib/format";

interface Assumptions {
  exchangeRate: number;
  agentFeePct: number;
  freightRatePerKg: number;
  customsDuty: number;
  packagingCost: number;
  courierFee: number;
  codFee: number;
  rtoEnabled: boolean;
  rtoRatePct: number;
  targetMarginPct: number;
}

const DEFAULTS: Assumptions = {
  exchangeRate: 39.5,
  agentFeePct: 10,
  freightRatePerKg: 4000,
  customsDuty: 0,
  packagingCost: 98.98,
  courierFee: 200,
  codFee: 0,
  rtoEnabled: false,
  rtoRatePct: 15,
  targetMarginPct: 50,
};

function NumberField({
  label,
  suffix,
  prefix,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  suffix?: string;
  prefix?: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-body text-sm font-semibold text-brand-charcoal">{label}</span>
      <span className="flex items-center overflow-hidden rounded-md border border-brand-umber/20 bg-white">
        {prefix && (
          <span className="border-r border-brand-umber/20 px-2 py-1.5 font-body text-sm text-brand-charcoal/60">
            {prefix}
          </span>
        )}
        <input
          type="number"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="min-w-0 flex-1 bg-transparent px-2 py-1.5 font-body text-base text-brand-charcoal outline-none focus-visible:ring-2 focus-visible:ring-brand-sky"
        />
        {suffix && (
          <span className="border-l border-brand-umber/20 px-2 py-1.5 font-body text-sm text-brand-charcoal/60">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}

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

export function SkuPricingSheet({ catalogProducts }: { catalogProducts: CatalogProductOption[] }) {
  const [assumptions, setAssumptions] = usePersistedState<Assumptions>("admin-1720-sku-sheet-assumptions", DEFAULTS);

  function set<K extends keyof Assumptions>(key: K, value: Assumptions[K]) {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  }

  const rows = useMemo(() => {
    return catalogProducts
      .map((product) => {
        const sourcing = SOURCING_DEFAULTS[product.name];
        const costKnown = Boolean(sourcing);
        const result = calculatePieceCost({
          costMode: "rmb",
          productCostRmb: sourcing?.rmbCost ?? 0,
          exchangeRate: assumptions.exchangeRate,
          productCostPkr: 0,
          agentFeePct: assumptions.agentFeePct,
          freightRatePerKg: assumptions.freightRatePerKg,
          unitWeightGrams: sourcing?.weightGrams ?? 0,
          customsDuty: assumptions.customsDuty,
          packagingCost: assumptions.packagingCost,
          courierFee: assumptions.courierFee,
          codFee: assumptions.codFee,
          rtoEnabled: assumptions.rtoEnabled,
          rtoRatePct: assumptions.rtoRatePct,
          targetMarginPct: assumptions.targetMarginPct,
        });
        const check = checkPriceAgainstCost(product.priceRs, result.totalCostPerPieceSold);
        return { product, costKnown, result, check };
      })
      .sort((a, b) => {
        // A margin computed against an unrecorded (zero) cost is fake, not
        // just low-confidence — group those at the end instead of letting
        // their meaningless high % sort them in among real, worst-first rows.
        if (a.costKnown !== b.costKnown) return a.costKnown ? -1 : 1;
        if (!a.costKnown) return a.product.name.localeCompare(b.product.name);
        return a.check.marginPct - b.check.marginPct;
      });
  }, [catalogProducts, assumptions]);

  const knownCount = rows.filter((r) => r.costKnown).length;

  return (
    <div className="space-y-4">
      <details className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
        <summary className="cursor-pointer font-display text-lg font-semibold text-brand-umber-dark">
          Assumptions used below ({knownCount}/{rows.length} products have a recorded sourcing cost)
        </summary>
        <p className="mt-2 font-body text-sm text-brand-charcoal/60">
          Applied to every product below. Adjust to match what you&apos;d actually set up the batch with — these are
          separate from the single-product calculator above.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <NumberField
            label="Exchange rate (¥ → Rs)"
            prefix="Rs"
            step={0.01}
            value={assumptions.exchangeRate}
            onChange={(v) => set("exchangeRate", v)}
          />
          <NumberField
            label="Agent fee (%)"
            suffix="%"
            step={0.1}
            value={assumptions.agentFeePct}
            onChange={(v) => set("agentFeePct", v)}
          />
          <NumberField
            label="Freight (Rs/kg)"
            prefix="Rs"
            value={assumptions.freightRatePerKg}
            onChange={(v) => set("freightRatePerKg", v)}
          />
          <NumberField
            label="Packaging (Rs/order)"
            prefix="Rs"
            step={0.01}
            value={assumptions.packagingCost}
            onChange={(v) => set("packagingCost", v)}
          />
          <NumberField
            label="Courier + COD (Rs/order)"
            prefix="Rs"
            value={assumptions.courierFee}
            onChange={(v) => set("courierFee", v)}
          />
        </div>
        <label className="mt-4 flex items-center gap-2 font-body text-sm font-semibold text-brand-charcoal">
          <input
            type="checkbox"
            checked={assumptions.rtoEnabled}
            onChange={(e) => set("rtoEnabled", e.target.checked)}
            className="h-4 w-4 accent-brand-umber"
          />
          Account for RTO orders
        </label>
        {assumptions.rtoEnabled && (
          <div className="mt-2 max-w-[200px]">
            <NumberField
              label="Expected return rate (%)"
              suffix="%"
              value={assumptions.rtoRatePct}
              onChange={(v) => set("rtoRatePct", v)}
            />
          </div>
        )}
      </details>

      <div className="overflow-x-auto rounded-xl border border-brand-umber/10 bg-brand-ivory">
        <table className="w-full text-left font-body text-base">
          <thead className="bg-brand-sky/10">
            <tr>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Product</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Selling price</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Landed cost</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Total cost / piece sold</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Profit at real price</th>
              <th className="px-4 py-3 font-semibold text-brand-umber-dark">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-umber/10">
            {rows.map(({ product, costKnown, result, check }) => {
              const tone = marginTone(check.marginPct);
              return (
                <tr key={product.id} className={clsx(!costKnown && "opacity-70")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white">
                        <Image src={product.image} alt={product.name} fill sizes="40px" className="object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-brand-charcoal">{product.name}</p>
                        {!costKnown && (
                          <p className="font-body text-[13px] font-medium text-brand-brass">No sourcing cost saved</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-charcoal/80">{formatPKR(product.priceRs)}</td>
                  {costKnown ? (
                    <>
                      <td className="px-4 py-3 text-brand-charcoal/80">{formatPKR(result.baseProductCost)}</td>
                      <td className="px-4 py-3 text-brand-charcoal/80">{formatPKR(result.totalCostPerPieceSold)}</td>
                      <td className="px-4 py-3 text-brand-charcoal/80">{formatPKR(check.profit)}</td>
                      <td className="px-4 py-3">
                        <span className={clsx("rounded-full px-2.5 py-0.5 font-semibold", marginToneClass[tone])}>
                          {check.marginPct.toFixed(1)}%
                        </span>
                      </td>
                    </>
                  ) : (
                    <td colSpan={4} className="px-4 py-3 font-body text-sm text-brand-charcoal/50">
                      Cost unknown — enter it in the calculator below to see a real margin here.
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
