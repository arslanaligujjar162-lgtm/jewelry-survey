import type { Product } from "@/lib/types";
import { BRAND_NAME } from "@/lib/brand";

const GOOGLE_CATEGORY: Record<string, string> = {
  earrings: "Apparel & Accessories > Jewelry > Earrings",
  rings: "Apparel & Accessories > Jewelry > Rings",
  bracelets: "Apparel & Accessories > Jewelry > Bracelets",
  necklaces: "Apparel & Accessories > Jewelry > Necklaces",
};

const COLUMNS = [
  "id",
  "item_group_id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "additional_image_link",
  "brand",
  "color",
  "google_product_category",
  "quantity_to_sell_on_facebook",
] as const;

function csvField(value: string | number): string {
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Product catalog feed in Meta Commerce Manager's CSV format, which is what
 * lets products be tagged in Instagram posts. Pieces sold in several colours
 * become one row per colour sharing an item_group_id, so Instagram shows them
 * as variants of one product.
 */
export function buildCatalogFeed(products: Product[], siteUrl: string): string {
  const absolute = (src: string) => (src.startsWith("/") ? `${siteUrl}${src}` : src);
  const rows: string[][] = [];

  for (const p of products) {
    const category = p.category?.slug ?? p.category_id;
    const base = {
      title: p.name,
      description: p.description,
      availability: p.stock_count > 0 ? "in stock" : "out of stock",
      condition: "new",
      price: `${p.price.toFixed(2)} PKR`,
      link: `${siteUrl}/product/${p.slug}`,
      brand: BRAND_NAME,
      google_product_category: GOOGLE_CATEGORY[category] ?? "Apparel & Accessories > Jewelry",
      quantity_to_sell_on_facebook: String(Math.max(p.stock_count, 0)),
    };
    const variants = p.colour_options?.length
      ? p.colour_options.map((o) => ({ id: `${p.sku}-${o.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, color: o.name, image: o.image }))
      : [{ id: p.sku, color: "", image: p.images[0] }];

    for (const v of variants) {
      const record: Record<(typeof COLUMNS)[number], string> = {
        ...base,
        id: v.id,
        item_group_id: p.colour_options?.length ? p.sku : "",
        image_link: absolute(v.image),
        additional_image_link: p.images.filter((src) => src !== v.image).map(absolute).join(","),
        color: v.color,
      };
      rows.push(COLUMNS.map((c) => csvField(record[c])));
    }
  }

  return [COLUMNS.join(","), ...rows.map((r) => r.join(","))].join("\n") + "\n";
}
