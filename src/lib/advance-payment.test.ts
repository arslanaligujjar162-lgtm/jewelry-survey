import { describe, it, expect } from "vitest";
import { ADVANCE_AMOUNT, advanceAccountsText, advancePaymentEnabled, remainingOnDelivery } from "./advance-payment";

describe("advance-payment", () => {
  it("is off by default, so checkout is plain Cash on Delivery", () => {
    expect(advancePaymentEnabled()).toBe(false);
    expect(advanceAccountsText()).toBe("");
  });

  it("never lets the remaining balance go negative", () => {
    expect(remainingOnDelivery(0)).toBe(0);
    expect(remainingOnDelivery(ADVANCE_AMOUNT - 1)).toBe(0);
    expect(remainingOnDelivery(ADVANCE_AMOUNT + 2000)).toBe(2000);
  });
});
