import { createAdminClient } from "@/lib/supabase/admin";

export interface PromoValidationResult {
  valid: boolean;
  discountPercent: number;
  message: string;
}

/**
 * Looks up a promo/referral code against the promo_codes table.
 * Discount logic is intentionally a flat percentage stub — extend with
 * tiers, min-order rules, or per-customer limits later.
 */
export async function validatePromoCode(code: string): Promise<PromoValidationResult> {
  if (!code.trim()) {
    return { valid: false, discountPercent: 0, message: "Enter a code" };
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
