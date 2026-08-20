import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { normalizePkPhone } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { reportError } from "@/lib/monitoring";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phone = body?.phone as string | undefined;
  const code = body?.code as string | undefined;

  if (!phone || !code) {
    return NextResponse.json({ error: "Phone and code are required" }, { status: 400 });
  }

  const normalizedPhone = normalizePkPhone(phone);

  // Cap verify attempts per phone so a 6-digit code can't be brute-forced.
  const attemptLimit = rateLimit(`otp-verify:phone:${normalizedPhone}`, 8, 10 * 60);
  if (!attemptLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please request a new code." },
      { status: 429, headers: { "Retry-After": attemptLimit.retryAfterSeconds.toString() } }
    );
  }

  try {
    const verified = await verifyOtp(normalizedPhone, code.trim());
    if (!verified) {
      return NextResponse.json({ verified: false, error: "That code is incorrect or has expired" }, { status: 400 });
    }
    return NextResponse.json({ verified: true });
  } catch (err) {
    reportError(err, { route: "otp/verify" });
    return NextResponse.json({ error: "Could not verify code. Try again." }, { status: 500 });
  }
}
