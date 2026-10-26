import { NextResponse } from "next/server";
import { nayapayAdapter } from "@/lib/payments/nayapay";
import { handleGatewayWebhook } from "@/lib/payments/webhook";

export async function POST(request: Request) {
  // The signature covers the exact bytes sent, so read the body as raw text.
  const rawBody = await request.text();
  const result = await handleGatewayWebhook(nayapayAdapter, rawBody, request.headers);
  return NextResponse.json(result.body, { status: result.status });
}
