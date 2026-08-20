import { NextResponse } from "next/server";
import { submitReview } from "@/lib/reviews";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const productId = body?.productId as string | undefined;
  const authorName = body?.authorName as string | undefined;
  const rating = body?.rating as number | undefined;
  const comment = body?.comment as string | undefined;

  if (!productId || !authorName || !rating || !comment) {
    return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
  }

  const ipLimit = rateLimit(`reviews:ip:${getClientIp(request)}`, 5, 60 * 60);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many reviews submitted. Please try again later." },
      { status: 429, headers: { "Retry-After": ipLimit.retryAfterSeconds.toString() } }
    );
  }

  const result = await submitReview({ productId, authorName, rating, comment });
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
