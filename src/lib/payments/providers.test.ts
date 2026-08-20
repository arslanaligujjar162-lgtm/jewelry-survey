import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { codProvider } from "./cod";
import { gatewayProvider } from "./gateway";
import { getAvailablePaymentProviders, getPaymentProvider } from "./index";

describe("codProvider", () => {
  it("is always available", () => {
    expect(codProvider.isAvailable()).toBe(true);
  });

  it("charges successfully with a pending payment status", async () => {
    const result = await codProvider.charge({
      order: { order_number: "1720-TEST", total: 1000, customer_name: "Test", customer_phone: "+923001234567" },
    });
    expect(result.success).toBe(true);
    expect(result.payment_status).toBe("pending");
  });
});

describe("gatewayProvider", () => {
  const originalEnv = process.env.NEXT_PUBLIC_GATEWAY_ENABLED;

  afterEach(() => {
    process.env.NEXT_PUBLIC_GATEWAY_ENABLED = originalEnv;
  });

  it("is unavailable by default", () => {
    delete process.env.NEXT_PUBLIC_GATEWAY_ENABLED;
    expect(gatewayProvider.isAvailable()).toBe(false);
  });

  it("becomes available once the flag is flipped", () => {
    process.env.NEXT_PUBLIC_GATEWAY_ENABLED = "true";
    expect(gatewayProvider.isAvailable()).toBe(true);
  });

  it("fails a charge with a clear error even when flagged available", async () => {
    process.env.NEXT_PUBLIC_GATEWAY_ENABLED = "true";
    const result = await gatewayProvider.charge({
      order: { order_number: "1720-TEST", total: 1000, customer_name: "Test", customer_phone: "+923001234567" },
    });
    expect(result.success).toBe(false);
    expect(result.payment_status).toBe("failed");
  });
});

describe("getAvailablePaymentProviders", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_GATEWAY_ENABLED;
  });

  it("only returns COD when the gateway flag is off", () => {
    const available = getAvailablePaymentProviders();
    expect(available.map((p) => p.id)).toEqual(["cod"]);
  });
});

describe("getPaymentProvider", () => {
  it("throws for an unknown provider id", () => {
    // @ts-expect-error deliberately invalid id for the error-path test
    expect(() => getPaymentProvider("unknown")).toThrow();
  });
});
