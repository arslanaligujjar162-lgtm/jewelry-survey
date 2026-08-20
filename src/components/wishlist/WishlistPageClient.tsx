"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { formatPKR } from "@/lib/format";

export function WishlistPageClient() {
  const { items, remove, hydrated } = useWishlist();
  const { addLine } = useCart();

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-display text-3xl font-semibold text-brand-umber-dark">Your wishlist is empty</h1>
        <p className="mt-3 font-body text-sm text-brand-charcoal/70">
          Tap the heart on anything you like the look of — we&apos;ll keep it here.
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
      <h1 className="font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">Your wishlist</h1>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 rounded-xl border border-brand-umber/10 p-4">
            <Link href={`/product/${item.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-sky-light">
              <Image src={item.images[0]} alt={item.name} width={80} height={80} className="h-full w-full object-cover" />
            </Link>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <Link href={`/product/${item.slug}`} className="font-body text-sm font-medium text-brand-charcoal hover:text-brand-umber">
                  {item.name}
                </Link>
                <p className="mt-1 font-body text-sm font-semibold text-brand-umber-dark">{formatPKR(item.price)}</p>
              </div>
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    addLine({
                      product_id: item.id,
                      sku: item.sku,
                      name: item.name,
                      slug: item.slug,
                      image: item.images[0],
                      price: item.price,
                      quantity: 1,
                      max_stock: item.stock_count,
                    })
                  }
                  disabled={item.stock_count <= 0}
                  className="font-body text-xs font-medium text-brand-umber underline disabled:cursor-not-allowed disabled:text-brand-charcoal/40 disabled:no-underline"
                >
                  {item.stock_count <= 0 ? "Out of stock" : "Add to cart"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="font-body text-xs text-brand-charcoal/50 underline hover:text-brand-error"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
