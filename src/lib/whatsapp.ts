import type { Order } from "@/lib/types";
import { formatPKR } from "@/lib/format";
import { ADVANCE_AMOUNT, advanceAccountsText, advancePaymentEnabled, remainingOnDelivery } from "@/lib/advance-payment";

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
  const totalLine = advancePaymentEnabled()
    ? `Total: ${formatPKR(order.total)} — ${formatPKR(ADVANCE_AMOUNT)} advance + ${formatPKR(remainingOnDelivery(order.total))} Cash on Delivery (incl. ${formatPKR(order.delivery_fee)} delivery)`
    : `Total: ${formatPKR(order.total)} (Cash on Delivery, incl. ${formatPKR(order.delivery_fee)} delivery)`;
  return [
    `Order ${order.order_number}`,
    itemLines(order),
    totalLine,
    `${order.customer_name} · ${order.customer_phone}`,
    addressLine(order),
  ].join("\n");
}

/** Store → customer: one tap from the admin order page to confirm before dispatch. */
export function ownerConfirmLink(order: Order): string {
  const paymentLine = advancePaymentEnabled()
    ? `Please send ${formatPKR(ADVANCE_AMOUNT)} advance to ${advanceAccountsText()} — the remaining ${formatPKR(remainingOnDelivery(order.total))} is payable in cash on delivery, to ${addressLine(order)}.`
    : `Total ${formatPKR(order.total)}, payable in cash on delivery, to ${addressLine(order)}.`;
  return waLink(
    order.customer_phone,
    [
      `Assalam o Alaikum ${order.customer_name.split(" ")[0]}, this is 1720.`,
      `Thank you for your order ${order.order_number}:`,
      itemLines(order),
      paymentLine,
      `Please reply YES to confirm and we'll dispatch it.`,
    ].join("\n")
  );
}
