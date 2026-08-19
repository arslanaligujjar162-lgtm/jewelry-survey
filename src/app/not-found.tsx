import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <LogoMark size={56} />
      <h1 className="mt-6 font-display text-3xl font-semibold text-brand-umber-dark sm:text-4xl">
        This page didn&apos;t make it to the collection.
      </h1>
      <p className="mt-3 max-w-md font-body text-base text-brand-charcoal/80">
        Not fast, not lost forever — just not here. Let&apos;s get you back to something good.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-brand-umber px-7 py-3 font-body text-sm font-semibold text-brand-ivory transition hover:bg-brand-umber-dark"
        >
          Back home
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-full border border-brand-umber/30 px-7 py-3 font-body text-sm font-semibold text-brand-umber-dark transition hover:bg-brand-sky-light"
        >
          Shop the collection
        </Link>
      </div>
    </div>
  );
}
