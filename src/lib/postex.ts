import { reportError } from "@/lib/monitoring";
import type { Order } from "@/lib/types";

const BASE_URL = "https://api.postex.pk/services/integration/api/order";

export function postExConfigured(): boolean {
  return !!process.env.POSTEX_API_TOKEN;
}

function postExHeaders(): HeadersInit {
  return { token: process.env.POSTEX_API_TOKEN ?? "", "Content-Type": "application/json" };
}

function itemSummary(order: Order): string {
  return order.items.map((item) => `${item.quantity} x ${item.name}`).join(", ");
}

function totalItems(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

function deliveryAddressLine(order: Order): string {
  const a = order.shipping_address;
  return [a.addressLine1, a.addressLine2, a.city, a.province].filter(Boolean).join(", ");
}

export type PostExResult<T> = ({ success: true } & T) | { success: false; error: string };

/** Books a COD shipment with PostEx for an already-placed order. Never throws —
 * callers (an admin action) get a typed result to show a clear error from.
 * `codAmountOverride` lets the owner send a different amount to the courier
 * than the order's own total (e.g. an adjustment agreed with the customer
 * after checkout) without changing the order's stored total. */
export async function bookPostExOrder(
  order: Order,
  codAmountOverride?: number
): Promise<PostExResult<{ trackingNumber: string }>> {
  if (!postExConfigured()) return { success: false, error: "PostEx is not configured (POSTEX_API_TOKEN missing)." };

  try {
    const res = await fetch(`${BASE_URL}/v3/create-order`, {
      method: "POST",
      headers: postExHeaders(),
      body: JSON.stringify({
        cityName: order.shipping_address.city,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        deliveryAddress: deliveryAddressLine(order),
        invoicePayment: codAmountOverride ?? order.total,
        invoiceDivision: 1,
        items: totalItems(order),
        orderDetail: itemSummary(order),
        orderRefNumber: order.order_number,
        orderType: "Normal",
        // PostEx rejects a booking unless at least one of these identifies which
        // registered warehouse to collect from (Merchant Portal > Setting > Pickup/Return Address Logs).
        pickupAddressCode: process.env.POSTEX_PICKUP_ADDRESS_CODE,
      }),
    });
    const data = await res.json();
    if (!res.ok || data.statusCode !== "200" || !data.dist?.trackingNumber) {
      return { success: false, error: data.statusMessage ?? `PostEx returned HTTP ${res.status}` };
    }
    return { success: true, trackingNumber: data.dist.trackingNumber };
  } catch (err) {
    reportError(err, { context: "postex-book-order", order_number: order.order_number });
    return { success: false, error: "Could not reach PostEx. Try again." };
  }
}

/** Current delivery status, e.g. "Booked", "Out For Delivery", "Delivered". */
export async function trackPostExOrder(trackingNumber: string): Promise<PostExResult<{ status: string }>> {
  if (!postExConfigured()) return { success: false, error: "PostEx is not configured." };
  try {
    const res = await fetch(`${BASE_URL}/v1/track-order/${encodeURIComponent(trackingNumber)}`, {
      headers: postExHeaders(),
    });
    const data = await res.json();
    if (!res.ok || data.statusCode !== "200") {
      return { success: false, error: data.statusMessage ?? `PostEx returned HTTP ${res.status}` };
    }
    return { success: true, status: data.dist?.transactionStatus || "Booked" };
  } catch (err) {
    reportError(err, { context: "postex-track-order", tracking_number: trackingNumber });
    return { success: false, error: "Could not reach PostEx. Try again." };
  }
}

/** Whether PostEx has actually remitted the COD cash they collected for this order. */
export async function getPostExPaymentStatus(
  trackingNumber: string
): Promise<PostExResult<{ settled: boolean; settlementDate: string | null }>> {
  if (!postExConfigured()) return { success: false, error: "PostEx is not configured." };
  try {
    const res = await fetch(`${BASE_URL}/v1/payment-status/${encodeURIComponent(trackingNumber)}`, {
      headers: postExHeaders(),
    });
    const data = await res.json();
    if (!res.ok || data.statusCode !== "200") {
      return { success: false, error: data.statusMessage ?? `PostEx returned HTTP ${res.status}` };
    }
    return { success: true, settled: !!data.dist?.settle, settlementDate: data.dist?.settlementDate || null };
  } catch (err) {
    reportError(err, { context: "postex-payment-status", tracking_number: trackingNumber });
    return { success: false, error: "Could not reach PostEx. Try again." };
  }
}

/** Fetches the printable shipping label (Airway Bill) PDF for up to 10 tracking
 * numbers at once — PostEx's own limit. Returns the raw PDF bytes on success. */
export async function getPostExAirwayBill(trackingNumbers: string[]): Promise<PostExResult<{ pdf: ArrayBuffer }>> {
  if (!postExConfigured()) return { success: false, error: "PostEx is not configured." };
  if (trackingNumbers.length === 0) return { success: false, error: "No tracking numbers given." };
  if (trackingNumbers.length > 10) return { success: false, error: "PostEx generates a PDF for at most 10 tracking numbers at once." };

  try {
    const qs = trackingNumbers.map(encodeURIComponent).join(",");
    const res = await fetch(`${BASE_URL}/v1/get-invoice?trackingNumbers=${qs}`, {
      headers: postExHeaders(),
    });
    if (!res.ok) return { success: false, error: `PostEx returned HTTP ${res.status}` };
    return { success: true, pdf: await res.arrayBuffer() };
  } catch (err) {
    reportError(err, { context: "postex-airway-bill", tracking_numbers: trackingNumbers.join(",") });
    return { success: false, error: "Could not reach PostEx. Try again." };
  }
}

/** Cancels a booked shipment. PostEx returns the result as a plain HTTP status
 * here (200/404), not a statusCode field in the body. */
export async function cancelPostExOrder(trackingNumber: string): Promise<{ success: boolean; error?: string }> {
  if (!postExConfigured()) return { success: false, error: "PostEx is not configured." };
  try {
    const res = await fetch(`${BASE_URL}/v1/cancel-order`, {
      method: "PUT",
      headers: postExHeaders(),
      body: JSON.stringify({ trackingNumber }),
    });
    if (res.status === 404) return { success: false, error: "Order not found on PostEx." };
    if (!res.ok) return { success: false, error: `PostEx returned HTTP ${res.status}` };
    return { success: true };
  } catch (err) {
    reportError(err, { context: "postex-cancel-order", tracking_number: trackingNumber });
    return { success: false, error: "Could not reach PostEx. Try again." };
  }
}
