"use client";

import { useState, useTransition } from "react";
import {
  bookPostExOrderAction,
  cancelPostExBookingAction,
  checkPostExPaymentStatusAction,
  refreshPostExStatusAction,
} from "@/lib/admin/actions";

export function PostExPanel({
  orderId,
  trackingNumber,
  status,
}: {
  orderId: string;
  trackingNumber: string | null | undefined;
  status: string | null | undefined;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<string | null>(null);

  function run(action: () => Promise<{ error?: string }>) {
    setError(null);
    setPaymentInfo(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
    });
  }

  function checkPayment() {
    setError(null);
    startTransition(async () => {
      const result = await checkPostExPaymentStatusAction(orderId);
      if (result.error) setError(result.error);
      else setPaymentInfo(result.settled ? `Settled${result.settlementDate ? ` on ${result.settlementDate}` : ""}` : "Not settled yet");
    });
  }

  return (
    <section className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5 font-body text-sm">
      <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">PostEx delivery</h2>

      {!trackingNumber ? (
        <button
          type="button"
          onClick={() => run(() => bookPostExOrderAction(orderId))}
          disabled={isPending}
          className="mt-3 flex w-full items-center justify-center rounded-full bg-brand-umber py-2.5 font-semibold text-brand-ivory transition hover:bg-brand-umber-dark disabled:opacity-50"
        >
          {isPending ? "Booking…" : "Book with PostEx"}
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-brand-charcoal/60">Tracking number</span>
            <span className="font-medium text-brand-charcoal">{trackingNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-charcoal/60">Status</span>
            <span className="font-medium text-brand-charcoal">{status ?? "Booked"}</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={() => run(() => refreshPostExStatusAction(orderId))}
              disabled={isPending}
              className="rounded-full border border-brand-umber/30 px-3 py-1.5 text-xs font-semibold text-brand-umber-dark transition hover:bg-brand-sky/10 disabled:opacity-50"
            >
              Refresh status
            </button>
            <button
              type="button"
              onClick={checkPayment}
              disabled={isPending}
              className="rounded-full border border-brand-umber/30 px-3 py-1.5 text-xs font-semibold text-brand-umber-dark transition hover:bg-brand-sky/10 disabled:opacity-50"
            >
              Check COD payout
            </button>
            <button
              type="button"
              onClick={() => run(() => cancelPostExBookingAction(orderId))}
              disabled={isPending}
              className="rounded-full border border-brand-error/40 px-3 py-1.5 text-xs font-semibold text-brand-error transition hover:bg-brand-error/10 disabled:opacity-50"
            >
              Cancel booking
            </button>
          </div>
          {paymentInfo && <p className="pt-1 text-xs text-brand-charcoal/70">COD payout: {paymentInfo}</p>}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 font-body text-xs text-brand-error">
          {error}
        </p>
      )}
    </section>
  );
}
