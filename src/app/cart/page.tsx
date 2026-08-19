import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your cart before checking out with Cash on Delivery.",
};

export default function CartPage() {
  return <CartPageClient />;
}
