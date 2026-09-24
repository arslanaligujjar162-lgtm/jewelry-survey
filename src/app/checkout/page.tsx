import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout/CheckoutPageClient";
import { isOtpRequired } from "@/lib/otp";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery address and pay with Cash on Delivery.",
};

export default function CheckoutPage() {
  return <CheckoutPageClient otpRequired={isOtpRequired()} />;
}
