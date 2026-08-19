import type { PaymentChargeRequest, PaymentChargeResult, PaymentProvider } from "./types";

/**
 * Card / JazzCash / Easypaisa gateway — stubbed until a merchant account is
 * approved. Wire the real gateway SDK into `charge()` and flip
 * NEXT_PUBLIC_GATEWAY_ENABLED once credentials exist; the checkout flow and
 * order schema already support it, so no rewrite is needed then.
 */
export const gatewayProvider: PaymentProvider = {
  id: "gateway",
  label: "Card / JazzCash / Easypaisa",
  isAvailable: () => process.env.NEXT_PUBLIC_GATEWAY_ENABLED === "true",
  async charge(_request: PaymentChargeRequest): Promise<PaymentChargeResult> {
    return {
      success: false,
      payment_status: "failed",
      error: "Online payment is not yet available. Please choose Cash on Delivery.",
    };
  },
};
