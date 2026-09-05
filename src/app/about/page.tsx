import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_STORY_PARAGRAPHS, MANTRA } from "@/lib/brand";

export const metadata: Metadata = {
  title: "We Have a Taste of Our Own",
  description:
    "Why 1720 exists: modern-retro demi-fine jewellery in 316L stainless steel with PVD gold plating, for women who choose pieces because they feel like them — not to complete them.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const [opening, ...rest] = BRAND_STORY_PARAGRAPHS;

  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="font-body text-base font-bold uppercase tracking-widest text-brand-umber">About</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] text-brand-umber-dark sm:text-5xl">
          We have a taste of our own.
        </h1>

        <div className="mt-8 space-y-5 font-body text-base leading-relaxed text-brand-charcoal/85">
          <p>{opening}</p>
        </div>

        <blockquote className="my-12 border-l-2 border-brand-umber/25 pl-6 sm:pl-8">
          <p className="font-display text-2xl font-semibold leading-snug text-brand-umber-dark sm:text-3xl">
            {MANTRA}
          </p>
          <div className="mt-4 flex gap-2" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-brass/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-brand-brass/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-brand-brass/60" />
          </div>
        </blockquote>

        <div className="space-y-5 font-body text-base leading-relaxed text-brand-charcoal/85">
          {rest.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full shadow-retro-sm bg-brand-umber px-8 py-4 font-body text-base font-bold text-brand-ivory transition hover:-translate-y-0.5 hover:bg-brand-umber-dark hover:shadow-[5px_5px_0_0_#482a24] active:translate-y-0 active:shadow-none"
          >
            Explore 1720
          </Link>
          <Link
            href="/care-guide"
            className="inline-flex items-center justify-center rounded-full border-2 border-brand-umber-dark px-8 py-4 font-body text-base font-bold text-brand-umber-dark transition hover:bg-brand-sky/10"
          >
            Read the care guide
          </Link>
        </div>
      </div>
    </div>
  );
}
