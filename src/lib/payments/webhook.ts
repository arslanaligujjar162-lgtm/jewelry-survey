import { reportError } from "@/lib/monitoring";
import { settleGatewayPayment } from "@/lib/orders";
import type { GatewayAdapter } from "./types";

export interface WebhookResponse {
  status: number;
  body: { ok: boolean; error?: string };
}

/**
 * Handles a gateway's "payment finished" call. Fails closed: with no
 * configured adapter the endpoint doesn't exist, and anything whose signature
 * doesn't verify is rejected before the database is touched. Non-2xx answers
 * on genuine failures make the gateway retry.
 */
export async function handleGatewayWebhook(
  adapter: GatewayAdapter,
  rawBody: string,
  headers: Headers
): Promise<WebhookResponse> {
  if (!adapter.isConfigured()) return { status: 404, body: { ok: false, error: "Not found" } };

  const event = adapter.parseWebhook(rawBody, headers);
  if (!event) return { status: 401, body: { ok: false, error: "Invalid signature" } };

  try {
    const result = await settleGatewayPayment(event);
    if (result === "not_found") return { status: 404, body: { ok: false, error: "Unknown order" } };
    if (result === "mismatch") {
      reportError(new Error("Gateway payment did not match its order"), {
        context: "gateway-webhook-mismatch",
        order_number: event.order_number,
      });
      return { status: 400, body: { ok: false, error: "Payment does not match order" } };
    }
    return { status: 200, body: { ok: true } };
  } catch (err) {
    reportError(err, { context: "gateway-webhook", order_number: event.order_number });
    return { status: 500, body: { ok: false, error: "Could not record payment" } };
  }
}
