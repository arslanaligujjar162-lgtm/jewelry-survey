import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, getRelatedProducts } from "@/lib/products";
import { getApprovedReviews } from "@/lib/reviews";
import { formatPKR } from "@/lib/format";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { StockIndicator } from "@/components/product/StockIndicator";
import { TrustBadges } from "@/components/product/TrustBadges";
import { ProductFeatures } from "@/components/product/ProductFeatures";
import { ProductSchema } from "@/components/product/ProductSchema";
import { ProductCard } from "@/components/product/ProductCard";
import { WishlistButton } from "@/components/product/WishlistButton";
import { RecentlyViewedTracker } from "@/components/product/RecentlyViewedTracker";
import { RecentlyViewedSection } from "@/components/product/RecentlyViewedSection";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { getProductTagline } from "@/data/product-taglines";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://1720.pk";

interface ProductPageProps {
  params: { slug: string };
}

/** A four-digit "plate number" pulled from the SKU, for the editorial folio treatment. */
function getPlateNumber(sku: string): string {
  const match = sku.match(/(\d+)$/);
  return match ? match[1].padStart(3, "0") : "001";
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} — ${formatPKR(product.price)}`,
    description: product.description,
    alternates: { canonical: `${siteUrl}/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([getRelatedProducts(product), getApprovedReviews(product.id)]);
  const productUrl = `${siteUrl}/product/${product.slug}`;
  const plateNumber = getPlateNumber(product.sku);

  const breadcrumbs = [
    { name: "Shop", url: `${siteUrl}/shop` },
    ...(product.category
      ? [{ name: product.category.name, url: `${siteUrl}/shop?category=${product.category.slug}` }]
      : []),
    { name: product.name, url: productUrl },
  ];

  return (
    <div className="pb-10 sm:pb-14">
      <ProductSchema product={product} url={productUrl} reviews={reviews} />
      <BreadcrumbSchema items={breadcrumbs} />
      <RecentlyViewedTracker product={product} />

      {/* Editorial masthead strip — breadcrumb doubles as a magazine section rule */}
      <div className="border-b border-brand-umber/15 bg-brand-butter-light/70">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-3">
          <nav aria-label="Breadcrumb" className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-charcoal/60">
            <Link href="/shop" className="hover:text-brand-umber">
              Shop
            </Link>
            {product.category && (
              <>
                {" "}
                ·{" "}
                <Link href={`/shop?category=${product.category.slug}`} className="hover:text-brand-umber">
                  {product.category.name}
                </Link>
              </>
            )}
          </nav>
          <p className="font-display text-[11px] italic tracking-[0.25em] text-brand-umber-dark/70">
            PLATE No. {plateNumber} — 1720 ARCHIVE
          </p>
        </div>
      </div>

      <div className="container-page pt-8 sm:pt-12">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          {/* Image column — CSS-only entrance; this is the buy path, so it must
              never depend on JS/IntersectionObserver to become visible. */}
          <div className="animate-rise">
            <div className="relative">
              {product.is_new && (
                <span className="absolute -left-3 -top-3 z-10 -rotate-[8deg] rounded-sm border-2 border-dashed border-brand-umber-dark bg-brand-butter px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wide text-brand-umber-dark shadow-retro-sm">
                  New Arrival
                </span>
              )}
              <ProductGallery images={product.images} productName={product.name} />
            </div>
            <p className="mt-3 border-t border-brand-umber/10 pt-3 font-display text-sm italic text-brand-charcoal/60">
              Fig. 1 — {product.material_spec}. {product.plating_spec}.
            </p>
            <TrustBadges className="mt-5" />
          </div>

          {/* Copy column */}
          <div className="animate-rise" style={{ animationDelay: "120ms" }}>
            <p className="font-body text-xs font-bold uppercase tracking-[0.3em] text-brand-umber">
              {product.category?.name ?? "1720"} · No. {plateNumber}
            </p>
            <h1 className="mt-3 font-display text-[2.75rem] font-semibold leading-[0.95] text-brand-umber-dark sm:text-6xl">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="inline-block rounded-sm border-2 border-brand-umber-dark bg-brand-ivory px-3 py-1.5 font-body text-lg font-bold text-brand-umber-dark shadow-retro-sm">
                {formatPKR(product.price)}
              </span>
              <StockIndicator stock={product.stock_count} />
              <WishlistButton product={product} className="ml-auto border border-brand-umber/15" />
            </div>

            <blockquote className="relative mt-8 border-l-4 border-brand-sky pl-5">
              <span aria-hidden="true" className="absolute -left-1.5 -top-5 font-display text-6xl text-brand-sky/40">
                “
              </span>
              <p className="font-display text-xl italic leading-snug text-brand-umber-dark sm:text-2xl">
                {getProductTagline(product.slug)}
              </p>
            </blockquote>

            <p className="drop-cap mt-7 font-body text-base leading-relaxed text-brand-charcoal/85">
              {product.description}
            </p>

            <AddToCartForm product={product} />

            <div className="mt-8 rounded-lg border border-brand-umber/15 p-5">
              <ProductFeatures product={product} />
            </div>

            <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-1 border-t border-brand-umber/10 pt-4 font-body text-[11px] uppercase tracking-wide text-brand-charcoal/50">
              <div className="flex gap-1.5">
                <dt>Ref.</dt>
                <dd>{product.sku}</dd>
              </div>
              {product.ring_size_range && (
                <div className="flex gap-1.5">
                  <dt>Sizes</dt>
                  <dd>
                    {product.ring_size_range} —{" "}
                    <Link href="/sizing-guide" className="underline">
                      guide
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <RevealOnScroll>
          <section className="container-page mt-20">
            <div className="flex items-end justify-between gap-4 border-b border-brand-umber/15 pb-3">
              <h2 className="font-display text-3xl font-semibold text-brand-umber-dark">The Edit</h2>
              <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-charcoal/50">
                Continued, No. {plateNumber}
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((p, i) => (
                <div key={p.id}>
                  <ProductCard product={p} />
                  <p className="mt-1.5 font-body text-[10px] uppercase tracking-widest text-brand-charcoal/40">
                    Fig. {i + 2}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </RevealOnScroll>
      )}

      <div className="container-page">
        <ReviewsSection productId={product.id} reviews={reviews} />
        <RecentlyViewedSection excludeProductId={product.id} />
      </div>

      <StickyMobileCTA label={`Add to cart — ${formatPKR(product.price)}`} href="#add-to-cart" />
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </div>
  );
}
