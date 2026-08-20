import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getProductBySlug } from "@/lib/products";
import { shippingAddressSchema, normalizePkPhone } from "@/lib/validation";
import { checkServiceability } from "@/lib/serviceable-areas";
import { validatePromoCode } from "@/lib/promo";
import { getPaymentProvider } from "@/lib/payments";
import { isPhoneOtpVerified } from "@/lib/otp";
import { buildWhatsAppOrderContext, sendWhatsAppOrderConfirmation } from "@/lib/whatsapp";
import { reportError } from "@/lib/monitoring";
import type { Order, OrderItem, ShippingAddress } from "@/lib/types";

export interface CheckoutLineInput {
  slug: string;
  quantity: number;
  ring_size?: string | null;
}

export interface CheckoutPayload {
  address: ShippingAddress;
  items: CheckoutLineInput[];
  promoCode?: string;
  paymentMethod: "cod" | "gateway";
}

export interface CheckoutResult {
  success: boolean;
  order?: Order;
  error?: string;
}

function generateOrderNumber(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `1720-${Date.now().toString(36).toUpperCase()}${rand}`;
}

// In-memory fallback store, used only when Supabase isn't configured, so the
// checkout flow and confirmation page can still be exercised end to end in
// local/demo environments. Real deployments always persist through Supabase.
// Anchored to globalThis — see the comment in lib/otp.ts for why.
const globalForOrders = globalThis as unknown as { __orderFallbackStore?: Map<string, Order> };
const fallbackOrders = globalForOrders.__orderFallbackStore ?? new Map<string, Order>();
globalForOrders.__orderFallbackStore = fallbackOrders;

export async function createOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
  const addressResult = shippingAddressSchema.safeParse(payload.address);
  if (!addressResult.success) {
    return { success: false, error: addressResult.error.issues[0]?.message ?? "Invalid address" };
  }
  const address = addressResult.data;
  const normalizedPhone = normalizePkPhone(address.phone);

  const otpVerified = await isPhoneOtpVerified(normalizedPhone);
  if (!otpVerified) {
    return { success: false, error: "Please verify your phone number with the code we sent before placing your order." };
  }

  const area = checkServiceability(address.city, address.postalCode);
  if (!area) {
    return { success: false, error: "We don't currently deliver to that city/postal code combination." };
  }

  if (!payload.items.length) {
    return { success: false, error: "Your cart is empty." };
  }

  const items: OrderItem[] = [];
  let subtotal = 0;

  for (const line of payload.items) {
    const product = await getProductBySlug(line.slug);
    if (!product) return { success: false, error: `Product not found: ${line.slug}` };
    if (line.quantity < 1) return { success: false, error: "Invalid quantity" };
    if (product.stock_count < line.quantity) {
      return { success: false, error: `${product.name} only has ${product.stock_count} left in stock.` };
    }

    items.push({
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: line.quantity,
      ring_size: line.ring_size ?? null,
    });
    subtotal += product.price * line.quantity;
  }

  let discount = 0;
  let promoCode: string | null = null;
  if (payload.promoCode) {
    const promo = await validatePromoCode(payload.promoCode);
    if (promo.valid) {
      discount = Math.round((subtotal * promo.discountPercent) / 100);
      promoCode = payload.promoCode.trim().toUpperCase();
    }
  }

  const deliveryFee = subtotal - discount >= 6000 ? 0 : area.deliveryFee;
  const total = subtotal - discount + deliveryFee;

  const provider = getPaymentProvider(payload.paymentMethod);
  if (!provider.isAvailable()) {
    return { success: false, error: `${provider.label} is not currently available.` };
  }

  const orderNumber = generateOrderNumber();
  const chargeResult = await provider.charge({
    order: { order_number: orderNumber, total, customer_name: address.fullName, customer_phone: normalizedPhone },
  });

  if (!chargeResult.success) {
    return { success: false, error: chargeResult.error ?? "Payment failed" };
  }

  const now = new Date().toISOString();
  const order: Order = {
    id: orderNumber,
    order_number: orderNumber,
    customer_name: address.fullName,
    customer_phone: normalizedPhone,
    customer_email: null,
    shipping_address: address,
    items,
    subtotal,
    discount,
    delivery_fee: deliveryFee,
    total,
    promo_code: promoCode,
    payment_method: payload.paymentMethod,
    payment_status: chargeResult.payment_status,
    status: "pending",
    otp_verified: true,
    notes: null,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_email: order.customer_email,
        shipping_address: order.shipping_address,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        delivery_fee: order.delivery_fee,
        total: order.total,
        promo_code: order.promo_code,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        status: order.status,
        otp_verified: order.otp_verified,
      })
      .select()
      .single();

    if (error || !data) {
      reportError(error, { context: "order-write", order_number: order.order_number });
      return { success: false, error: "Could not save your order. Please try again." };
    }

    for (const item of items) {
      await supabase.rpc("decrement_stock", { p_product_id: item.product_id, p_quantity: item.quantity }).then(
        () => undefined,
        () => undefined
      );
    }

    Object.assign(order, { id: data.id, created_at: data.created_at, updated_at: data.updated_at });
  } else {
    fallbackOrders.set(order.order_number, order);
  }

  const whatsappContext = buildWhatsAppOrderContext(order);
  await sendWhatsAppOrderConfirmation(whatsappContext);

  return { success: true, order };
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  if (isSupabaseConfigured()) {
    const supabase = createAdminClient();
    const { data } = await supabase.from("orders").select("*").eq("order_number", orderNumber).maybeSingle();
    return (data as Order) ?? null;
  }
  return fallbackOrders.get(orderNumber) ?? null;
}
