import { describe, it, expect } from "vitest";
import { createOrder, type CheckoutPayload } from "./orders";

// Runs against the built-in catalogue (no Supabase configured in tests).
const address: CheckoutPayload["address"] = {
  fullName: "Ayesha Khan",
  phone: "03001234567",
  addressLine1: "House 12, Street 5",
  city: "Lahore",
  postalCode: "",
  province: "Punjab",
};

const order = (items: CheckoutPayload["items"]) => createOrder({ address, items, paymentMethod: "cod" });

describe("createOrder", () => {
  it("places a COD order without phone verification when no SMS gateway is configured", async () => {
    const result = await order([{ slug: "jet-hoop", quantity: 1 }]);
    expect(result.success).toBe(true);
    expect(result.order?.otp_verified).toBe(false);
    expect(result.order?.delivery_fee).toBe(350);
  });

  it("requires a colour for pieces sold in more than one", async () => {
    const result = await order([{ slug: "mermaid-tear", quantity: 1 }]);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/choose a colour/i);
  });

  it("rejects a colour the piece doesn't come in", async () => {
    const result = await order([{ slug: "mermaid-tear", quantity: 1, colour: "Emerald" }]);
    expect(result.success).toBe(false);
  });

  it("records the chosen colour, with that colourway's photo", async () => {
    const result = await order([{ slug: "mermaid-tear", quantity: 1, colour: "Clear crystal" }]);
    expect(result.success).toBe(true);
    expect(result.order?.items[0]).toMatchObject({
      colour: "Clear crystal",
      image: "/products/mermaid-tear-2.jpg",
    });
  });

  it("checks stock across all lines of a product, not line by line", async () => {
    // Vogue Hoop has 18 in stock: 10 gold + 10 steel must not both go through.
    const result = await order([
      { slug: "vogue-hoop", quantity: 10, colour: "Gold" },
      { slug: "vogue-hoop", quantity: 10, colour: "Steel" },
    ]);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/only has 18 left/);
  });

  it("rejects fractional quantities", async () => {
    const result = await order([{ slug: "jet-hoop", quantity: 1.5 }]);
    expect(result.success).toBe(false);
  });
});
