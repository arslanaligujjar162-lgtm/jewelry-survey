import { NextResponse } from "next/server";
import { createOrder, type CheckoutPayload } from "@/lib/orders";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CheckoutPayload | null;

  if (!body?.address || !body?.items?.length || !body?.paymentMethod) {
    return NextResponse.json({ success: false, error: "Missing required checkout fields" }, { status: 400 });
  }

  const ipLimit = rateLimit(`checkout:ip:${getClientIp(request)}`, 10, 10 * 60);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many orders placed too quickly. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": ipLimit.retryAfterSeconds.toString() } }
    );
  }

  const result = await createOrder(body);
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
