"use client";

import { useWishlist, type WishlistItem } from "@/lib/wishlist-context";
import type { Product } from "@/lib/types";

function toWishlistItem(product: Product): WishlistItem {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    price: product.price,
    images: product.images,
    stock_count: product.stock_count,
    is_new: product.is_new,
    material_spec: product.material_spec,
  };
}

export function WishlistButton({ product, className = "" }: { product: Product; className?: string }) {
  const { isWishlisted, toggle } = useWishlist();
  const active = isWishlisted(product.id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(toWishlistItem(product));
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      className={`inline-flex items-center justify-center rounded-full bg-brand-ivory/90 p-2 text-brand-umber-dark shadow-sm transition hover:bg-brand-ivory ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          d="M12 20.5s-7-4.35-9.5-8.86C.86 8.36 2.1 5 5.4 4.3c2-.43 3.9.5 5.1 2.2 1.2-1.7 3.1-2.63 5.1-2.2 3.3.7 4.54 4.06 2.9 7.34C19 16.15 12 20.5 12 20.5z"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
