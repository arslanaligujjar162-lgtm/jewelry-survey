"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ColourOption, Order, OrderStatus } from "@/lib/types";
import { bookPostExOrder, cancelPostExOrder, getPostExPaymentStatus, trackPostExOrder } from "@/lib/postex";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function updateOrderStatusAction(orderId: string, formData: FormData) {
  await requireAdmin();
  const status = formData.get("status") as OrderStatus;
  const admin = createAdminClient();

  // Stock is reserved (decremented) the moment an order is placed, so cancelling
  // one needs to give it back — but only the first time it's cancelled, so
  // toggling the dropdown back and forth can't restock the same order twice.
  const { data: existing } = await admin.from("orders").select("status, items").eq("id", orderId).single();
  if (status === "cancelled" && existing && existing.status !== "cancelled") {
    for (const item of existing.items as { product_id: string; quantity: number }[]) {
      await admin.rpc("increment_stock", { p_product_id: item.product_id, p_quantity: item.quantity }).then(
        () => undefined,
        () => undefined
      );
    }
  }

  const { error } = await admin.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/", "layout");
}

/** Tracks whether the Rs 500 advance has actually been received — checked manually
 * against the owner's wallet/bank, since there's no payment gateway in the loop. */
export async function updatePaymentStatusAction(orderId: string, formData: FormData) {
  await requireAdmin();
  const payment_status = formData.get("status") as "pending" | "paid" | "failed";
  const admin = createAdminClient();
  const { error } = await admin.from("orders").update({ payment_status }).eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

/** Only ever called for a cancelled order — kept out of the status dropdown's reach. */
export async function deleteOrderAction(orderId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("orders").delete().eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}

/** Books the order as a COD shipment with PostEx and stores the tracking number. */
export async function bookPostExOrderAction(orderId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (!order) return { error: "Order not found." };

  const result = await bookPostExOrder(order as Order);
  if (!result.success) return { error: result.error };

  const { error } = await admin
    .from("orders")
    .update({ postex_tracking_number: result.trackingNumber, postex_status: "Booked" })
    .eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return {};
}

export async function refreshPostExStatusAction(orderId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("postex_tracking_number").eq("id", orderId).single();
  if (!order?.postex_tracking_number) return { error: "This order hasn't been booked with PostEx yet." };

  const result = await trackPostExOrder(order.postex_tracking_number);
  if (!result.success) return { error: result.error };

  const { error } = await admin.from("orders").update({ postex_status: result.status }).eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return {};
}

export async function cancelPostExBookingAction(orderId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("postex_tracking_number").eq("id", orderId).single();
  if (!order?.postex_tracking_number) return { error: "This order hasn't been booked with PostEx yet." };

  const result = await cancelPostExOrder(order.postex_tracking_number);
  if (!result.success) return { error: result.error };

  const { error } = await admin.from("orders").update({ postex_status: "Cancelled" }).eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return {};
}

/** Checked on demand rather than stored — this is purely informational for the owner. */
export async function checkPostExPaymentStatusAction(
  orderId: string
): Promise<{ error?: string; settled?: boolean; settlementDate?: string | null }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("postex_tracking_number").eq("id", orderId).single();
  if (!order?.postex_tracking_number) return { error: "This order hasn't been booked with PostEx yet." };

  const result = await getPostExPaymentStatus(order.postex_tracking_number);
  if (!result.success) return { error: result.error };
  return { settled: result.settled, settlementDate: result.settlementDate };
}

export async function updateReturnStatusAction(returnId: string, formData: FormData) {
  await requireAdmin();
  const status = formData.get("status") as string;
  const admin = createAdminClient();
  const { error } = await admin.from("return_requests").update({ status }).eq("id", returnId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/returns");
}

interface ProductFormValues {
  sku: string;
  name: string;
  slug: string;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  description: string;
  plating_spec: string;
  material_spec: string;
  images: string[];
  stock_count: number;
  is_new: boolean;
  ring_size_range: string | null;
  colour_options?: ColourOption[] | null;
}

// Product edits must reach the storefront straight away: the homepage and
// product pages are pre-rendered, so without this a new photo or price would
// only appear after the next deploy.
function revalidateStorefront() {
  revalidatePath("/", "layout");
}

export async function createProduct(values: ProductFormValues) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").insert(values);
  if (error) throw new Error(error.message);
  revalidateStorefront();
  redirect("/admin/products");
}

export async function updateProduct(id: string, values: ProductFormValues) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").update(values).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateStorefront();
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateStorefront();
}

export async function updateReviewStatusAction(reviewId: string, formData: FormData) {
  await requireAdmin();
  const status = formData.get("status") as string;
  const admin = createAdminClient();
  const { error } = await admin.from("reviews").update({ status }).eq("id", reviewId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reviews");
}
