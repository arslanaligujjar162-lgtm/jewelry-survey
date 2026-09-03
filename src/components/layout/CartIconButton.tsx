"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export function CartIconButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center rounded-full p-2 text-brand-umber-dark transition hover:bg-brand-sky/10"
      aria-label={`View cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-umber px-1 text-[10px] font-semibold text-brand-ivory">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
