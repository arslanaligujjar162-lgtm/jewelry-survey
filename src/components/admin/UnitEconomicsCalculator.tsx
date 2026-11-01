"use client";

import { useMemo } from "react";
import clsx from "clsx";
import { calculateUnitEconomics, reconcileAdSpend, type UnitEconomicsInput } from "@/lib/pricing-math";
import { usePersistedState } from "@/lib/use-persisted-state";
import { formatPKR } from "@/lib/format";

interface ReconciliationState {
  spend: number;
  placedOrders: number;
  deliveredOrders: number;
  exchangedOrReturnedAfterDelivery: number;
  rtoOrders: number;
  metaPurchaseValue: number;
  cashCollectedRevenue: number;
  taxAndFeeRatePctOnAdPayments: number;
}

type FormState = UnitEconomicsInput & ReconciliationState;

// The spreadsheet's own worked example: Rs 2,200 piece, free delivery,
// 30% cancellation (k), 20% RTO (r).
const DEFAULTS: FormState = {
  price: 2200,
  discount: 0,
  deliveryChargeToCustomer: 0,
  landedCost: 550,
  packaging: 150,
  outboundCourier: 250,
  codFeeRatePct: 4,
  returnFee: 0,
  rtoRatePct: 20,
  cancellationRatePct: 30,
  spend: 0,
  placedOrders: 0,
  deliveredOrders: 0,
  exchangedOrReturnedAfterDelivery: 0,
  rtoOrders: 0,
  metaPurchaseValue: 0,
  cashCollectedRevenue: 0,
  taxAndFeeRatePctOnAdPayments: 0,
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

export function UnitEconomicsCalculator() {
  const [form, setForm] = usePersistedState<FormState>("admin-1720-unit-economics", DEFAULTS);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const economics = useMemo(() => calculateUnitEconomics(form), [form]);

  const reconciliation = useMemo(
    () =>
      reconcileAdSpend({
        ...form,
        contributionPerDeliveredOrder: economics.contributionPerDeliveredOrder,
        lossPerRtoParcel: economics.lossPerRtoParcel,
      }),
    [form, economics.contributionPerDeliveredOrder, economics.lossPerRtoParcel],
  );

  const hasRealData = form.spend > 0 && form.placedOrders > 0;
  const isProfitable = reconciliation.contributionAfterAds >= 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        {/* Inputs */}
        <div className="space-y-5">
          <section className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
            <h2 className="font-display text-lg font-semibold text-brand-umber-dark">Per-order economics</h2>
            <p className="mt-1 font-body text-xs text-brand-charcoal/60">
              What one order is actually worth once COD failure is priced in. r = RTO rate (refused/returned ÷
              shipped). k = cancellation rate (cancelled before dispatch ÷ placed).
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField label="Price (Rs)" prefix="Rs" value={form.price} onChange={(v) => set("price", v)} />
              <NumberField
                label="Discount (Rs)"
                prefix="Rs"
                value={form.discount}
                onChange={(v) => set("discount", v)}
              />
              <NumberField
                label="Delivery charged to customer (Rs)"
                prefix="Rs"
                value={form.deliveryChargeToCustomer}
                onChange={(v) => set("deliveryChargeToCustomer", v)}
              />
              <NumberField
                label="Landed cost (Rs)"
                prefix="Rs"
                hint="Product + agent fee + freight/customs — from the calculator above."
                value={form.landedCost}
                onChange={(v) => set("landedCost", v)}
              />
              <NumberField
                label="Packaging (Rs)"
                prefix="Rs"
                value={form.packaging}
                onChange={(v) => set("packaging", v)}
              />
              <NumberField
                label="Outbound courier (Rs)"
                prefix="Rs"
                value={form.outboundCourier}
                onChange={(v) => set("outboundCourier", v)}
              />
              <NumberField
                label="COD fee rate (%)"
                suffix="%"
                step={0.1}
                hint="Rounded up on revenue, per courier."
                value={form.codFeeRatePct}
                onChange={(v) => set("codFeeRatePct", v)}
              />
              <NumberField
                label="Return fee (Rs)"
                prefix="Rs"
                hint="Only if the courier charges one on top of outbound + packaging."
                value={form.returnFee}
                onChange={(v) => set("returnFee", v)}
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField
                label="RTO rate — r (%)"
                suffix="%"
                hint="Share of shipped orders refused or returned."
                value={form.rtoRatePct}
                onChange={(v) => set("rtoRatePct", v)}
              />
              <NumberField
                label="Cancellation rate — k (%)"
                suffix="%"
                hint="Share of placed orders cancelled before dispatch."
                value={form.cancellationRatePct}
                onChange={(v) => set("cancellationRatePct", v)}
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
            <p className="font-body text-xs text-brand-ivory/70">Break-even reported ROAS</p>
            <p className="mt-1 font-display text-4xl font-semibold">{economics.breakEvenReportedRoas.toFixed(2)}×</p>
            <p className="mt-1 font-body text-xs text-brand-ivory/70">
              Naive break-even (ignoring RTO &amp; cancellations) would say {economics.naiveBreakEvenRoas.toFixed(2)}×
              — {economics.breakEvenReportedRoas > economics.naiveBreakEvenRoas ? "lower than" : "near"} reality.
            </p>

            <div className="mt-4 space-y-1.5 border-t border-brand-ivory/15 pt-4 font-body text-sm">
              <div className="flex justify-between text-brand-ivory/85">
                <span>Revenue per order</span>
                <span>{formatPKR(economics.revenue)}</span>
              </div>
              <div className="flex justify-between text-brand-ivory/85">
                <span>COD fee</span>
                <span>{formatPKR(economics.codFee)}</span>
              </div>
              <div className="flex justify-between text-brand-ivory/85">
                <span>Contribution per delivered order (U)</span>
                <span>{formatPKR(economics.contributionPerDeliveredOrder)}</span>
              </div>
              <div className="flex justify-between text-brand-ivory/85">
                <span>Loss per RTO parcel (L)</span>
                <span>{formatPKR(economics.lossPerRtoParcel)}</span>
              </div>
              <div className="flex justify-between text-brand-ivory/85">
                <span>Expected contribution per shipped order</span>
                <span>{formatPKR(economics.expectedContributionPerShippedOrder)}</span>
              </div>
              <div className="flex justify-between border-t border-brand-ivory/15 pt-2 font-semibold text-brand-ivory">
                <span>Max ad cost per placed order</span>
                <span>{formatPKR(economics.expectedContributionPerPlacedOrder)}</span>
              </div>
              <div className="flex justify-between text-brand-ivory/85">
                <span>Break-even cost per delivered order</span>
                <span>{formatPKR(economics.breakEvenCostPerDeliveredOrder)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
        <h2 className="font-display text-lg font-semibold text-brand-umber-dark">Reconcile against real ad spend</h2>
        <p className="mt-1 font-body text-xs text-brand-charcoal/60">
          Type what actually happened — from your order log and Meta/Ads Manager — to see whether this period made
          money, not just whether it looked good on the reported ROAS.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField label="Ad spend (Rs)" prefix="Rs" value={form.spend} onChange={(v) => set("spend", v)} />
          <NumberField
            label="Placed orders"
            value={form.placedOrders}
            onChange={(v) => set("placedOrders", v)}
          />
          <NumberField
            label="Delivered orders"
            value={form.deliveredOrders}
            onChange={(v) => set("deliveredOrders", v)}
          />
          <NumberField label="RTO orders" value={form.rtoOrders} onChange={(v) => set("rtoOrders", v)} />
          <NumberField
            label="Exchanged/returned after delivery"
            value={form.exchangedOrReturnedAfterDelivery}
            onChange={(v) => set("exchangedOrReturnedAfterDelivery", v)}
          />
          <NumberField
            label="Meta-reported purchase value (Rs)"
            prefix="Rs"
            value={form.metaPurchaseValue}
            onChange={(v) => set("metaPurchaseValue", v)}
          />
          <NumberField
            label="Cash actually collected (Rs)"
            prefix="Rs"
            hint="Delivered orders × what was really paid, not the order's face value."
            value={form.cashCollectedRevenue}
            onChange={(v) => set("cashCollectedRevenue", v)}
          />
          <NumberField
            label="Tax/fees on ad payments (%)"
            suffix="%"
            step={0.1}
            hint="Sales tax or card fee your ad platform bills on top of spend."
            value={form.taxAndFeeRatePctOnAdPayments}
            onChange={(v) => set("taxAndFeeRatePctOnAdPayments", v)}
          />
        </div>

        {hasRealData ? (
          <div className="mt-5 grid gap-4 border-t border-brand-umber/10 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-body text-xs text-brand-charcoal/60">Reported ROAS</p>
              <p className="font-display text-xl font-semibold text-brand-umber-dark">
                {reconciliation.reportedRoas.toFixed(2)}×
              </p>
            </div>
            <div>
              <p className="font-body text-xs text-brand-charcoal/60">Reconciled ROAS (cash collected)</p>
              <p className="font-display text-xl font-semibold text-brand-umber-dark">
                {reconciliation.reconciledRoas.toFixed(2)}×
              </p>
            </div>
            <div>
              <p className="font-body text-xs text-brand-charcoal/60">Cost per delivered order</p>
              <p className="font-display text-xl font-semibold text-brand-umber-dark">
                {formatPKR(reconciliation.costPerDeliveredOrder)}
              </p>
            </div>
            <div>
              <p className="font-body text-xs text-brand-charcoal/60">True ad cost (incl. tax/fees)</p>
              <p className="font-display text-xl font-semibold text-brand-umber-dark">
                {formatPKR(reconciliation.trueAdCost)}
              </p>
            </div>

            <div
              className={clsx(
                "col-span-full flex flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-3",
                isProfitable ? "bg-brand-success/10" : "bg-brand-error/10",
              )}
            >
              <span className={clsx("font-body text-sm font-semibold", isProfitable ? "text-brand-success" : "text-brand-error")}>
                {isProfitable ? "Profitable after ads" : "Losing money after ads"}
              </span>
              <span className={clsx("font-display text-lg font-semibold", isProfitable ? "text-brand-success" : "text-brand-error")}>
                {formatPKR(reconciliation.contributionAfterAds)}
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-4 border-t border-brand-umber/10 pt-4 font-body text-xs text-brand-charcoal/50">
            Fill in ad spend and placed orders to see reported vs. reconciled ROAS and whether this period actually
            made money.
          </p>
        )}
      </section>
    </div>
  );
}
