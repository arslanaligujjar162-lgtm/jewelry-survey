import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { bookPostExOrder, trackPostExOrder, getPostExPaymentStatus, cancelPostExOrder } from "./postex";
import type { Order } from "./types";

const order: Order = {
  id: "uuid-1",
  order_number: "1720-ABC1234",
  customer_name: "Ayesha Khan",
  customer_phone: "03001234567",
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
  items: [{ product_id: "p1", sku: "1720-EAR-001", name: "Mermaid Tear", image: "", price: 2200, quantity: 2 }],
  subtotal: 4400,
  discount: 0,
  delivery_fee: 350,
  total: 4750,
  promo_code: null,
  payment_method: "cod",
  payment_status: "pending",
  status: "pending",
  otp_verified: false,
  notes: null,
  created_at: "2026-09-24T00:00:00.000Z",
  updated_at: "2026-09-24T00:00:00.000Z",
};

const originalToken = process.env.POSTEX_API_TOKEN;

beforeEach(() => {
  process.env.POSTEX_API_TOKEN = "test-token";
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  process.env.POSTEX_API_TOKEN = originalToken;
  vi.unstubAllGlobals();
});

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe("postExConfigured gate", () => {
  it("every call fails closed when POSTEX_API_TOKEN is missing", async () => {
    delete process.env.POSTEX_API_TOKEN;
    const result = await bookPostExOrder(order);
    expect(result.success).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("bookPostExOrder", () => {
  it("sends the order as a Normal COD shipment and returns the tracking number", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse(200, { statusCode: "200", statusMessage: "ORDER HAS BEEN CREATED", dist: { trackingNumber: "CX-001" } })
    );

    const result = await bookPostExOrder(order);
    expect(result).toEqual({ success: true, trackingNumber: "CX-001" });

    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain("/v3/create-order");
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      cityName: "Lahore",
      customerName: "Ayesha Khan",
      customerPhone: "03001234567",
      invoicePayment: 4750,
      items: 2,
      orderRefNumber: "1720-ABC1234",
      orderType: "Normal",
    });
    expect(init.headers.token).toBe("test-token");
  });

  it("surfaces PostEx's own error message on a bad response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse(400, { statusCode: "400", statusMessage: "Invalid city name" })
    );
    const result = await bookPostExOrder(order);
    expect(result).toEqual({ success: false, error: "Invalid city name" });
  });

  it("never throws when the network call itself fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"));
    const result = await bookPostExOrder(order);
    expect(result.success).toBe(false);
  });
});

describe("trackPostExOrder", () => {
  it("reads the delivery status off dist.transactionStatus", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse(200, { statusCode: "200", dist: { transactionStatus: "Out For Delivery" } })
    );
    const result = await trackPostExOrder("CX-001");
    expect(result).toEqual({ success: true, status: "Out For Delivery" });
  });
});

describe("getPostExPaymentStatus", () => {
  it("reports settled with the settlement date", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse(200, { statusCode: "200", dist: { settle: true, settlementDate: "2026-10-05" } })
    );
    const result = await getPostExPaymentStatus("CX-001");
    expect(result).toEqual({ success: true, settled: true, settlementDate: "2026-10-05" });
  });

  it("reports not settled when PostEx hasn't paid out yet", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse(200, { statusCode: "200", dist: { settle: false } }));
    const result = await getPostExPaymentStatus("CX-001");
    expect(result).toEqual({ success: true, settled: false, settlementDate: null });
  });
});

describe("cancelPostExOrder", () => {
  it("succeeds on a plain 200", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse(200, {}));
    const result = await cancelPostExOrder("CX-001");
    expect(result).toEqual({ success: true });
  });

  it("reports not-found on a 404", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse(404, {}));
    const result = await cancelPostExOrder("CX-001");
    expect(result).toEqual({ success: false, error: "Order not found on PostEx." });
  });
});
