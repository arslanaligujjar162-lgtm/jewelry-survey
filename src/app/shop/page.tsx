import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { CATEGORIES, type CategorySlug } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Shop All Jewellery",
  description: "Browse earrings, rings, bracelets, and necklaces in 316L stainless steel with PVD gold plating.",
};

interface ShopPageProps {
  searchParams: { category?: string; min?: string; max?: string; new?: string; q?: string };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const category = CATEGORIES.find((c) => c.slug === searchParams.category)?.slug as CategorySlug | undefined;
  const minPrice = searchParams.min ? Number(searchParams.min) : undefined;
  const maxPrice = searchParams.max ? Number(searchParams.max) : undefined;
  const isNew = searchParams.new === "true";
  const query = searchParams.q?.trim();

  const products = await getProducts({ category, minPrice, maxPrice, isNew, query });
  const categoryLabel = CATEGORIES.find((c) => c.slug === category)?.label;

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-body text-sm font-semibold uppercase tracking-widest text-brand-umber">Shop</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">
            {query ? `Results for "${query}"` : categoryLabel ?? "All jewellery"}
          </h1>
        </div>
      </div>

      <div className="mt-6">
        <Suspense fallback={null}>
          <ShopFilters />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <p className="mt-14 font-body text-sm text-brand-charcoal/70">
          Nothing matches those filters yet. Try widening your search.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
