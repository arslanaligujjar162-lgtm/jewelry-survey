import { describe, it, expect, afterEach } from "vitest";
import { customerConfirmLink, orderSummaryText, ownerConfirmLink } from "./whatsapp";
import { ADVANCE_ACCOUNTS } from "./advance-payment";
import type { Order } from "./types";

const base: Order = {
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
    const text = orderSummaryText(base);
    expect(text).toContain("1 × Mermaid Tear (Clear crystal)");
    expect(text).toContain("2 × Dewdrop Ring (size US 6)");
    expect(text).toContain("House 12, Street 5, Lahore, Punjab");
    expect(text).not.toContain(", ,");
  });
});

describe("WhatsApp links", () => {
  it("customer link goes to the store number with the order filled in", () => {
    const link = customerConfirmLink(base);
    expect(link.startsWith("https://wa.me/923356389333?")).toBe(true);
    expect(decodedText(link)).toContain("1720-ABC1234");
  });

  it("owner link goes to the customer's number as digits only", () => {
    const link = ownerConfirmLink(base);
    expect(link.startsWith("https://wa.me/923001234567?")).toBe(true);
    expect(decodedText(link)).toContain("Assalam o Alaikum Ayesha");
  });
});

describe("advance payment wording, once an account is configured", () => {
  afterEach(() => {
    ADVANCE_ACCOUNTS.length = 0;
  });

  it("splits the total into advance + remaining everywhere it's mentioned", () => {
    ADVANCE_ACCOUNTS.push({ method: "JazzCash", number: "0333-0278559", title: "Arslan Ali" });

    const summary = orderSummaryText(base);
    expect(summary).toContain("Rs. 500 advance + Rs. 6,250 Cash on Delivery");

    const customerText = decodedText(customerConfirmLink(base));
    expect(customerText).toContain("I'll send the Rs. 500 advance to JazzCash: 0333-0278559 (Arslan Ali)");

    const ownerText = decodedText(ownerConfirmLink(base));
    expect(ownerText).toContain("Please send Rs. 500 advance to JazzCash: 0333-0278559 (Arslan Ali)");
    expect(ownerText).toContain("remaining Rs. 6,250 is payable in cash on delivery");
  });
});
