import type { Metadata } from "next";
import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { CATEGORIES, type CategorySlug } from "@/lib/brand";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://1720.pk";

interface ShopPageProps {
  searchParams: { category?: string; min?: string; max?: string; new?: string; q?: string };
}

export function generateMetadata({ searchParams }: ShopPageProps): Metadata {
  const category = CATEGORIES.find((c) => c.slug === searchParams.category);

  // Canonicalize on category only — price/new/search-term combinations of
  // the same category are treated as the same page for SEO purposes, so
  // they don't compete with each other or the category page itself.
  const canonical = category ? `${siteUrl}/shop?category=${category.slug}` : `${siteUrl}/shop`;

  return {
    title: category ? category.label : "Shop All Jewellery",
    description: category
      ? `Browse ${category.label.toLowerCase()} in 316L stainless steel with PVD gold plating.`
      : "Browse earrings, rings, bracelets, and necklaces in 316L stainless steel with PVD gold plating.",
    alternates: { canonical },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const category = CATEGORIES.find((c) => c.slug === searchParams.category)?.slug as CategorySlug | undefined;
  const minPrice = searchParams.min ? Number(searchParams.min) : undefined;
  const maxPrice = searchParams.max ? Number(searchParams.max) : undefined;
  const isNew = searchParams.new === "true";
  const query = searchParams.q?.trim();

  const products = await getProducts({ category, minPrice, maxPrice, isNew, query });
  const categoryLabel = CATEGORIES.find((c) => c.slug === category)?.label;

  // Remounts the grid whenever the filters change, so the staggered entrance
  // animation replays instead of only firing once on first page load.
  const gridKey = `${category ?? "all"}|${minPrice ?? ""}|${maxPrice ?? ""}|${isNew}|${query ?? ""}`;

  return (
    <div className="pb-10 sm:pb-14">
      {/* Editorial masthead strip, matching the product page's archive treatment */}
      <div className="border-b border-brand-umber/15 bg-brand-butter-light/70">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-3">
          <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-charcoal/60">1720 · Shop</p>
          <p className="font-display text-[11px] italic tracking-[0.25em] text-brand-umber-dark/70">
            {products.length} {products.length === 1 ? "PIECE" : "PIECES"} — 1720 ARCHIVE
          </p>
        </div>
      </div>

      <div className="container-page pt-8 sm:pt-12">
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
          <div key={gridKey} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product, i) => (
              <div key={product.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 7) * 60}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
