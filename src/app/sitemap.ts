import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/site-url";

// Pick up newly photographed products without a redeploy.
export const revalidate = 3600;

const siteUrl = SITE_URL;

const STATIC_ROUTES = [
  "",
  "/shop",
  "/about",
  "/care-guide",
  "/faq",
  "/sizing-guide",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/returns-policy",
  "/request-return",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/product/${product.slug}`,
    lastModified: product.created_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
