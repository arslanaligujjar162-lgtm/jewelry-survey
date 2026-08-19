"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export function CheckoutPageClient() {
  const { lines } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (lines.length === 0) router.replace("/cart");
  }, [lines.length, router]);

  if (lines.length === 0) return null;

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
