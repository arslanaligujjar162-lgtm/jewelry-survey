import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface PromoValidationResult {
  valid: boolean;
  discountPercent: number;
  message: string;
}

// Mirrors supabase/seed.sql — used only when Supabase isn't configured, so
// promo codes can still be exercised end to end in local/demo environments.
const FALLBACK_PROMO_CODES: Record<string, { discountPercent: number; active: boolean }> = {
  WELCOME10: { discountPercent: 10, active: true },
};

/**
 * Looks up a promo/referral code against the promo_codes table.
 * Discount logic is intentionally a flat percentage stub — extend with
 * tiers, min-order rules, or per-customer limits later.
 */
export async function validatePromoCode(code: string): Promise<PromoValidationResult> {
  if (!code.trim()) {
    return { valid: false, discountPercent: 0, message: "Enter a code" };
  }

  if (!isSupabaseConfigured()) {
    const entry = FALLBACK_PROMO_CODES[code.trim().toUpperCase()];
    if (!entry || !entry.active) {
      return { valid: false, discountPercent: 0, message: "That code isn't valid" };
    }
    return { valid: true, discountPercent: entry.discountPercent, message: `${entry.discountPercent}% off applied` };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("code, discount_percent, active, expires_at")
    .ilike("code", code.trim())
    .maybeSingle();

  if (error || !data || !data.active) {
    return { valid: false, discountPercent: 0, message: "That code isn't valid" };
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return { valid: false, discountPercent: 0, message: "That code has expired" };
  }

  return {
    valid: true,
    discountPercent: data.discount_percent,
    message: `${data.discount_percent}% off applied`,
  };
}
