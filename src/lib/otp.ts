import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const OTP_TTL_MINUTES = 5;
// How long a verified phone stays good for placing an order.
const VERIFIED_WINDOW_MINUTES = 30;

/**
 * Phone verification only runs once an SMS gateway is configured. Without
 * one a code can never reach the customer, so demanding it would block every
 * order; COD orders are confirmed over WhatsApp instead.
 */
export function isOtpRequired(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER
  );
}

async function sendSms(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: process.env.TWILIO_FROM_NUMBER!, Body: body }),
  });
  if (!res.ok) throw new Error(`SMS send failed (${res.status}): ${await res.text()}`);
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

interface FallbackOtp {
  code: string;
  expiresAt: number;
  verified: boolean;
}

// In-memory fallback, used only when Supabase isn't configured, so checkout
// can still be exercised end to end in local/demo environments. Anchored to
// globalThis because Next.js dev-mode compiles each route handler's module
// graph independently on first request — a plain module-scope Map would
// otherwise get a fresh instance per route and never see codes set by
// another route.
const globalForOtp = globalThis as unknown as { __otpFallbackStore?: Map<string, FallbackOtp> };
const fallbackOtps = globalForOtp.__otpFallbackStore ?? new Map<string, FallbackOtp>();
globalForOtp.__otpFallbackStore = fallbackOtps;

/** Generates, stores and SMSes a one-time code for the given phone number. */
export async function requestOtp(phone: string): Promise<{ devCode?: string }> {
  const code = generateCode();
  const expires_at = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    await supabase.from("otp_codes").insert({ phone, code, expires_at, verified: false });
  } else {
    fallbackOtps.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MINUTES * 60 * 1000, verified: false });
  }

  if (isOtpRequired()) {
    await sendSms(phone, `Your 1720 verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`);
  }

  // Expose the code outside production so checkout can be smoke-tested
  // without a live SMS gateway.
  return process.env.NODE_ENV === "production" ? {} : { devCode: code };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("otp_codes")
      .select("id, expires_at, verified")
      .eq("phone", phone)
      .eq("code", code)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return false;
    if (data.verified) return false;
    if (new Date(data.expires_at).getTime() < Date.now()) return false;

    await supabase.from("otp_codes").update({ verified: true }).eq("id", data.id);
    return true;
  }

  const entry = fallbackOtps.get(phone);
  if (!entry || entry.verified || entry.code !== code || entry.expiresAt < Date.now()) return false;
  entry.verified = true;
  return true;
}

export async function isPhoneOtpVerified(phone: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("otp_codes")
      .select("id")
      .eq("phone", phone)
      .eq("verified", true)
      .gte("created_at", new Date(Date.now() - VERIFIED_WINDOW_MINUTES * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return Boolean(data);
  }

  const entry = fallbackOtps.get(phone);
  return Boolean(entry?.verified);
}
