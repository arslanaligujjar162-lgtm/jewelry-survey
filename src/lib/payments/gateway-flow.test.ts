import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { GatewayAdapter } from "./types";

// A stand-in gateway: signature is just a header, reference is derived from
// the order number. Built with vi.hoisted because vi.mock runs before imports.
const { state, fakeAdapter, notifyNewOrder } = vi.hoisted(() => {
  const state = { configured: true };
  const fakeAdapter: GatewayAdapter = {
    name: "fake",
    isConfigured: () => state.configured,
    async createSession({ order_number }) {
      return { redirect_url: `https://pay.example/${order_number}`, reference: `ref-${order_number}` };
    },
    parseWebhook(rawBody, headers) {
      if (headers.get("x-signature") !== "valid") return null;
      return JSON.parse(rawBody);
    },
  };
  return { state, fakeAdapter, notifyNewOrder: vi.fn() };
});

vi.mock("./nayapay", () => ({ nayapayAdapter: fakeAdapter }));
vi.mock("@/lib/notify", () => ({ notifyNewOrder }));

import { createOrder, getOrderByNumber, type CheckoutPayload } from "@/lib/orders";
import { handleGatewayWebhook } from "./webhook";

const address: CheckoutPayload["address"] = {
  fullName: "Ayesha Khan",
  phone: "03001234567",
  addressLine1: "House 12, Street 5",
  city: "Lahore",
  postalCode: "",
  province: "Punjab",
};

const items = [{ slug: "black-olive-hoops", quantity: 1 }];
const call = (body: unknown, signature = "valid") =>
  handleGatewayWebhook(fakeAdapter, JSON.stringify(body), new Headers({ "x-signature": signature }));

async function placeGatewayOrder() {
  const result = await createOrder({ address, items, paymentMethod: "gateway" });
  expect(result.success).toBe(true);
  return result.order!;
}

describe("gateway checkout and webhook", () => {
  const originalFlag = process.env.NEXT_PUBLIC_GATEWAY_ENABLED;

  beforeEach(() => {
    state.configured = true;
    process.env.NEXT_PUBLIC_GATEWAY_ENABLED = "true";
    notifyNewOrder.mockClear();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_GATEWAY_ENABLED = originalFlag;
  });

  it("creates the order unpaid, hands back the payment page, and holds the owner alert", async () => {
    const result = await createOrder({ address, items, paymentMethod: "gateway" });
    expect(result.success).toBe(true);
    expect(result.redirect_url).toBe(`https://pay.example/${result.order!.order_number}`);
    expect(result.order!.payment_status).toBe("pending");
    expect(result.order!.status).toBe("pending");
    expect(result.order!.payment_reference).toBe(`ref-${result.order!.order_number}`);
    expect(notifyNewOrder).not.toHaveBeenCalled();
  });

  it("refuses gateway checkout while the gateway is switched off", async () => {
    delete process.env.NEXT_PUBLIC_GATEWAY_ENABLED;
    const result = await createOrder({ address, items, paymentMethod: "gateway" });
    expect(result.success).toBe(false);
  });

  it("confirms the order and alerts the owner once the advance is paid", async () => {
    const order = await placeGatewayOrder();
    const res = await call({ order_number: order.order_number, reference: order.payment_reference, amount: 500, status: "paid" });
    expect(res.status).toBe(200);
    const saved = await getOrderByNumber(order.order_number);
    expect(saved?.payment_status).toBe("paid");
    expect(saved?.status).toBe("confirmed");
    expect(notifyNewOrder).toHaveBeenCalledTimes(1);
  });

  it("is idempotent when the gateway retries the same webhook", async () => {
    const order = await placeGatewayOrder();
    const event = { order_number: order.order_number, reference: order.payment_reference, amount: 500, status: "paid" };
    expect((await call(event)).status).toBe(200);
    expect((await call(event)).status).toBe(200);
    expect(notifyNewOrder).toHaveBeenCalledTimes(1);
  });

  it("rejects a bad signature without touching the order", async () => {
    const order = await placeGatewayOrder();
    const res = await call({ order_number: order.order_number, reference: order.payment_reference, amount: 500, status: "paid" }, "forged");
    expect(res.status).toBe(401);
    expect((await getOrderByNumber(order.order_number))?.payment_status).toBe("pending");
  });

  it("rejects a payment for the wrong amount", async () => {
    const order = await placeGatewayOrder();
    const res = await call({ order_number: order.order_number, reference: order.payment_reference, amount: 50, status: "paid" });
    expect(res.status).toBe(400);
    expect((await getOrderByNumber(order.order_number))?.payment_status).toBe("pending");
  });

  it("rejects a payment whose reference doesn't match the order's", async () => {
    const order = await placeGatewayOrder();
    const res = await call({ order_number: order.order_number, reference: "someone-elses", amount: 500, status: "paid" });
    expect(res.status).toBe(400);
    expect((await getOrderByNumber(order.order_number))?.payment_status).toBe("pending");
  });

  it("records a failed payment without confirming the order", async () => {
    const order = await placeGatewayOrder();
    const res = await call({ order_number: order.order_number, reference: order.payment_reference, amount: 500, status: "failed" });
    expect(res.status).toBe(200);
    const saved = await getOrderByNumber(order.order_number);
    expect(saved?.payment_status).toBe("failed");
    expect(saved?.status).toBe("pending");
    expect(notifyNewOrder).not.toHaveBeenCalled();
  });

  it("answers 404 for an unknown order", async () => {
    const res = await call({ order_number: "1720-NOPE", reference: "x", amount: 500, status: "paid" });
    expect(res.status).toBe(404);
  });

  it("doesn't exist at all while the gateway isn't configured", async () => {
    state.configured = false;
    const res = await call({ order_number: "1720-ANY", reference: "x", amount: 500, status: "paid" });
    expect(res.status).toBe(404);
  });

  it("never lets a webhook settle a cash-on-delivery order", async () => {
    const cod = await createOrder({ address, items, paymentMethod: "cod" });
    expect(notifyNewOrder).toHaveBeenCalledTimes(1);
    const res = await call({ order_number: cod.order!.order_number, reference: "x", amount: 500, status: "paid" });
    expect(res.status).toBe(404);
    expect((await getOrderByNumber(cod.order!.order_number))?.payment_status).toBe("pending");
  });
});
