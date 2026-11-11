import Link from "next/link";
import type { Metadata } from "next";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { ScallopDivider } from "@/components/layout/ScallopDivider";
import { HeroMark } from "@/components/brand/HeroMark";
import { CATEGORIES, COLLECTION_INTRO_BODY, COLLECTION_INTRO_HEADING, HERO_HEADLINE, HERO_SUBHEAD, TAGLINE, WHY_1720 } from "@/lib/brand";
import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import Image from "next/image";
import type { Product } from "@/lib/types";

// Re-render at most once a minute so stock and new pieces stay current without a redeploy.
export const revalidate = 60;

// Matches the `ivory` and `butter` tokens in tailwind.config.ts — kept as
// literal hex here because the scalloped divider needs real color values to
// punch its bumps, not a Tailwind class.
const BAND_IVORY = "#FDF2DC";
const BAND_BUTTER = "#FAE3B1";
const BAND_UMBER_DARK = "#482A24";

const SALE_PERKS = ["Up to 10% off every piece", "Free delivery across Pakistan", "Cash on Delivery"] as const;

export const metadata: Metadata = {
  title: "Modern-Retro Jewelry for a Taste of Your Own",
  description:
    "Modern-retro demi-fine jewelry in 316L stainless steel with real PVD gold plating. Distinctive, not excessive — priced for everyday wear, shipped Cash on Delivery across Pakistan.",
  alternates: { canonical: "/" },
};

const CATEGORY_TILE_COLORS: Record<string, string> = {
  earrings: "bg-brand-sky/10 border-brand-sky",
  rings: "bg-brand-butter-light border-brand-butter",
  bracelets: "bg-brand-sky/10 border-brand-sky",
  necklaces: "bg-brand-butter-light border-brand-butter",
};

// The signature piece pinned in the hero; also the link-preview image.
const HERO_PRODUCT_SLUG = "green-olive-hoops";

// Scattered-polaroid mood board between "Why 1720?" and the collection grid —
// alternating rotation/offset per card gives the loose, tossed-on-a-table feel.
const MOOD_BOARD = [
  { src: "/brand/mood-payphone.jpg", rotate: "rotate-[-4deg]", shift: "sm:mt-4" },
  { src: "/brand/mood-chairs-bags.jpg", rotate: "rotate-[3deg]", shift: "sm:-mt-2" },
  { src: "/brand/mood-trinkets.jpg", rotate: "rotate-[-2deg]", shift: "sm:mt-6" },
  { src: "/brand/mood-denim-accessories.jpg", rotate: "rotate-[5deg]", shift: "sm:mt-0" },
] as const;

const categoryOf = (p: Product) => p.category?.slug ?? p.category_id;

export default async function HomePage() {
  const products = await getProducts();
  const newArrivals = products.filter((p) => p.is_new).slice(0, 4);
  const featured = products.find((p) => p.slug === HERO_PRODUCT_SLUG) ?? products[0];
  const saving = (p: Product) => (p.compare_at_price && p.compare_at_price > p.price ? p.compare_at_price - p.price : 0);
  const weddingPicks = products
    .filter((p) => saving(p) > 0 && p.stock_count > 0)
    .sort((a, b) => saving(b) - saving(a))
    .slice(0, 4);
  const onSale = weddingPicks.length > 0;

  return (
    <>
      {onSale && (
        <Link href="/shop" className="block bg-brand-blush py-2.5 text-center transition hover:brightness-110">
          <p className="container-page font-body text-xs font-bold uppercase tracking-wider text-brand-ivory sm:text-sm">
            Wedding Season Sale · Up to 10% off · Free delivery across Pakistan{" "}
            <span className="underline underline-offset-2">Shop now</span>
          </p>
        </Link>
      )}

      <section className="bg-brand-ivory">
        <div className="container-page grid gap-8 py-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:py-16">
          <div>
            {onSale && (
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-brand-umber-dark bg-brand-butter px-4 py-1.5 font-body text-xs font-bold uppercase tracking-widest text-brand-umber-dark shadow-retro-sm sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-brand-blush" aria-hidden="true" />
                Wedding Season Sale · Up to 10% off
              </p>
            )}
            <p className="font-body text-base font-bold uppercase tracking-widest text-brand-umber">
              Demi-fine · Modern retro
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-brand-umber-dark sm:text-6xl lg:text-7xl">
              {HERO_HEADLINE.split(". ").map((line, i, arr) => (
                <span key={line} className="block">
                  {line}
                  {i < arr.length - 1 ? "." : ""}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-md font-body text-lg text-brand-charcoal">{HERO_SUBHEAD}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="shadow-retro inline-flex items-center justify-center rounded-full bg-brand-umber px-9 py-4 font-body text-base font-bold text-brand-ivory transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#482a24] active:translate-y-0 active:shadow-none"
              >
                {onSale ? "Shop the Wedding Sale" : "Explore the World of 1720"}
              </Link>
              <Link
                href="/shop?new=true"
                className="inline-flex items-center justify-center rounded-full border-2 border-brand-umber-dark px-9 py-4 font-body text-base font-bold text-brand-umber-dark transition hover:bg-brand-ivory"
              >
                Discover the Collection
              </Link>
            </div>
          </div>
          <HeroMark featured={featured} saleBadge={onSale ? "10%" : undefined} />
        </div>
      </section>

      {onSale ? (
        <>
          <ScallopDivider fromColor={BAND_IVORY} toColor={BAND_UMBER_DARK} />
          <section aria-label="Wedding Season Sale" className="bg-brand-umber-dark">
            <div className="container-page py-14 sm:py-16">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="font-body text-sm font-bold uppercase tracking-[0.3em] text-brand-butter">
                    The Wedding Season Edit
                  </p>
                  <h2 className="mt-3 max-w-xl font-display text-4xl font-bold leading-tight text-brand-ivory sm:text-5xl">
                    For every dholki, mehndi <span className="italic">&amp;</span> baraat.
                  </h2>
                  <p className="mt-3 max-w-md font-body text-base text-brand-ivory/80">
                    Gold that lasts the whole season. Sale prices are already applied, no code needed.
                  </p>
                </div>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full bg-brand-blush px-8 py-3.5 font-body text-base font-bold text-brand-ivory shadow-[4px_4px_0_0_#FAE3B1] transition hover:-translate-y-0.5"
                >
                  Shop all sale pieces
                </Link>
              </div>
              <ul className="mt-7 flex flex-wrap gap-3">
                {SALE_PERKS.map((perk) => (
                  <li
                    key={perk}
                    className="rounded-full border border-brand-butter/50 px-4 py-1.5 font-body text-sm font-semibold text-brand-butter"
                  >
                    {perk}
                  </li>
                ))}
              </ul>
              <div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {weddingPicks.map((product, i) => (
                  <div
                    key={product.id}
                    className="animate-rise rounded-2xl bg-brand-ivory p-3"
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </section>
          <ScallopDivider fromColor={BAND_UMBER_DARK} toColor={BAND_BUTTER} />
        </>
      ) : (
        <ScallopDivider fromColor={BAND_IVORY} toColor={BAND_BUTTER} />
      )}

      <section aria-label="Why 1720" className="bg-brand-butter">
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
            {TAGLINE} Cash on Delivery across Pakistan.
          </p>
        </div>
      </section>

      <ScallopDivider fromColor={BAND_BUTTER} toColor={BAND_IVORY} />

      <section aria-hidden="true" className="bg-brand-ivory">
        <div className="container-page py-14 sm:py-20">
          <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-10 sm:gap-x-6">
            {MOOD_BOARD.map((item) => (
              <div
                key={item.src}
                className={`w-[42%] min-w-[150px] max-w-[220px] border-2 border-brand-umber-dark bg-white p-2.5 shadow-retro-sm transition duration-300 hover:z-10 hover:rotate-0 hover:shadow-retro sm:p-3 ${item.rotate} ${item.shift}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src={item.src} alt="" fill sizes="220px" className="object-cover" />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center font-display text-base italic text-brand-umber-dark sm:text-lg">
            Some things never go out of style.
          </p>
        </div>
      </section>

      <section className="bg-brand-ivory">
        <div className="container-page py-16">
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
            {CATEGORIES.map((c, i) => {
              const cover = products.find((p) => categoryOf(p) === c.slug);
              return cover ? (
                <Link
                  key={c.slug}
                  href={`/shop?category=${c.slug}`}
                  className="animate-rise group relative block aspect-square overflow-hidden rounded-3xl border-2 border-brand-umber-dark bg-white shadow-retro-sm transition hover:-translate-y-1 hover:shadow-[5px_5px_0_0_#482a24]"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <Image
                    src={cover.images[0]}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 25vw, 50vw"
                    className="object-contain transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-3 bottom-3 rounded-full border border-brand-umber-dark/20 bg-brand-ivory/95 py-2 text-center font-body text-sm font-bold text-brand-umber-dark">
                    {c.label}
                  </span>
                </Link>
              ) : (
                <Link
                  key={c.slug}
                  href={`/shop?category=${c.slug}`}
                  className={`animate-rise flex aspect-square flex-col items-center justify-center gap-1 overflow-hidden rounded-3xl border-2 border-dashed ${CATEGORY_TILE_COLORS[c.slug]} font-body text-base font-bold text-brand-umber-dark/70 transition hover:-translate-y-1`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  {c.label}
                  <span className="font-display text-sm font-normal italic">Coming soon</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {newArrivals.length > 0 && (
        <>
          <ScallopDivider fromColor={BAND_IVORY} toColor={BAND_BUTTER} />
          <section className="bg-brand-butter">
            <div className="container-page py-16">
              <div className="flex items-end justify-between">
                <h2 className="font-display text-2xl font-semibold text-brand-umber-dark sm:text-3xl">
                  New arrivals
                </h2>
                <Link href="/shop?new=true" className="font-body text-sm font-semibold text-brand-umber hover:underline">
                  View all
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {newArrivals.map((product, i) => (
                  <div key={product.id} className="animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </section>
          <ScallopDivider fromColor={BAND_BUTTER} toColor={BAND_IVORY} />
        </>
      )}

      <StickyMobileCTA label={onSale ? "Shop the Wedding Sale" : "Explore the World of 1720"} href="/shop" />
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </>
  );
}

function TrustItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-brand-sky/30 bg-brand-ivory p-5">
      <h3 className="font-body text-sm font-semibold text-brand-umber-dark">{title}</h3>
      <p className="mt-2 font-body text-sm text-brand-charcoal">{body}</p>
    </div>
  );
}
