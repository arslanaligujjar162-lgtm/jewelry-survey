import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { bulkTrackPostExOrders } from "@/lib/postex";

// A plain GET with no dynamic route segment gets statically prerendered at
// build time by default — this must run fresh on every cron invocation instead.
export const dynamic = "force-dynamic";

// PostEx's own Bulk Order Tracking API has no documented limit, unlike the
// 10-tracking-number cap on Airway Bills — chunking anyway keeps requests small
// and any single bad batch from failing everything.
const CHUNK_SIZE = 20;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Runs daily (see vercel.json). Finds every order booked with PostEx that
 * hasn't already been marked Delivered, and updates postex_status for any
 * that have. The actual review-request WhatsApp link only ever needs a
 * human tap to send (see PostExPanel), so this job never messages anyone —
 * it only keeps postex_status current so that link can appear. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: orders, error } = await admin
    .from("orders")
    .select("id, postex_tracking_number")
    .not("postex_tracking_number", "is", null)
    .neq("postex_status", "Delivered");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!orders || orders.length === 0) return NextResponse.json({ checked: 0, updated: 0 });

  let updated = 0;
  for (const batch of chunk(orders, CHUNK_SIZE)) {
    const trackingNumbers = batch.map((o) => o.postex_tracking_number as string);
    const result = await bulkTrackPostExOrders(trackingNumbers);
    if (!result.success) continue;

    for (const order of batch) {
      const status = result.statuses[order.postex_tracking_number as string];
      if (!status) continue;
      const { error: updateError } = await admin.from("orders").update({ postex_status: status }).eq("id", order.id);
      if (!updateError) updated += 1;
    }
  }

  return NextResponse.json({ checked: orders.length, updated });
}
