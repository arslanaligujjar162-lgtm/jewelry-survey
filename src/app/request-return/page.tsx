"use client";

import { useState } from "react";
import Link from "next/link";

export default function RequestReturnPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Could not submit your request");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your request");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-umber-dark">Request received</h1>
        <p className="mt-3 max-w-md font-body text-sm text-brand-charcoal/70">
          We&apos;ll review your order and follow up on WhatsApp or by phone with next steps.
        </p>
        <Link href="/" className="mt-6 font-body text-sm text-brand-umber underline">
          Back home
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-md">
        <p className="font-body text-sm font-semibold uppercase tracking-widest text-brand-umber">Returns</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-brand-umber-dark">Request a return or exchange</h1>
        <p className="mt-3 font-body text-sm text-brand-charcoal/70">
          Read our{" "}
          <Link href="/returns-policy" className="text-brand-umber underline">
            Return &amp; Exchange Policy
          </Link>{" "}
          first, then tell us your order number and why you&apos;d like to return it.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block font-body text-sm font-medium text-brand-charcoal">
            <span className="mb-1.5 block">Order number</span>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="1720-XXXXXXXX"
              className="input"
            />
          </label>
          <label className="block font-body text-sm font-medium text-brand-charcoal">
            <span className="mb-1.5 block">Reason for return</span>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input"
            />
          </label>

          {error && (
            <p role="alert" className="font-body text-sm text-brand-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-umber py-3 font-body text-sm font-semibold text-brand-ivory disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit request"}
          </button>
        </form>
      </div>
    </div>
  );
}
