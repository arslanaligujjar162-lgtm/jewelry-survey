import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { normalizePkPhone } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const phone = body?.phone as string | undefined;
  const code = body?.code as string | undefined;

  if (!phone || !code) {
    return NextResponse.json({ error: "Phone and code are required" }, { status: 400 });
  }

  try {
    const verified = await verifyOtp(normalizePkPhone(phone), code.trim());
    if (!verified) {
      return NextResponse.json({ verified: false, error: "That code is incorrect or has expired" }, { status: 400 });
    }
    return NextResponse.json({ verified: true });
  } catch (err) {
    console.error("otp/verify failed", err);
    return NextResponse.json({ error: "Could not verify code. Try again." }, { status: 500 });
  }
}
