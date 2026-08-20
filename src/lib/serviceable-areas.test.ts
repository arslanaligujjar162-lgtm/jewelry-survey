import { describe, it, expect } from "vitest";
import { checkServiceability, isCityKnown } from "./serviceable-areas";

describe("checkServiceability", () => {
  it("matches a known city with a matching postal code prefix", () => {
    const result = checkServiceability("Lahore", "54000");
    expect(result).not.toBeNull();
    expect(result?.city).toBe("Lahore");
  });

  it("is case-insensitive on city name", () => {
    expect(checkServiceability("lahore", "54000")).not.toBeNull();
  });

  it("rejects a known city with a mismatched postal code", () => {
    expect(checkServiceability("Lahore", "99999")).toBeNull();
  });

  it("rejects an unknown city", () => {
    expect(checkServiceability("Nowhereville", "00000")).toBeNull();
  });
});

describe("isCityKnown", () => {
  it("returns true for a covered city", () => {
    expect(isCityKnown("Karachi")).toBe(true);
  });

  it("returns false for an uncovered city", () => {
    expect(isCityKnown("Nowhereville")).toBe(false);
  });
});
