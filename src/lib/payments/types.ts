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

/** What a hosted gateway hands back after we ask it to start a payment. */
export interface GatewaySession {
  redirect_url: string;
  reference: string;
}

/** A verified "payment finished" message from the gateway. */
export interface GatewayEvent {
  order_number: string;
  reference: string;
  /** Amount actually paid, in rupees. */
  amount: number;
  status: "paid" | "failed";
}

/**
 * The only part that differs between payment gateways. Everything around it
 * (creating the order, settling it when the gateway calls back) is shared.
 */
export interface GatewayAdapter {
  name: string;
  /** True only when every credential the gateway needs is present. */
  isConfigured(): boolean;
  createSession(input: {
    order_number: string;
    amount: number;
    customer_name: string;
    customer_phone: string;
  }): Promise<GatewaySession>;
  /**
   * Verify the gateway's signature on the raw request body and parse it.
   * Returns null for anything that doesn't verify — never throw on bad input.
   */
  parseWebhook(rawBody: string, headers: Headers): GatewayEvent | null;
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
