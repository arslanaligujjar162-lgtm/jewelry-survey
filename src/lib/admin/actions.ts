"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/lib/types";

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
  const { error } = await admin.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
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
}

export async function createProduct(values: ProductFormValues) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").insert(values);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, values: ProductFormValues) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").update(values).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}
