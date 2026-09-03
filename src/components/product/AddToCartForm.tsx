"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";
import { trackEvent, trackPixelEvent } from "@/lib/analytics";

function parseRingSizes(range: string): string[] {
  const match = range.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (!match) return [];
  const min = parseFloat(match[1]);
  const max = parseFloat(match[2]);
  const sizes: string[] = [];
  for (let s = min; s <= max + 0.001; s += 0.5) {
    sizes.push(s % 1 === 0 ? s.toString() : s.toFixed(1));
  }
  return sizes;
}

export function AddToCartForm({ product }: { product: Product }) {
  const { addLine, lines } = useCart();
  const router = useRouter();
  const ringSizes = product.ring_size_range ? parseRingSizes(product.ring_size_range) : [];
  const [ringSize, setRingSize] = useState(ringSizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inCartQty = lines
    .filter((l) => l.product_id === product.id && (!ringSizes.length || l.ring_size === ringSize))
    .reduce((sum, l) => sum + l.quantity, 0);
  const remaining = product.stock_count - inCartQty;

  const outOfStock = product.stock_count <= 0;

  function handleAddToCart() {
    setError(null);
    if (ringSizes.length && !ringSize) {
      setError("Select a ring size");
      return;
    }
    if (quantity > remaining) {
      setError(`Only ${Math.max(remaining, 0)} left in stock`);
      return;
    }

    addLine({
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      quantity,
      ring_size: ringSizes.length ? ringSize : null,
      max_stock: product.stock_count,
    });

    trackEvent("add_to_cart", { item_id: product.sku, item_name: product.name, value: product.price });
    trackPixelEvent("AddToCart", { content_ids: [product.sku], value: product.price, currency: "PKR" });

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="mt-6" id="add-to-cart">
      {ringSizes.length > 0 && (
        <div className="mb-4">
          <label htmlFor="ring-size" className="block font-body text-sm font-medium text-brand-charcoal">
            Ring size
          </label>
          <select
            id="ring-size"
            value={ringSize}
            onChange={(e) => setRingSize(e.target.value)}
            className="mt-2 w-full rounded-lg border border-brand-umber/20 bg-brand-ivory px-3 py-2 font-body text-sm sm:w-40"
          >
            {ringSizes.map((size) => (
              <option key={size} value={size}>
                US {size}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="quantity" className="font-body text-sm font-medium text-brand-charcoal">
          Quantity
        </label>
        <div className="flex items-center rounded-lg border border-brand-umber/20">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 font-body text-sm"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span id="quantity" className="px-3 font-body text-sm">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(q + 1, Math.max(product.stock_count, 1)))}
            className="px-3 py-2 font-body text-sm"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-3 font-body text-sm text-brand-error">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="inline-flex items-center justify-center rounded-full shadow-retro-sm bg-brand-umber px-8 py-4 font-body text-base font-bold text-brand-ivory transition hover:-translate-y-0.5 hover:bg-brand-umber-dark hover:shadow-[5px_5px_0_0_#482a24] active:translate-y-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {outOfStock ? "Out of stock" : added ? "Added ✓" : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={() => {
            handleAddToCart();
            router.push("/cart");
          }}
          disabled={outOfStock}
          className="inline-flex items-center justify-center rounded-full border-2 border-brand-umber-dark px-8 py-4 font-body text-base font-bold text-brand-umber-dark transition hover:bg-brand-sky/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy it now
        </button>
      </div>
    </div>
  );
}
