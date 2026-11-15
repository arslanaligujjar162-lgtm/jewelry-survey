import { describe, it, expect, afterEach } from "vitest";
import { orderSummaryText, ownerConfirmLink, reviewRequestLink, productOrderMessage, productOrderLink } from "./whatsapp";
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

  it("says free delivery instead of a zero amount when delivery is free", () => {
    const text = orderSummaryText({ ...base, delivery_fee: 0 });
    expect(text).toContain("free delivery");
    expect(text).not.toContain("Rs. 0");
  });
});

describe("WhatsApp links", () => {
  it("owner link goes to the customer's number as digits only", () => {
    const link = ownerConfirmLink(base);
    expect(link.startsWith("https://wa.me/923001234567?")).toBe(true);
    expect(decodedText(link)).toContain("Assalam o Alaikum Ayesha");
  });

  it("review request links to each bought product's review section", () => {
    const link = reviewRequestLink(base, [
      { name: "Mermaid Tear", url: "https://1720jewelry.xyz/product/mermaid-tear#reviews" },
      { name: "Dewdrop Ring", url: "https://1720jewelry.xyz/product/dewdrop-ring#reviews" },
    ]);
    const text = decodedText(link);
    expect(text).toContain("Mermaid Tear: https://1720jewelry.xyz/product/mermaid-tear#reviews");
    expect(text).toContain("Dewdrop Ring: https://1720jewelry.xyz/product/dewdrop-ring#reviews");
    expect(text).toContain("order 1720-ABC1234");
  });
});

describe("advance payment wording", () => {
  const original = [...ADVANCE_ACCOUNTS];

  afterEach(() => {
    ADVANCE_ACCOUNTS.length = 0;
    ADVANCE_ACCOUNTS.push(...original);
  });

  it("splits the total into advance + remaining everywhere it's mentioned", () => {
    ADVANCE_ACCOUNTS.length = 0;
    ADVANCE_ACCOUNTS.push({ method: "NayaPay", number: "0310-4594770", title: "Asim Zaheer" });

    const summary = orderSummaryText(base);
    expect(summary).toContain("Rs. 500 advance + Rs. 6,250 Cash on Delivery");

    const ownerText = decodedText(ownerConfirmLink(base));
    expect(ownerText).toContain("Please send Rs. 500 advance to NayaPay: 0310-4594770 (Asim Zaheer)");
    expect(ownerText).toContain("remaining Rs. 6,250 is payable in cash on delivery");
  });
});

describe("productOrderMessage", () => {
  const ring = { name: "The OG Ring", slug: "og-ring", price: 2800, ring_size_range: "5-9", colour_options: null };
  const studs = { name: "Gala Studs", slug: "gala-studs", price: 1950, ring_size_range: null, colour_options: null };

  it("names the piece, price and product link", () => {
    const text = productOrderMessage(studs, { origin: "https://1720jewelry.xyz" });
    expect(text).toContain("1 × Gala Studs (Rs. 1,950)");
    expect(text).toContain("https://1720jewelry.xyz/product/gala-studs");
    expect(text).not.toContain("Ring size");
  });

  it("leaves a blank for the ring size when none is chosen, and fills it when it is", () => {
    expect(productOrderMessage(ring)).toContain("Ring size (US): ");
    expect(productOrderMessage(ring, { quantity: 2, ringSize: "7" })).toContain("2 × The OG Ring");
    expect(productOrderMessage(ring, { ringSize: "7" })).toContain("Ring size (US): 7");
  });

  it("opens the store's WhatsApp number", () => {
    expect(productOrderLink(studs).startsWith("https://wa.me/923356389333?text=")).toBe(true);
  });
});
