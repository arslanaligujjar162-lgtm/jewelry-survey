import type { Metadata } from "next";
import { OrderConfirmationClient } from "@/components/orders/OrderConfirmationClient";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your 7teen2wenty order is confirmed. Pay by Cash on Delivery when it arrives.",
  robots: { index: false },
};

export default function OrderConfirmationPage() {
  return <OrderConfirmationClient />;
}
