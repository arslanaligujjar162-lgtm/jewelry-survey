import type { Product } from "@/lib/types";
import { getReviewStats, type Review } from "@/lib/reviews";

export function ProductSchema({ product, url, reviews = [] }: { product: Product; url: string; reviews?: Review[] }) {
  const stats = getReviewStats(reviews);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images,
    url,
    material: product.material_spec,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PKR",
      price: product.price,
      availability:
        product.stock_count > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    // Only present when there are real, on-page reviews to back it —
    // Google requires review markup to reflect content visibly on the page.
    ...(stats.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: stats.average,
        reviewCount: stats.count,
      },
    }),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
