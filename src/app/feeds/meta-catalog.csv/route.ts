import { getProducts } from "@/lib/products";
import { buildCatalogFeed } from "@/lib/catalog-feed";
import { SITE_URL } from "@/lib/site-url";

// Meta re-fetches the feed on its own schedule; an hour is fresh enough.
export const revalidate = 3600;

export async function GET() {
  const products = await getProducts();
  return new Response(buildCatalogFeed(products, SITE_URL), {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
