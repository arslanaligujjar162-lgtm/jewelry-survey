import { NextResponse } from "next/server";
import { requestOtp } from "@/lib/otp";
import { normalizePkPhone, PK_PHONE_REGEX } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { reportError } from "@/lib/monitoring";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phone = body?.phone as string | undefined;

  if (!phone || !PK_PHONE_REGEX.test(phone.replace(/\s/g, ""))) {
    return NextResponse.json({ error: "Enter a valid Pakistani mobile number" }, { status: 400 });
  }

  const normalizedPhone = normalizePkPhone(phone);

  // Cap sends per phone (avoid SMS-bombing one number) and per IP (avoid one
  // source spraying codes at many numbers).
  const phoneLimit = rateLimit(`otp-send:phone:${normalizedPhone}`, 3, 10 * 60);
  const ipLimit = rateLimit(`otp-send:ip:${getClientIp(request)}`, 10, 10 * 60);

  if (!phoneLimit.allowed || !ipLimit.allowed) {
    const retryAfter = Math.max(phoneLimit.retryAfterSeconds, ipLimit.retryAfterSeconds);
    return NextResponse.json(
      { error: "Too many code requests. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": retryAfter.toString() } }
    );
  }

  try {
    const { devCode } = await requestOtp(normalizedPhone);
    return NextResponse.json({ sent: true, devCode });
  } catch (err) {
    reportError(err, { route: "otp/send" });
    return NextResponse.json({ error: "Could not send verification code. Try again." }, { status: 500 });
  }
}
