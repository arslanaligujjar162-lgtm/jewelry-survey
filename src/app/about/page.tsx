import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_STORY_PARAGRAPHS, TAGLINE } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Why 7teen2wenty exists: modern retro demi-fine jewellery in 316L stainless steel with PVD gold plating, priced so saying yes to yourself doesn't need a justification.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="font-body text-sm font-semibold uppercase tracking-widest text-brand-umber">Our story</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">{TAGLINE}</h1>

        <div className="mt-8 space-y-5 font-body text-base leading-relaxed text-brand-charcoal/85">
          {BRAND_STORY_PARAGRAPHS.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-brand-umber px-7 py-3 font-body text-sm font-semibold text-brand-ivory transition hover:bg-brand-umber-dark"
          >
            Shop the collection
          </Link>
          <Link
            href="/care-guide"
            className="inline-flex items-center justify-center rounded-full border border-brand-umber/30 px-7 py-3 font-body text-sm font-semibold text-brand-umber-dark transition hover:bg-brand-sky-light"
          >
            Read the care guide
          </Link>
        </div>
      </div>
    </div>
  );
}
