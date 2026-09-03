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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://7teen2wenty.pk";

interface ProductPageProps {
  params: { slug: string };
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

  const breadcrumbs = [
    { name: "Shop", url: `${siteUrl}/shop` },
    ...(product.category
      ? [{ name: product.category.name, url: `${siteUrl}/shop?category=${product.category.slug}` }]
      : []),
    { name: product.name, url: productUrl },
  ];

  return (
    <div className="container-page py-10 sm:py-14">
      <ProductSchema product={product} url={productUrl} reviews={reviews} />
      <BreadcrumbSchema items={breadcrumbs} />
      <RecentlyViewedTracker product={product} />

      <nav aria-label="Breadcrumb" className="font-body text-xs text-brand-charcoal/60">
        <Link href="/shop" className="hover:text-brand-umber">
          Shop
        </Link>
        {product.category && (
          <>
            {" / "}
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-brand-umber">
              {product.category.name}
            </Link>
          </>
        )}
        {" / "}
        <span>{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <ProductGallery images={product.images} productName={product.name} />
          <TrustBadges className="mt-4" />
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">{product.name}</h1>
            <WishlistButton product={product} className="shrink-0 border border-brand-umber/15" />
          </div>
          <p className="mt-2 font-body text-xl font-semibold text-brand-charcoal">{formatPKR(product.price)}</p>
          <div className="mt-2">
            <StockIndicator stock={product.stock_count} />
          </div>

          <p className="mt-5 font-body text-base leading-relaxed text-brand-charcoal/85">{product.description}</p>

          <AddToCartForm product={product} />

          <ProductFeatures product={product} />

          <dl className="mt-4 space-y-1.5 font-body text-xs text-brand-charcoal/60">
            <div className="flex gap-2">
              <dt>SKU</dt>
              <dd>{product.sku}</dd>
            </div>
            {product.ring_size_range && (
              <div className="flex gap-2">
                <dt>Sizes available</dt>
                <dd>
                  {product.ring_size_range} — see our{" "}
                  <Link href="/sizing-guide" className="text-brand-umber underline">
                    sizing guide
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold text-brand-umber-dark">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <ReviewsSection productId={product.id} reviews={reviews} />

      <RecentlyViewedSection excludeProductId={product.id} />

      <StickyMobileCTA label={`Add to cart — ${formatPKR(product.price)}`} href="#add-to-cart" />
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </div>
  );
}
