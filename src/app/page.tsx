import Link from "next/link";
import type { Metadata } from "next";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { HeroMark } from "@/components/brand/HeroMark";
import { CATEGORIES, MANTRA, TAGLINE, VISION_LINE } from "@/lib/brand";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = {
  title: "Demi-Fine PVD Jewellery for Everyday Yes",
  description:
    "Modern retro demi-fine jewellery in 316L stainless steel with real PVD gold plating. Transparent pricing, Cash on Delivery across Pakistan.",
  alternates: { canonical: "/" },
};

const CATEGORY_TILE_COLORS: Record<string, string> = {
  earrings: "bg-brand-sky",
  rings: "bg-brand-butter-light",
  bracelets: "bg-brand-sky",
  necklaces: "bg-brand-butter-light",
};

export default async function HomePage() {
  const newArrivals = (await getProducts({ isNew: true })).slice(0, 4);

  return (
    <>
      <section className="bg-grain border-b-2 border-brand-umber-dark/20 bg-brand-sky">
        <div className="container-page grid gap-8 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-32">
          <div>
            <p className="font-body text-base font-bold uppercase tracking-widest text-brand-umber-dark">
              Demi-fine · Modern retro
            </p>
            <h1 className="text-balance mt-4 font-display text-6xl font-bold leading-[0.95] tracking-tight text-brand-umber-dark sm:text-7xl lg:text-7xl">
              {MANTRA}
            </h1>
            <p className="mt-6 max-w-md font-body text-lg text-brand-charcoal/80">{VISION_LINE}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="shadow-retro inline-flex items-center justify-center rounded-full bg-brand-umber px-9 py-4 font-body text-base font-bold text-brand-ivory transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#482a24] active:translate-y-0 active:shadow-none"
              >
                Shop the collection
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border-2 border-brand-umber-dark px-9 py-4 font-body text-base font-bold text-brand-umber-dark transition hover:bg-brand-ivory"
              >
                Our story
              </Link>
            </div>
          </div>
          <HeroMark />
        </div>
      </section>

      <section aria-label="Why 7teen2wenty" className="border-b border-brand-umber/10 bg-brand-ivory">
        <div className="container-page py-12">
          <p className="font-display text-2xl font-bold text-brand-umber-dark sm:text-3xl">{TAGLINE}</p>
        </div>
        <div className="container-page grid gap-6 pb-10 sm:grid-cols-3">
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

      <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold text-brand-umber-dark sm:text-4xl">Shop by category</h2>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className={`shadow-retro-sm flex aspect-square flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-brand-umber-dark/15 ${CATEGORY_TILE_COLORS[c.slug]} ${c.slug === "earrings" || c.slug === "bracelets" ? "bg-grain" : ""} font-body text-base font-bold text-brand-umber-dark transition hover:-translate-y-1 hover:shadow-[5px_5px_0_0_#482a24]`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="container-page py-16">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold text-brand-umber-dark sm:text-4xl">New arrivals</h2>
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
