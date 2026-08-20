import { NextResponse } from "next/server";
import { submitReturnRequest } from "@/lib/returns";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const orderNumber = body?.orderNumber as string | undefined;
  const reason = body?.reason as string | undefined;

  if (!orderNumber || !reason) {
    return NextResponse.json({ success: false, error: "Order number and reason are required" }, { status: 400 });
  }

  const ipLimit = rateLimit(`returns:ip:${getClientIp(request)}`, 10, 10 * 60);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": ipLimit.retryAfterSeconds.toString() } }
    );
  }

  const result = await submitReturnRequest(orderNumber, reason);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
