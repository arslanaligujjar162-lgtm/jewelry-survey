import type { Order, WhatsAppOrderContext } from "@/lib/types";
import { formatPKR } from "@/lib/format";

export function buildWhatsAppOrderContext(order: Order): WhatsAppOrderContext {
  const itemLines = order.items
    .map((item) => `${item.quantity}x ${item.name}${item.ring_size ? ` (size ${item.ring_size})` : ""}`)
    .join(", ");

  return {
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    orderNumber: order.order_number,
    orderSummary: `${itemLines} — Total ${formatPKR(order.total)}`,
    status: order.status,
  };
}

/**
 * Stub for the WhatsApp Cloud API order-confirmation send. Wire the real
 * `/messages` call (template message, Business phone number ID, access
 * token) here once the WhatsApp Business number is confirmed. Until then
 * this just logs what would have been sent so the order flow can be
 * tested end to end.
 */
export async function sendWhatsAppOrderConfirmation(
  context: WhatsAppOrderContext
): Promise<{ sent: boolean; reason: string }> {
  console.log("[whatsapp:stub] would send order confirmation", context);
  return { sent: false, reason: "WhatsApp Cloud API not yet wired up" };
}
