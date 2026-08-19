import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://7teen2wenty.pk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/order-confirmation", "/cart", "/checkout"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
