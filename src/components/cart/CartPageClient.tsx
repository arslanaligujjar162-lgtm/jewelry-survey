"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatPKR } from "@/lib/format";

export function CartPageClient() {
  const { lines, removeLine, updateQuantity, subtotal } = useCart();

  if (lines.length === 0) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-display text-3xl font-semibold text-brand-umber-dark">Your cart is empty</h1>
        <p className="mt-3 font-body text-sm text-brand-charcoal/70">
          Nothing here yet. Have a look through the collection.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-umber px-7 py-3 font-body text-sm font-semibold text-brand-ivory transition hover:bg-brand-umber-dark"
        >
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">Your cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <ul className="space-y-6 lg:col-span-2">
          {lines.map((line) => (
            <li
              key={`${line.product_id}-${line.ring_size ?? ""}`}
              className="flex gap-4 border-b border-brand-umber/10 pb-6"
            >
              <Link href={`/product/${line.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-brand-sky-light">
                <Image src={line.image} alt={line.name} width={96} height={96} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/product/${line.slug}`} className="font-body text-sm font-medium text-brand-charcoal hover:text-brand-umber">
                      {line.name}
                    </Link>
                    {line.ring_size && (
                      <p className="mt-1 font-body text-xs text-brand-charcoal/60">Size US {line.ring_size}</p>
                    )}
                    <p className="mt-1 font-body text-sm font-semibold text-brand-umber-dark">{formatPKR(line.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.product_id, line.ring_size)}
                    className="font-body text-xs text-brand-charcoal/50 underline hover:text-brand-error"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-3 flex items-center rounded-lg border border-brand-umber/20 w-fit">
                  <button
                    type="button"
                    onClick={() => updateQuantity(line.product_id, line.quantity - 1, line.ring_size)}
                    className="px-3 py-1.5 font-body text-sm"
                    aria-label={`Decrease quantity of ${line.name}`}
                  >
                    −
                  </button>
                  <span className="px-3 font-body text-sm">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(line.product_id, line.quantity + 1, line.ring_size)}
                    className="px-3 py-1.5 font-body text-sm"
                    aria-label={`Increase quantity of ${line.name}`}
                    disabled={line.quantity >= line.max_stock}
                  >
                    +
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-xl border border-brand-umber/10 p-6">
          <h2 className="font-body text-sm font-semibold uppercase tracking-wide text-brand-umber-dark">Order summary</h2>
          <div className="mt-4 flex justify-between font-body text-sm">
            <span className="text-brand-charcoal/70">Subtotal</span>
            <span className="font-semibold text-brand-charcoal">{formatPKR(subtotal)}</span>
          </div>
          <p className="mt-1 font-body text-xs text-brand-charcoal/60">Delivery fee calculated at checkout.</p>
          <Link
            href="/checkout"
            className="mt-5 flex w-full items-center justify-center rounded-full bg-brand-umber py-3 font-body text-sm font-semibold text-brand-ivory transition hover:bg-brand-umber-dark"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
