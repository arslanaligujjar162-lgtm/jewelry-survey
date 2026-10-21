/**
 * A small advance paid by wallet/bank transfer before dispatch, with the
 * remainder still Cash on Delivery — the business's existing informal
 * practice (confirmed manually over WhatsApp), formalized on-site.
 *
 * Every piece of UI/messaging below checks `advancePaymentEnabled()` first,
 * which is true as soon as ADVANCE_ACCOUNTS has an entry — so the feature
 * switched on everywhere at once the moment the real account went in,
 * never a half-shown instruction with no account to actually send money to.
 */

export const ADVANCE_AMOUNT = 500;

export interface AdvanceAccount {
  method: string; // e.g. "JazzCash", "Easypaisa", "Bank transfer"
  number: string;
  title: string; // account holder's name, so customers can verify before sending
}

export const ADVANCE_ACCOUNTS: AdvanceAccount[] = [
  { method: "NayaPay", number: "0335-6389333", title: "Arslan Ali" },
];

export function advancePaymentEnabled(): boolean {
  return ADVANCE_ACCOUNTS.length > 0;
}

/** Remaining balance due on delivery, after the advance. Never negative. */
export function remainingOnDelivery(total: number): number {
  return Math.max(0, total - ADVANCE_AMOUNT);
}

export function advanceAccountsText(): string {
  return ADVANCE_ACCOUNTS.map((a) => `${a.method}: ${a.number} (${a.title})`).join(" or ");
}
