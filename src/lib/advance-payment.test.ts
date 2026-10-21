import { describe, it, expect } from "vitest";
import { ADVANCE_AMOUNT, advanceAccountsText, advancePaymentEnabled, remainingOnDelivery } from "./advance-payment";

describe("advance-payment", () => {
  it("is enabled now that a real account is configured", () => {
    expect(advancePaymentEnabled()).toBe(true);
    expect(advanceAccountsText()).toBe("NayaPay: 0335-6389333 (Arslan Ali)");
  });

  it("never lets the remaining balance go negative", () => {
    expect(remainingOnDelivery(0)).toBe(0);
    expect(remainingOnDelivery(ADVANCE_AMOUNT - 1)).toBe(0);
    expect(remainingOnDelivery(ADVANCE_AMOUNT + 2000)).toBe(2000);
  });
});
