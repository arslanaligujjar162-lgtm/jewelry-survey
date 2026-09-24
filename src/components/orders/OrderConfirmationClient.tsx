"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Order } from "@/lib/types";
import { formatPKR, formatDate } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { customerConfirmLink } from "@/lib/whatsapp";

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
        if (!cancelled) setOrder(JSON.parse(stored));
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
          Pay {formatPKR(order.total)} in cash when it arrives.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-xl rounded-xl border-2 border-brand-umber-dark bg-brand-butter p-6 text-center shadow-retro">
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-brand-umber">One last step</p>
        <p className="mt-2 font-display text-2xl font-semibold text-brand-umber-dark">Confirm your order on WhatsApp</p>
        <p className="mt-2 font-body text-sm text-brand-charcoal/80">
          We dispatch as soon as you confirm. Your order details are already filled in — just press send.
        </p>
        <a
          href={customerConfirmLink(order)}
          target="_blank"
          rel="noopener noreferrer"
          className="shadow-retro-sm mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-brand-umber px-7 py-3.5 font-body text-base font-bold text-brand-ivory transition hover:-translate-y-0.5 hover:bg-brand-umber-dark hover:shadow-[5px_5px_0_0_#482a24]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z" />
          </svg>
          Confirm on WhatsApp
        </a>
      </div>

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
