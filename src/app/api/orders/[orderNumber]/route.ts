import { NextResponse } from "next/server";
import { getOrderByNumber } from "@/lib/orders";

export async function GET(_request: Request, { params }: { params: { orderNumber: string } }) {
  const order = await getOrderByNumber(params.orderNumber);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
