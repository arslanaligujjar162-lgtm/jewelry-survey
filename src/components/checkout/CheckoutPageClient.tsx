"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export function CheckoutPageClient() {
  const { lines, hydrated } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && lines.length === 0) router.replace("/cart");
  }, [hydrated, lines.length, router]);

  // Wait for localStorage hydration before deciding the cart is empty — a
  // fresh page load (e.g. a bookmark, refresh, or direct link to /checkout)
  // otherwise bounces straight to /cart even when items are saved.
  if (!hydrated || lines.length === 0) return null;

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
