import { NextResponse } from "next/server";
import { requestOtp } from "@/lib/otp";
import { normalizePkPhone, PK_PHONE_REGEX } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phone = body?.phone as string | undefined;

  if (!phone || !PK_PHONE_REGEX.test(phone.replace(/\s/g, ""))) {
    return NextResponse.json({ error: "Enter a valid Pakistani mobile number" }, { status: 400 });
  }

  try {
    const { devCode } = await requestOtp(normalizePkPhone(phone));
    return NextResponse.json({ sent: true, devCode });
  } catch (err) {
    console.error("otp/send failed", err);
    return NextResponse.json({ error: "Could not send verification code. Try again." }, { status: 500 });
  }
}
