"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";
import { trackEvent, trackPixelEvent } from "@/lib/analytics";

const BASE = "mt-2 flex w-full items-center justify-center rounded-full py-2 font-body text-xs font-bold transition";

export function QuickAddButton({ product }: { product: Product }) {
  const { addLine, openDrawer } = useCart();

  if (product.stock_count <= 0) {
    return (
      <span className={`${BASE} cursor-not-allowed border border-brand-umber/20 text-brand-charcoal/40`}>
        Out of stock
      </span>
    );
  }

  // Sized pieces go to the product page to choose a size — quick-add must
  // never silently pick one on the customer's behalf.
  if (product.ring_size_range) {
    return (
      <Link
        href={`/product/${product.slug}`}
        className={`${BASE} border-2 border-brand-umber-dark text-brand-umber-dark hover:bg-brand-sky/10`}
      >
        Choose size
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        addLine({
          product_id: product.id,
          sku: product.sku,
          name: product.name,
          slug: product.slug,
          image: product.images[0],
          price: product.price,
          quantity: 1,
          ring_size: null,
          max_stock: product.stock_count,
        });

        trackEvent("add_to_cart", { item_id: product.sku, item_name: product.name, value: product.price });
        trackPixelEvent("AddToCart", { content_ids: [product.sku], value: product.price, currency: "PKR" });

        openDrawer();
      }}
      className={`${BASE} border-2 border-brand-umber-dark text-brand-umber-dark hover:bg-brand-umber hover:text-brand-ivory`}
    >
      Add to bag
    </button>
  );
}
