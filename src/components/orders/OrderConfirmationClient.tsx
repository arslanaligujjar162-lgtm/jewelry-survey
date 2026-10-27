"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Order } from "@/lib/types";
import { formatPKR, formatDate } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { whatsappLink } from "@/lib/brand";
import { ADVANCE_AMOUNT, advanceAccountsText, advancePaymentEnabled, remainingOnDelivery } from "@/lib/advance-payment";

export function OrderConfirmationClient() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { clear } = useCart();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // The browser that placed the order keeps its own full copy. The API
      // only serves a redacted view (no street address or full phone), so
      // it's the fallback for opening this link on another device.
      const stored = sessionStorage.getItem(`order:${orderNumber}`);
      if (stored) {
        const local: Order = JSON.parse(stored);
        if (!cancelled) setOrder(local);
        // A gateway order was saved before the customer paid, so its stored
        // copy is out of date once they return — take the live status.
        if (local.payment_method === "gateway") {
          try {
            const res = await fetch(`/api/orders/${orderNumber}`);
            if (res.ok) {
              const { order: live } = await res.json();
              if (!cancelled) setOrder({ ...local, payment_status: live.payment_status, status: live.status });
            }
          } catch {
            // keep the stored copy
          }
        }
        return;
      }

      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setOrder(data.order);
          return;
        }
      } catch {
        // fall through to not-found
      }
      if (!cancelled) setNotFound(true);
    }

    load().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  // Clear the cart once the order this page is confirming is confirmed to
  // exist — not at "place order" time, so there's no window where the cart
  // reads as empty while /checkout is still mounted and could redirect away
  // from this navigation. Safe to call on every order load; clear() on an
  // already-empty cart is a no-op.
  useEffect(() => {
    if (order) clear();
  }, [order, clear]);

  if (loading) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center py-20">
        <p className="font-body text-sm text-brand-charcoal/60">Loading your order…</p>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-umber-dark">We couldn&apos;t find that order</h1>
        <Link href="/shop" className="mt-6 font-body text-sm text-brand-umber underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const online = order.payment_method === "gateway";

  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-success/10 text-brand-success">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-5 font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">
          Order placed
        </h1>
        <p className="mt-2 font-body text-sm text-brand-charcoal/70">
          Order {order.order_number} · placed {formatDate(order.created_at)}
        </p>
        <p className="mt-4 font-body text-sm text-brand-charcoal/80">
          {online ? (
            <>
              {formatPKR(ADVANCE_AMOUNT)} advance paid online, then {formatPKR(remainingOnDelivery(order.total))} in
              cash when it arrives.
            </>
          ) : advancePaymentEnabled() ? (
            <>
              Pay {formatPKR(ADVANCE_AMOUNT)} in advance to confirm, then {formatPKR(remainingOnDelivery(order.total))}{" "}
              in cash when it arrives.
            </>
          ) : (
            <>Pay {formatPKR(order.total)} in cash when it arrives.</>
          )}
        </p>
      </div>

      {online && (
        <div className="mx-auto mt-8 max-w-xl rounded-xl border-2 border-brand-umber-dark bg-brand-butter p-6 text-center shadow-retro">
          <p className="font-display text-2xl font-semibold text-brand-umber-dark">
            {order.payment_status === "paid" ? "Advance received — your order is confirmed" : "Confirming your payment"}
          </p>
          <p className="mt-2 font-body text-sm text-brand-charcoal/80">
            {order.payment_status === "paid"
              ? "Thank you. We'll message you on WhatsApp when it's dispatched."
              : "This usually takes a minute. Refresh this page to check, or message us on WhatsApp if it doesn't update."}
          </p>
        </div>
      )}

      {advancePaymentEnabled() && !online && (
        <div className="mx-auto mt-8 max-w-xl rounded-xl border-2 border-brand-umber-dark bg-brand-butter p-6 text-center shadow-retro">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-brand-umber">
            Step 1 — Send the advance
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-brand-umber-dark">
            Send {formatPKR(ADVANCE_AMOUNT)} to confirm
          </p>
          <p className="mt-2 font-body text-sm text-brand-charcoal/80">
            {advanceAccountsText()}. The remaining {formatPKR(remainingOnDelivery(order.total))} is paid in cash on
            delivery.
          </p>
        </div>
      )}

      <div
        className={`mx-auto max-w-xl rounded-xl border-2 border-brand-umber-dark bg-brand-butter p-6 text-center shadow-retro ${online || advancePaymentEnabled() ? "mt-4" : "mt-8"}`}
      >
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-brand-umber">What happens next</p>
        <p className="mt-2 font-display text-2xl font-semibold text-brand-umber-dark">
          We&apos;ll confirm your order on WhatsApp
        </p>
        <p className="mt-2 font-body text-sm text-brand-charcoal/80">
          Our team will message you{order.customer_phone && !order.customer_phone.includes("•") ? ` on ${order.customer_phone}` : ""}{" "}
          before we dispatch it. There&apos;s nothing more you need to do.
        </p>
      </div>

      <p className="mx-auto mt-4 max-w-xl text-center font-body text-sm text-brand-charcoal/70">
        Questions about your order?{" "}
        <a
          href={whatsappLink(`Hi 1720! I have a question about order ${order.order_number}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-umber underline"
        >
          Message us on WhatsApp
        </a>
      </p>

      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-brand-umber/10 p-6">
        <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">Order details</h2>
        <ul className="mt-4 space-y-2 font-body text-sm text-brand-charcoal/80">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span>
                {item.name} × {item.quantity}
                {item.colour ? ` · ${item.colour}` : ""}
                {item.ring_size ? ` (US ${item.ring_size})` : ""}
              </span>
              <span>{formatPKR(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-brand-umber/10 pt-4 font-body text-sm">
          <div className="flex justify-between">
            <span className="text-brand-charcoal/70">Subtotal</span>
            <span>{formatPKR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-brand-success">
              <span>Discount</span>
              <span>−{formatPKR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-brand-charcoal/70">Delivery</span>
            <span>{order.delivery_fee === 0 ? "Free" : formatPKR(order.delivery_fee)}</span>
          </div>
          <div className="flex justify-between border-t border-brand-umber/10 pt-2 font-semibold text-brand-charcoal">
            <span>Total</span>
            <span>{formatPKR(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-brand-umber/10 pt-4 font-body text-sm text-brand-charcoal/80">
          <p className="font-semibold text-brand-umber-dark">Shipping to</p>
          <p className="mt-1">
            {order.shipping_address.fullName}
            <br />
            {order.shipping_address.addressLine1 && (
              <>
                {order.shipping_address.addressLine1}
                {order.shipping_address.addressLine2 ? `, ${order.shipping_address.addressLine2}` : ""}
                <br />
              </>
            )}
            {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postalCode}
          </p>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-full shadow-retro-sm bg-brand-umber px-8 py-4 font-body text-base font-bold text-brand-ivory transition hover:-translate-y-0.5 hover:bg-brand-umber-dark hover:shadow-[5px_5px_0_0_#482a24] active:translate-y-0 active:shadow-none"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
