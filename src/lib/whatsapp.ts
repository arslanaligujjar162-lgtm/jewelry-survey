import type { Order } from "@/lib/types";
import { formatPKR } from "@/lib/format";
import { CONTACT } from "@/lib/brand";

function waLink(numberDigits: string, text: string) {
  return `https://wa.me/${numberDigits.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

function itemLines(order: Order): string {
  return order.items
    .map((item) => {
      const details = [item.colour, item.ring_size ? `size US ${item.ring_size}` : null].filter(Boolean).join(", ");
      return `• ${item.quantity} × ${item.name}${details ? ` (${details})` : ""}`;
    })
    .join("\n");
}

function addressLine(order: Order): string {
  const a = order.shipping_address;
  return [a.addressLine1, a.addressLine2, a.city, a.province].filter(Boolean).join(", ");
}

/** Plain-text order summary, shared by the WhatsApp links and the email alert. */
export function orderSummaryText(order: Order): string {
  return [
    `Order ${order.order_number}`,
    itemLines(order),
    `Total: ${formatPKR(order.total)} (Cash on Delivery, incl. ${formatPKR(order.delivery_fee)} delivery)`,
    `${order.customer_name} · ${order.customer_phone}`,
    addressLine(order),
  ].join("\n");
}

/** Customer → store: sent from the confirmation page, so every order opens a chat with the store. */
export function customerConfirmLink(order: Order): string {
  return waLink(
    CONTACT.whatsappNumber,
    `Hi 1720! I just placed an order and would like to confirm it.\n\n${orderSummaryText(order)}`
  );
}

/** Store → customer: one tap from the admin order page to confirm before dispatch. */
export function ownerConfirmLink(order: Order): string {
  return waLink(
    order.customer_phone,
    [
      `Assalam o Alaikum ${order.customer_name.split(" ")[0]}, this is 1720.`,
      `Thank you for your order ${order.order_number}:`,
      itemLines(order),
      `Total ${formatPKR(order.total)}, payable in cash on delivery, to ${addressLine(order)}.`,
      `Please reply YES to confirm and we'll dispatch it.`,
    ].join("\n")
  );
}
