import type { PaymentChargeRequest, PaymentChargeResult, PaymentProvider } from "./types";

/**
 * Cash on Delivery — the only live provider at launch. No money moves at
 * checkout time; the order is created with payment_status "pending" and
 * settles when the courier collects cash on delivery.
 */
export const codProvider: PaymentProvider = {
  id: "cod",
  label: "Cash on Delivery",
  isAvailable: () => true,
  async charge(_request: PaymentChargeRequest): Promise<PaymentChargeResult> {
    return {
      success: true,
      payment_status: "pending",
      reference: undefined,
    };
  },
};
