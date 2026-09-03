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
          d="M12 20.5s-7-4.35-9.5-8.86C.86 8.36 2.1 5 5.4 4.3c2-.43 3.9.5 5.1 2.2 1.2-1.7 3.1-2.63 5.1-2.2 3.3.7 4.54 4.06 2.9 7.34C19 16.15 12 20.5 12 20.5z"
          strokeLinejoin="round"
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
