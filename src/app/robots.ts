import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

const siteUrl = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/order-confirmation", "/cart", "/checkout", "/wishlist"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
