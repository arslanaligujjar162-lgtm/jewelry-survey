import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { Order } from "@/lib/types";

/**
 * Public by order number, with no login — so it must not return anything that
 * identifies or locates the customer. Order numbers end up in WhatsApp chats
 * and screenshots; the full name, phone and street address stay server-side.
 * The browser that placed the order already holds its own full copy.
 */
function toPublicOrder(order: Order): Order {
  const firstName = order.customer_name.split(" ")[0] ?? "";
  return {
    ...order,
    customer_name: firstName,
    customer_phone: order.customer_phone.replace(/\d(?=\d{3})/g, "•"),
    customer_email: null,
    notes: null,
    shipping_address: {
      fullName: firstName,
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: order.shipping_address.city,
      postalCode: "",
      province: order.shipping_address.province,
    },
  };
}

export async function GET(request: Request, { params }: { params: { orderNumber: string } }) {
  const limit = rateLimit(`order-lookup:ip:${getClientIp(request)}`, 30, 10 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": limit.retryAfterSeconds.toString() } }
    );
  }

  const order = await getOrderByNumber(params.orderNumber);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order: toPublicOrder(order) });
}
