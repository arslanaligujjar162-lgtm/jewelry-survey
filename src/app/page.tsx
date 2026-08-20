import Link from "next/link";
import type { Metadata } from "next";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { HeroMark } from "@/components/brand/HeroMark";
import { CATEGORIES, NORTH_STAR_LINE, TAGLINE } from "@/lib/brand";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = {
  title: "Demi-Fine PVD Jewellery for Everyday Yes",
  description:
    "Modern retro demi-fine jewellery in 316L stainless steel with real PVD gold plating. Transparent pricing, Cash on Delivery across Pakistan.",
  alternates: { canonical: "/" },
};

const CATEGORY_TILE_COLORS: Record<string, string> = {
  earrings: "bg-brand-sky-light",
  rings: "bg-brand-butter-light",
  bracelets: "bg-brand-sky-light",
  necklaces: "bg-brand-butter-light",
};

export default async function HomePage() {
  const newArrivals = (await getProducts({ isNew: true })).slice(0, 4);

  return (
    <>
      <section className="border-b border-brand-umber/10 bg-brand-sky-light">
        <div className="container-page grid gap-8 py-14 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="font-body text-sm font-semibold uppercase tracking-widest text-brand-umber">
              Demi-fine. Modern retro. Made to last.
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-brand-umber-dark sm:text-5xl lg:text-6xl">
              {NORTH_STAR_LINE}
            </h1>
            <p className="mt-5 max-w-md font-body text-base text-brand-charcoal/80">{TAGLINE}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-brand-umber px-7 py-3 font-body text-sm font-semibold text-brand-ivory transition hover:bg-brand-umber-dark"
              >
                Shop the collection
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-brand-umber/30 px-7 py-3 font-body text-sm font-semibold text-brand-umber-dark transition hover:bg-brand-ivory"
              >
                Our story
              </Link>
            </div>
          </div>
          <HeroMark />
        </div>
      </section>

      <section aria-label="Why 7teen2wenty" className="border-b border-brand-umber/10 bg-brand-ivory">
        <div className="container-page grid gap-6 py-10 sm:grid-cols-3">
          <TrustItem
            title="Transparent pricing"
            body="No inflated tags, no fake discounts. The price on the page is the price you pay."
          />
          <TrustItem
            title="Real PVD gold plating"
            body="316L stainless steel base with PVD coating — built to resist everyday wear, sweat, and water."
          />
          <TrustItem title="Cash on Delivery" body="Available across Pakistan. Pay when your order arrives." />
        </div>
      </section>

      <section className="container-page py-14">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-brand-umber-dark sm:text-3xl">Shop by category</h2>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className={`flex aspect-square flex-col items-center justify-center rounded-2xl ${CATEGORY_TILE_COLORS[c.slug]} font-body text-sm font-semibold text-brand-umber-dark transition hover:opacity-90`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="container-page py-14">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold text-brand-umber-dark sm:text-3xl">New arrivals</h2>
            <Link href="/shop?new=true" className="font-body text-sm font-medium text-brand-umber hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <StickyMobileCTA label="Shop the collection" href="/shop" />
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </>
  );
}

function TrustItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-brand-umber/10 p-5">
      <h3 className="font-body text-sm font-semibold text-brand-umber-dark">{title}</h3>
      <p className="mt-2 font-body text-sm text-brand-charcoal/75">{body}</p>
    </div>
  );
}
