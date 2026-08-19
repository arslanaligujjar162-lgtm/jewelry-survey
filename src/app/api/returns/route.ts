import { NextResponse } from "next/server";
import { submitReturnRequest } from "@/lib/returns";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const orderNumber = body?.orderNumber as string | undefined;
  const reason = body?.reason as string | undefined;

  if (!orderNumber || !reason) {
    return NextResponse.json({ success: false, error: "Order number and reason are required" }, { status: 400 });
  }

  const result = await submitReturnRequest(orderNumber, reason);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
