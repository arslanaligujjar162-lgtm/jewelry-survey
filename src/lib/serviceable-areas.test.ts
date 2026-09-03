import { describe, it, expect } from "vitest";
import { getDeliveryInfo } from "./serviceable-areas";

describe("getDeliveryInfo", () => {
  it("charges Rs 350 and ships in 2-3 days for a Central Punjab city", () => {
    expect(getDeliveryInfo("Punjab", "Lahore")).toEqual({ fee: 350, days: "2-3 business days" });
  });

  it("is case-insensitive on city name", () => {
    expect(getDeliveryInfo("Punjab", "lahore")).toEqual({ fee: 350, days: "2-3 business days" });
  });

  it("charges Rs 350 but ships in 4-5 days for a non-central Punjab city", () => {
    expect(getDeliveryInfo("Punjab", "Rawalpindi")).toEqual({ fee: 350, days: "4-5 business days" });
  });

  it("charges Rs 400 and ships in 5-6 days for any other province", () => {
    expect(getDeliveryInfo("Sindh", "Karachi")).toEqual({ fee: 400, days: "5-6 business days" });
    expect(getDeliveryInfo("Khyber Pakhtunkhwa", "Peshawar")).toEqual({ fee: 400, days: "5-6 business days" });
    expect(getDeliveryInfo("Islamabad Capital Territory", "Islamabad")).toEqual({ fee: 400, days: "5-6 business days" });
  });
});
