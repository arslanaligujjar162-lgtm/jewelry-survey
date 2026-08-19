import type { Product } from "@/lib/types";

export function ProductSchema({ product, url }: { product: Product; url: string }) {
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
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
