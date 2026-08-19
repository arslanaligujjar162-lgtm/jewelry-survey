import type { Order } from "@/lib/types";

export interface PaymentChargeRequest {
  order: Pick<Order, "order_number" | "total" | "customer_name" | "customer_phone">;
}

export interface PaymentChargeResult {
  success: boolean;
  /** "paid" for gateways that settle immediately, "pending" for COD. */
  payment_status: "paid" | "pending" | "failed";
  /** Provider transaction reference, if any. */
  reference?: string;
  /** Set when the customer must be redirected to complete payment (card/wallet gateways). */
  redirect_url?: string;
  error?: string;
}

/**
 * Every payment method the storefront supports implements this interface.
 * The checkout flow only ever talks to a PaymentProvider — swapping COD for
 * a live gateway later is a matter of registering a new provider, not a
 * checkout rewrite.
 */
export interface PaymentProvider {
  id: "cod" | "gateway";
  label: string;
  /** Whether this provider can be selected right now (e.g. gateway is disabled until a merchant account is approved). */
  isAvailable(): boolean;
  charge(request: PaymentChargeRequest): Promise<PaymentChargeResult>;
}
