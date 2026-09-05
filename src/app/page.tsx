import Link from "next/link";
import type { Metadata } from "next";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { HeroMark } from "@/components/brand/HeroMark";
import { CATEGORIES, COLLECTION_INTRO_BODY, COLLECTION_INTRO_HEADING, HERO_HEADLINE, HERO_SUBHEAD, TAGLINE, WHY_1720 } from "@/lib/brand";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = {
  title: "Modern-Retro Jewellery for a Taste of Your Own",
  description:
    "Modern-retro demi-fine jewellery in 316L stainless steel with real PVD gold plating. Distinctive, not excessive — priced for everyday wear, shipped Cash on Delivery across Pakistan.",
  alternates: { canonical: "/" },
};

const CATEGORY_TILE_COLORS: Record<string, string> = {
  earrings: "bg-brand-sky/10 border-brand-sky",
  rings: "bg-brand-butter-light border-brand-butter",
  bracelets: "bg-brand-sky/10 border-brand-sky",
  necklaces: "bg-brand-butter-light border-brand-butter",
};

export default async function HomePage() {
  const newArrivals = (await getProducts({ isNew: true })).slice(0, 4);

  return (
    <>
      <section className="border-b border-brand-umber/10 bg-brand-ivory">
        <div className="container-page grid gap-8 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-32">
          <div>
            <p className="font-body text-base font-bold uppercase tracking-widest text-brand-umber">
              Demi-fine · Modern retro
            </p>
            <h1 className="text-balance mt-4 font-display text-5xl font-bold leading-[1.05] tracking-tight text-brand-umber-dark sm:text-6xl lg:text-6xl">
              {HERO_HEADLINE}
            </h1>
            <p className="mt-6 max-w-md font-body text-lg text-brand-charcoal">{HERO_SUBHEAD}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="shadow-retro inline-flex items-center justify-center rounded-full bg-brand-umber px-9 py-4 font-body text-base font-bold text-brand-ivory transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#482a24] active:translate-y-0 active:shadow-none"
              >
                Explore 1720
              </Link>
              <Link
                href="/shop?new=true"
                className="inline-flex items-center justify-center rounded-full border-2 border-brand-umber-dark px-9 py-4 font-body text-base font-bold text-brand-umber-dark transition hover:bg-brand-ivory"
              >
                Discover the Collection
              </Link>
            </div>
          </div>
          <HeroMark />
        </div>
      </section>

      <section aria-label="Why 1720" className="border-b border-brand-umber/10 bg-brand-ivory">
        <div className="container-page py-12">
          <h2 className="font-display text-3xl font-bold text-brand-umber-dark sm:text-4xl">Why 1720?</h2>
        </div>
        <div className="container-page grid gap-6 pb-8 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_1720.map((item) => (
            <TrustItem key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
        <div className="container-page pb-10">
          <p className="font-body text-sm text-brand-charcoal/70">
            {TAGLINE} Cash on Delivery across Pakistan · 7-day returns.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="font-display text-3xl font-bold text-brand-umber-dark sm:text-4xl">
          {COLLECTION_INTRO_HEADING}
        </h2>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <p className="max-w-md font-body text-base text-brand-charcoal">{COLLECTION_INTRO_BODY}</p>
          <Link href="/shop" className="font-body text-sm font-semibold text-brand-umber hover:underline">
            Explore the Collection
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className={`shadow-retro-sm flex aspect-square flex-col items-center justify-center overflow-hidden rounded-3xl border-2 ${CATEGORY_TILE_COLORS[c.slug]} font-body text-base font-bold text-brand-umber-dark transition hover:-translate-y-1 hover:shadow-[5px_5px_0_0_#482a24]`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="container-page py-16">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold text-brand-umber-dark sm:text-3xl">New arrivals</h2>
            <Link href="/shop?new=true" className="font-body text-sm font-semibold text-brand-umber hover:underline">
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

      <StickyMobileCTA label="Explore 1720" href="/shop" />
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </>
  );
}

function TrustItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-brand-umber/10 p-5">
      <h3 className="font-body text-sm font-semibold text-brand-umber-dark">{title}</h3>
      <p className="mt-2 font-body text-sm text-brand-charcoal">{body}</p>
    </div>
  );
}
