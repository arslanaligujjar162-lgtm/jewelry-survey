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
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
