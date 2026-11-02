import { NextResponse } from "next/server";
import { getPostExAirwayBill } from "@/lib/postex";

/** Proxies PostEx's Airway Bill PDF through our server so the browser can open/print
 * it with a plain link — PostEx requires a token header a bare <a href> can't send.
 * Protected by src/middleware.ts, which redirects unauthenticated requests under
 * /admin to the login page before this handler ever runs. */
export async function GET(_request: Request, { params }: { params: { trackingNumber: string } }) {
  const result = await getPostExAirwayBill([params.trackingNumber]);
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 502 });

  return new NextResponse(result.pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="postex-${params.trackingNumber}.pdf"`,
    },
  });
}
