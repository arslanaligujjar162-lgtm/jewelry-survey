import { describe, it, expect } from "vitest";
import { formatPKR } from "./format";

describe("formatPKR", () => {
  it("formats a whole number with the Rs. prefix and thousands separators", () => {
    expect(formatPKR(4200)).toBe("Rs." + " " + "4,200");
  });

  it("formats zero", () => {
    expect(formatPKR(0)).toBe("Rs." + " " + "0");
  });

  it("rounds to whole rupees", () => {
    expect(formatPKR(1999.6)).toBe("Rs." + " " + "2,000");
  });
});
