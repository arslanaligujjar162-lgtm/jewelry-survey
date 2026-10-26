import { ADVANCE_AMOUNT } from "@/lib/advance-payment";
import { reportError } from "@/lib/monitoring";
import { nayapayAdapter } from "./nayapay";
import type { PaymentChargeRequest, PaymentChargeResult, PaymentProvider } from "./types";

/** Only the advance is paid online; the rest is cash on delivery. */
export function advanceChargeAmount(total: number): number {
  return Math.min(ADVANCE_AMOUNT, total);
}

/**
 * Online advance payment through a hosted gateway. Needs both the public
 * switch and a fully configured adapter, so it stays off until both are done.
 */
export const gatewayProvider: PaymentProvider = {
  id: "gateway",
  label: "Pay advance online",
  isAvailable: () => process.env.NEXT_PUBLIC_GATEWAY_ENABLED === "true" && nayapayAdapter.isConfigured(),
  async charge({ order }: PaymentChargeRequest): Promise<PaymentChargeResult> {
    try {
      const session = await nayapayAdapter.createSession({
        order_number: order.order_number,
        amount: advanceChargeAmount(order.total),
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
      });
      return {
        success: true,
        payment_status: "pending",
        reference: session.reference,
        redirect_url: session.redirect_url,
      };
    } catch (err) {
      reportError(err, { context: "gateway-create-session", order_number: order.order_number });
      return {
        success: false,
        payment_status: "failed",
        error: "We couldn't start the online payment. Please try again, or message us on WhatsApp.",
      };
    }
  },
};
