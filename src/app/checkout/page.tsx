import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery address, verify your phone, and pay with Cash on Delivery.",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
