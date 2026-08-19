import { NextResponse } from "next/server";
import { createOrder, type CheckoutPayload } from "@/lib/orders";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CheckoutPayload | null;

  if (!body?.address || !body?.items?.length || !body?.paymentMethod) {
    return NextResponse.json({ success: false, error: "Missing required checkout fields" }, { status: 400 });
  }

  const result = await createOrder(body);
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
