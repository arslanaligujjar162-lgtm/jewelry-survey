"use client";

import { useMemo } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  countKnownSourcingCosts,
  evaluateReadinessStage,
  type CatalogProductOption,
  type ReadinessFlags,
  type ReadinessStage,
} from "@/lib/pricing-math";
import { usePersistedState } from "@/lib/use-persisted-state";

type ManualFlagKey = Exclude<keyof ReadinessFlags, "allSkuCostsKnown" | "orderLogLive">;

type ManualFlags = Record<ManualFlagKey, boolean>;

const MANUAL_DEFAULTS: ManualFlags = {
  purchaseEventTested: false,
  confirmationStepBeforeDispatch: false,
  maxTestBudgetSet: false,
  conversionPathChosen: false,
  tracksReconcile2Weeks: false,
  enoughDeliveredOrdersToCompare: false,
  contributionAfterAdsPositive: false,
  holdsAcrossCreativeRefresh: false,
  stockCanAbsorbMoreOrders: false,
};

const STAGE_LABEL: Record<ReadinessStage, string> = {
  "not-ready": "Not ready",
  "controlled-testing": "Ready for controlled testing",
  "structured-optimisation": "Ready for structured optimisation",
  "ready-to-scale": "Ready to scale",
};

const STAGE_TONE: Record<ReadinessStage, string> = {
  "not-ready": "bg-brand-error/10 text-brand-error",
  "controlled-testing": "bg-brand-brass/15 text-brand-brass",
  "structured-optimisation": "bg-brand-sky/20 text-brand-umber-dark",
  "ready-to-scale": "bg-brand-success/10 text-brand-success",
};

const SECTIONS: { stage: ReadinessStage; title: string; items: { key: ManualFlagKey; label: string }[] }[] = [
  {
    stage: "controlled-testing",
    title: "To clear “not ready” and start controlled testing",
    items: [
      { key: "purchaseEventTested", label: "Purchase event tested in Meta Events Manager (value + PKR currency)" },
      { key: "confirmationStepBeforeDispatch", label: "Every order gets a call/message confirmation before dispatch" },
      { key: "maxTestBudgetSet", label: "A written maximum you can afford to lose on the first test" },
      { key: "conversionPathChosen", label: "One conversion path chosen (Website, WhatsApp, or Conversations)" },
    ],
  },
  {
    stage: "structured-optimisation",
    title: "To move into structured optimisation",
    items: [
      { key: "tracksReconcile2Weeks", label: "Tracking reconciles to the order log within tolerance for 2+ weeks" },
      { key: "enoughDeliveredOrdersToCompare", label: "Enough delivered orders per tested option to see a real difference" },
    ],
  },
  {
    stage: "ready-to-scale",
    title: "To scale",
    items: [
      { key: "contributionAfterAdsPositive", label: "Contribution after ads is positive on delivered orders over several weeks" },
      { key: "holdsAcrossCreativeRefresh", label: "That result holds across at least one creative refresh" },
      { key: "stockCanAbsorbMoreOrders", label: "Stock and fulfilment can absorb more orders" },
    ],
  },
];

export function ReadinessPanel({
  catalogProducts,
  orderLogEntryCount,
}: {
  catalogProducts: CatalogProductOption[];
  orderLogEntryCount: number;
}) {
  const [manual, setManual] = usePersistedState<ManualFlags>("admin-1720-readiness", MANUAL_DEFAULTS);

  const skuCosts = useMemo(() => countKnownSourcingCosts(catalogProducts), [catalogProducts]);
  const allSkuCostsKnown = skuCosts.total > 0 && skuCosts.known === skuCosts.total;
  const orderLogLive = orderLogEntryCount > 0;

  const flags: ReadinessFlags = { allSkuCostsKnown, orderLogLive, ...manual };
  const { stage, blockingNextStage } = evaluateReadinessStage(flags);

  function toggle(key: ManualFlagKey) {
    setManual((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-5">
      <div className={clsx("flex flex-wrap items-center justify-between gap-3 rounded-xl p-5", STAGE_TONE[stage])}>
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-wide opacity-70">Readiness</p>
          <p className="font-display text-3xl font-semibold">{STAGE_LABEL[stage]}</p>
        </div>
        {blockingNextStage.length > 0 && (
          <p className="max-w-sm font-body text-sm opacity-80">
            {blockingNextStage.length} item{blockingNextStage.length === 1 ? "" : "s"} away from the next stage.
          </p>
        )}
      </div>

      <section className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-body text-base font-semibold text-brand-charcoal">Per-SKU landed cost known</p>
            <p className="font-body text-sm text-brand-charcoal/60">Auto-computed from the SKU sheet below.</p>
          </div>
          <span
            className={clsx(
              "shrink-0 rounded-full px-3 py-1 font-body text-base font-semibold",
              allSkuCostsKnown ? "bg-brand-success/10 text-brand-success" : "bg-brand-error/10 text-brand-error",
            )}
          >
            {skuCosts.known}/{skuCosts.total}
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-body text-base font-semibold text-brand-charcoal">Order log is live</p>
            <p className="font-body text-sm text-brand-charcoal/60">
              Auto-computed from the{" "}
              <Link href="/admin/order-log" className="text-brand-umber underline">
                order log
              </Link>
              .
            </p>
          </div>
          <span
            className={clsx(
              "shrink-0 rounded-full px-3 py-1 font-body text-base font-semibold",
              orderLogLive ? "bg-brand-success/10 text-brand-success" : "bg-brand-error/10 text-brand-error",
            )}
          >
            {orderLogEntryCount} order{orderLogEntryCount === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      {SECTIONS.map((section) => (
        <section key={section.stage} className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
          <h3 className="font-display text-lg font-semibold text-brand-umber-dark">{section.title}</h3>
          <div className="mt-3 space-y-2">
            {section.items.map((item) => (
              <label key={item.key} className="flex items-start gap-2 font-body text-base text-brand-charcoal">
                <input
                  type="checkbox"
                  checked={manual[item.key]}
                  onChange={() => toggle(item.key)}
                  className="mt-0.5 h-4 w-4 accent-brand-umber"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
