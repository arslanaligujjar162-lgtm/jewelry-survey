"use client";

import { useState, useTransition } from "react";
import { createAdOrderLogEntry, type AdOrderLogFormValues } from "@/lib/admin/actions";
import type { AdOrderLogSource, AdOrderLogStatus } from "@/lib/types";

const SOURCES: { value: AdOrderLogSource; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram_dm", label: "Instagram DM" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

const STATUSES: AdOrderLogStatus[] = ["placed", "cancelled", "shipped", "delivered", "rto"];

const inputClass =
  "w-full rounded-md border border-brand-umber/20 bg-white px-3 py-2 font-body text-base text-brand-charcoal outline-none focus-visible:ring-2 focus-visible:ring-brand-sky";

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block font-body text-sm font-semibold text-brand-charcoal">{label}</span>
      {children}
      {hint && <span className="mt-1 block font-body text-sm leading-snug text-brand-charcoal/50">{hint}</span>}
    </label>
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AdOrderLogForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [orderDate, setOrderDate] = useState(todayIso());
  const [source, setSource] = useState<AdOrderLogSource>("whatsapp");
  const [adName, setAdName] = useState("");
  const [productName, setProductName] = useState("");
  const [revenue, setRevenue] = useState("");
  const [status, setStatus] = useState<AdOrderLogStatus>("placed");
  const [cashCollected, setCashCollected] = useState("");
  const [notes, setNotes] = useState("");

  function reset() {
    setOrderDate(todayIso());
    setSource("whatsapp");
    setAdName("");
    setProductName("");
    setRevenue("");
    setStatus("placed");
    setCashCollected("");
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productName.trim() || revenue.trim() === "") {
      setError("Product and revenue are required.");
      return;
    }
    setError(null);

    const values: AdOrderLogFormValues = {
      order_date: orderDate,
      source,
      ad_name: adName.trim() || null,
      product_name: productName.trim(),
      revenue: Math.round(parseFloat(revenue)) || 0,
      status,
      cash_collected: cashCollected.trim() === "" ? null : Math.round(parseFloat(cashCollected)) || 0,
      dispatched_at: null,
      resolved_at: null,
      notes: notes.trim() || null,
    };

    startTransition(async () => {
      try {
        await createAdOrderLogEntry(values);
        reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5">
      <h2 className="font-display text-xl font-semibold text-brand-umber-dark">Log an order</h2>
      <p className="mt-1 font-body text-sm text-brand-charcoal/60">
        Every order, however it came in — website, WhatsApp, or Instagram DM.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Date">
          <input
            type="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Source">
          <select value={source} onChange={(e) => setSource(e.target.value as AdOrderLogSource)} className={inputClass}>
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ad / campaign name" hint="Leave blank if organic or no ad involved.">
          <input
            type="text"
            value={adName}
            onChange={(e) => setAdName(e.target.value)}
            placeholder="e.g. mermaid-tear-reels-oct"
            className={inputClass}
          />
        </Field>
        <Field label="Product">
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Mermaid Tear"
            className={inputClass}
          />
        </Field>
        <Field label="Revenue (Rs)" hint="Price − discount + delivery charged to customer.">
          <input
            type="number"
            min={0}
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as AdOrderLogStatus)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Cash collected (Rs)"
          hint="Not the same moment as 'delivered' — this is once PostEx/Leopards actually remits it to you. Leave blank and come back to it."
        >
          <input
            type="number"
            min={0}
            value={cashCollected}
            onChange={(e) => setCashCollected(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Notes" className="sm:col-span-2 lg:col-span-2">
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
        </Field>
      </div>

      {error && <p className="mt-3 font-body text-sm text-brand-error">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-full bg-brand-umber px-5 py-2 font-body text-base font-semibold text-brand-ivory transition hover:bg-brand-umber-dark disabled:opacity-50"
      >
        {isPending ? "Logging…" : "Log order"}
      </button>
    </form>
  );
}
