import { createAdminClient } from "@/lib/supabase/admin";
import type { Category, Order, OrderStatus, Product, ReturnRequest } from "@/lib/types";

export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  const admin = createAdminClient();
  let query = admin.from("orders").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Order[];
}

export async function getOrder(id: string): Promise<Order | null> {
  const admin = createAdminClient();
  const { data } = await admin.from("orders").select("*").eq("id", id).maybeSingle();
  return (data as Order) ?? null;
}

export async function listProducts(): Promise<Product[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  const admin = createAdminClient();
  const { data } = await admin.from("products").select("*, category:categories(*)").eq("id", id).maybeSingle();
  return (data as Product) ?? null;
}

export async function listCategories(): Promise<Category[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("categories").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
}

export async function listReturnRequests(): Promise<ReturnRequest[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("return_requests").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ReturnRequest[];
}
