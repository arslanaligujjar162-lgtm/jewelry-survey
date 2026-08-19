"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Order } from "@/lib/types";
import { formatPKR, formatDate } from "@/lib/format";

export default function OrderConfirmationPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params.orderNumber;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setOrder(data.order);
          return;
        }
      } catch {
        // fall through to session storage
      }

      const stored = sessionStorage.getItem(`order:${orderNumber}`);
      if (!cancelled) {
        if (stored) setOrder(JSON.parse(stored));
        else setNotFound(true);
      }
    }

    load().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

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
          Order confirmed
        </h1>
        <p className="mt-2 font-body text-sm text-brand-charcoal/70">
          Order {order.order_number} · placed {formatDate(order.created_at)}
        </p>
        <p className="mt-4 font-body text-sm text-brand-charcoal/80">
          We&apos;ll send updates to {order.customer_phone} as your order moves. Pay {formatPKR(order.total)} in cash
          when it arrives.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-brand-umber/10 p-6">
        <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">Order details</h2>
        <ul className="mt-4 space-y-2 font-body text-sm text-brand-charcoal/80">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span>
                {item.name} × {item.quantity}
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
            {order.shipping_address.addressLine1}
            {order.shipping_address.addressLine2 ? `, ${order.shipping_address.addressLine2}` : ""}
            <br />
            {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postalCode}
          </p>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-full bg-brand-umber px-7 py-3 font-body text-sm font-semibold text-brand-ivory transition hover:bg-brand-umber-dark"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
