import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const OTP_TTL_MINUTES = 5;

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

/**
 * Generates and "sends" a one-time code for the given phone number before an
 * order can confirm — the digital equivalent of a pre-dispatch confirmation
 * call. The actual SMS/WhatsApp OTP send is stubbed (console.log) until an
 * SMS gateway is wired up; the code is persisted so /api/otp/verify can
 * check it.
 */
export async function requestOtp(phone: string): Promise<{ devCode?: string }> {
  const code = generateCode();
  const expires_at = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    await supabase.from("otp_codes").insert({ phone, code, expires_at, verified: false });
  } else {
    fallbackOtps.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MINUTES * 60 * 1000, verified: false });
  }

  console.log(`[otp:stub] would SMS ${phone} the code ${code}`);

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
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return Boolean(data);
  }

  const entry = fallbackOtps.get(phone);
  return Boolean(entry?.verified);
}
