import { describe, it, expect, afterEach } from "vitest";
import { createOrder, type CheckoutPayload } from "./orders";
import { FALLBACK_PRODUCTS } from "@/data/seed-products";

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
    const result = await order([{ slug: "black-olive-hoops", quantity: 1 }]);
    expect(result.success).toBe(true);
    expect(result.order?.otp_verified).toBe(false);
    expect(result.order?.delivery_fee).toBe(350);
  });

  it("checks stock across all lines of a product, not line by line", async () => {
    // Starlet Ring has 9 in stock: 5 (size 6) + 5 (size 7) must not both go through.
    const result = await order([
      { slug: "starlet-ring", quantity: 5, ring_size: "6" },
      { slug: "starlet-ring", quantity: 5, ring_size: "7" },
    ]);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/only has 9 left/);
  });

  it("rejects fractional quantities", async () => {
    const result = await order([{ slug: "black-olive-hoops", quantity: 1.5 }]);
    expect(result.success).toBe(false);
  });

  describe("colour-gated products", () => {
    const product = FALLBACK_PRODUCTS.find((p) => p.slug === "mermaid-tear")!;

    afterEach(() => {
      product.colour_options = null;
    });

    it("requires a colour for pieces sold in more than one", async () => {
      product.colour_options = [
        { name: "Multicolour", image: "/products/mermaid-tear-1.jpg" },
        { name: "Clear crystal", image: "/products/mermaid-tear-2.jpg" },
      ];
      const result = await order([{ slug: "mermaid-tear", quantity: 1 }]);
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/choose a colour/i);
    });

    it("rejects a colour the piece doesn't come in", async () => {
      product.colour_options = [{ name: "Multicolour", image: "/products/mermaid-tear-1.jpg" }];
      const result = await order([{ slug: "mermaid-tear", quantity: 1, colour: "Emerald" }]);
      expect(result.success).toBe(false);
    });

    it("records the chosen colour, with that colourway's photo", async () => {
      product.colour_options = [
        { name: "Multicolour", image: "/products/mermaid-tear-1.jpg" },
        { name: "Clear crystal", image: "/products/mermaid-tear-2.jpg" },
      ];
      const result = await order([{ slug: "mermaid-tear", quantity: 1, colour: "Clear crystal" }]);
      expect(result.success).toBe(true);
      expect(result.order?.items[0]).toMatchObject({
        colour: "Clear crystal",
        image: "/products/mermaid-tear-2.jpg",
      });
    });
  });
});
