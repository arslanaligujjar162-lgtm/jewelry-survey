"use client";

import { useState, useTransition } from "react";
import {
  bookPostExOrderAction,
  cancelPostExBookingAction,
  checkPostExPaymentStatusAction,
  markReviewRequestSentAction,
  refreshPostExStatusAction,
} from "@/lib/admin/actions";
import { formatDate } from "@/lib/format";

export function PostExPanel({
  orderId,
  trackingNumber,
  status,
  defaultCodAmount,
  reviewRequestHref,
  reviewRequestedAt,
}: {
  orderId: string;
  trackingNumber: string | null | undefined;
  status: string | null | undefined;
  defaultCodAmount: number;
  /** Set once PostEx marks this order Delivered — null until then, or if the order has no linkable products. */
  reviewRequestHref: string | null;
  reviewRequestedAt: string | null | undefined;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<string | null>(null);
  const [codAmount, setCodAmount] = useState(String(defaultCodAmount));

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
    <section className="rounded-xl border border-brand-umber/10 bg-brand-ivory p-5 font-body text-base">
      <h2 className="font-body text-base font-semibold uppercase tracking-wide text-brand-umber-dark">PostEx delivery</h2>

      {!trackingNumber ? (
        <div className="mt-3 space-y-2">
          <label className="block">
            <span className="text-brand-charcoal/60">COD amount to collect</span>
            <input
              type="number"
              min="0"
              step="1"
              value={codAmount}
              onChange={(e) => setCodAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-brand-umber/20 bg-brand-ivory px-3 py-2 font-body text-base"
            />
            <span className="mt-1 block text-sm text-brand-charcoal/50">Defaults to the order total — edit if you&apos;ve agreed a different amount with the customer.</span>
          </label>
          <button
            type="button"
            onClick={() => {
              const amount = Number(codAmount);
              if (!Number.isFinite(amount) || amount <= 0) {
                setError("Enter a valid COD amount.");
                return;
              }
              run(() => bookPostExOrderAction(orderId, amount));
            }}
            disabled={isPending}
            className="flex w-full items-center justify-center rounded-full bg-brand-umber py-2.5 font-semibold text-brand-ivory transition hover:bg-brand-umber-dark disabled:opacity-50"
          >
            {isPending ? "Booking…" : "Book with PostEx"}
          </button>
        </div>
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
            <a
              href={`/admin/postex-airway-bill/${encodeURIComponent(trackingNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-brand-umber/30 px-3 py-1.5 text-sm font-semibold text-brand-umber-dark transition hover:bg-brand-sky/10"
            >
              Download Airway Bill
            </a>
            <button
              type="button"
              onClick={() => run(() => refreshPostExStatusAction(orderId))}
              disabled={isPending}
              className="rounded-full border border-brand-umber/30 px-3 py-1.5 text-sm font-semibold text-brand-umber-dark transition hover:bg-brand-sky/10 disabled:opacity-50"
            >
              Refresh status
            </button>
            <button
              type="button"
              onClick={checkPayment}
              disabled={isPending}
              className="rounded-full border border-brand-umber/30 px-3 py-1.5 text-sm font-semibold text-brand-umber-dark transition hover:bg-brand-sky/10 disabled:opacity-50"
            >
              Check COD payout
            </button>
            <button
              type="button"
              onClick={() => run(() => cancelPostExBookingAction(orderId))}
              disabled={isPending}
              className="rounded-full border border-brand-error/40 px-3 py-1.5 text-sm font-semibold text-brand-error transition hover:bg-brand-error/10 disabled:opacity-50"
            >
              Cancel booking
            </button>
          </div>
          {paymentInfo && <p className="pt-1 text-sm text-brand-charcoal/70">COD payout: {paymentInfo}</p>}

          {reviewRequestHref && (
            <div className="mt-3 border-t border-brand-umber/10 pt-3">
              <a
                href={reviewRequestHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => markReviewRequestSentAction(orderId)}
                className="flex w-full items-center justify-center rounded-full bg-brand-success py-2.5 font-semibold text-brand-ivory transition hover:opacity-90"
              >
                {reviewRequestedAt ? "Request a review again" : "Request a review on WhatsApp"}
              </a>
              {reviewRequestedAt && (
                <p className="mt-1.5 text-center text-sm text-brand-charcoal/60">Last requested {formatDate(reviewRequestedAt)}</p>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 font-body text-sm text-brand-error">
          {error}
        </p>
      )}
    </section>
  );
}
