import { describe, it, expect } from "vitest";
import { customerConfirmLink, orderSummaryText, ownerConfirmLink } from "./whatsapp";
import type { Order } from "./types";

const order: Order = {
  id: "uuid-1",
  order_number: "1720-ABC1234",
  customer_name: "Ayesha Khan",
  customer_phone: "+923001234567",
  customer_email: null,
  shipping_address: {
    fullName: "Ayesha Khan",
    phone: "03001234567",
    addressLine1: "House 12, Street 5",
    addressLine2: "",
    city: "Lahore",
    postalCode: "",
    province: "Punjab",
  },
  items: [
    { product_id: "p1", sku: "1720-EAR-001", name: "Mermaid Tear", image: "", price: 2200, quantity: 1, colour: "Clear crystal" },
    { product_id: "p2", sku: "1720-RNG-002", name: "Dewdrop Ring", image: "", price: 2100, quantity: 2, ring_size: "6" },
  ],
  subtotal: 6400,
  discount: 0,
  delivery_fee: 350,
  total: 6750,
  promo_code: null,
  payment_method: "cod",
  payment_status: "pending",
  status: "pending",
  otp_verified: false,
  notes: null,
  created_at: "2026-09-24T00:00:00.000Z",
  updated_at: "2026-09-24T00:00:00.000Z",
};

const decodedText = (link: string) => new URL(link).searchParams.get("text")!;

describe("orderSummaryText", () => {
  it("lists colour and ring size per item, and skips empty address parts", () => {
    const text = orderSummaryText(order);
    expect(text).toContain("1 × Mermaid Tear (Clear crystal)");
    expect(text).toContain("2 × Dewdrop Ring (size US 6)");
    expect(text).toContain("House 12, Street 5, Lahore, Punjab");
    expect(text).not.toContain(", ,");
  });
});

describe("WhatsApp links", () => {
  it("customer link goes to the store number with the order filled in", () => {
    const link = customerConfirmLink(order);
    expect(link.startsWith("https://wa.me/923356389333?")).toBe(true);
    expect(decodedText(link)).toContain("1720-ABC1234");
  });

  it("owner link goes to the customer's number as digits only", () => {
    const link = ownerConfirmLink(order);
    expect(link.startsWith("https://wa.me/923001234567?")).toBe(true);
    expect(decodedText(link)).toContain("Assalam o Alaikum Ayesha");
  });
});
