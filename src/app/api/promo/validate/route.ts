import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promo";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = body?.code as string | undefined;

  if (!code) return NextResponse.json({ valid: false, message: "Enter a code" }, { status: 400 });

  const ipLimit = rateLimit(`promo:ip:${getClientIp(request)}`, 20, 10 * 60);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { valid: false, message: "Too many attempts. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": ipLimit.retryAfterSeconds.toString() } }
    );
  }

  const result = await validatePromoCode(code);
  return NextResponse.json(result);
}
