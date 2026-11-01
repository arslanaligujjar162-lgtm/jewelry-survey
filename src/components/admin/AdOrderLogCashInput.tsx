"use client";

import { useState, useTransition } from "react";
import { updateAdOrderLogCashCollectedAction } from "@/lib/admin/actions";

export function AdOrderLogCashInput({ entryId, initialValue }: { entryId: string; initialValue: number | null }) {
  const [value, setValue] = useState(initialValue?.toString() ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    const trimmed = value.trim();
    let parsed: number | null = null;
    if (trimmed !== "") {
      const n = parseFloat(trimmed);
      parsed = Number.isFinite(n) ? Math.round(n) : null;
    }
    startTransition(() => {
      updateAdOrderLogCashCollectedAction(entryId, parsed);
    });
  }

  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      disabled={isPending}
      placeholder="—"
      title="What PostEx/Leopards actually remitted to you — not the order's face value, and usually later than the delivery date."
      className="w-24 rounded-md border border-brand-umber/20 bg-white px-2 py-1.5 font-body text-sm text-brand-charcoal outline-none focus-visible:ring-2 focus-visible:ring-brand-sky disabled:opacity-50"
    />
  );
}
