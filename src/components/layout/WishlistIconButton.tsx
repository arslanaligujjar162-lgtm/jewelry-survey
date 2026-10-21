"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlist-context";

export function WishlistIconButton() {
  const { count } = useWishlist();

  return (
    <Link
      href="/wishlist"
      className="relative inline-flex items-center justify-center rounded-full p-2 text-brand-umber-dark transition hover:bg-brand-sky/10"
      aria-label={`View wishlist, ${count} item${count === 1 ? "" : "s"}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-umber px-1 text-[10px] font-semibold text-brand-ivory">
          {count}
        </span>
      )}
    </Link>
  );
}
