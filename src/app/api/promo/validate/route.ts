import { NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/promo";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = body?.code as string | undefined;

  if (!code) return NextResponse.json({ valid: false, message: "Enter a code" }, { status: 400 });

  const result = await validatePromoCode(code);
  return NextResponse.json(result);
}
