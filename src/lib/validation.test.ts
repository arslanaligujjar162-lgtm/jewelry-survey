import { describe, it, expect } from "vitest";
import { PK_PHONE_REGEX, normalizePkPhone, shippingAddressSchema } from "./validation";

describe("PK_PHONE_REGEX", () => {
  it.each(["03001234567", "+923001234567", "00923001234567", "3001234567"])(
    "accepts valid Pakistani mobile number %s",
    (phone) => {
      expect(PK_PHONE_REGEX.test(phone)).toBe(true);
    }
  );

  it.each(["0300123456", "0201234567", "123", "abcdefghijk", "+9230012345678"])(
    "rejects invalid number %s",
    (phone) => {
      expect(PK_PHONE_REGEX.test(phone)).toBe(false);
    }
  );
});

describe("normalizePkPhone", () => {
  it("normalizes a local-format number to +92", () => {
    expect(normalizePkPhone("03001234567")).toBe("+923001234567");
  });

  it("normalizes an already-international number", () => {
    expect(normalizePkPhone("+923001234567")).toBe("+923001234567");
  });

  it("normalizes the 0092 prefix", () => {
    expect(normalizePkPhone("00923001234567")).toBe("+923001234567");
  });
});

describe("shippingAddressSchema", () => {
  const validAddress = {
    fullName: "Ayesha Khan",
    phone: "03001234567",
    addressLine1: "House 12, Street 5",
    city: "Lahore",
    postalCode: "54000",
    province: "Punjab",
  };

  it("accepts a valid address", () => {
    expect(shippingAddressSchema.safeParse(validAddress).success).toBe(true);
  });

  it("rejects a missing city", () => {
    const result = shippingAddressSchema.safeParse({ ...validAddress, city: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone", () => {
    const result = shippingAddressSchema.safeParse({ ...validAddress, phone: "123" });
    expect(result.success).toBe(false);
  });
});
