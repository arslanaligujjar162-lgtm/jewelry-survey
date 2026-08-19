import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getOrderByNumber } from "@/lib/orders";

export interface SubmitReturnResult {
  success: boolean;
  error?: string;
}

export async function submitReturnRequest(orderNumber: string, reason: string): Promise<SubmitReturnResult> {
  if (!orderNumber.trim() || !reason.trim()) {
    return { success: false, error: "Order number and reason are required" };
  }

  const order = await getOrderByNumber(orderNumber.trim());
  if (!order) {
    return { success: false, error: "We couldn't find an order with that number" };
  }

  if (!isSupabaseConfigured()) {
    console.log(`[returns:stub] would record return request for ${orderNumber}: ${reason}`);
    return { success: true };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("return_requests").insert({
    order_id: order.id,
    order_number: order.order_number,
    reason: reason.trim(),
  });

  if (error) return { success: false, error: "Could not submit your request. Please try again." };
  return { success: true };
}
