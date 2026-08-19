"use client";

import Link from "next/link";
import { useState } from "react";
import { Wordmark } from "@/components/brand/Logo";
import { CartIconButton } from "@/components/layout/CartIconButton";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CATEGORIES } from "@/lib/brand";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  ...CATEGORIES.map((c) => ({ href: `/shop?category=${c.slug}`, label: c.label })),
  { href: "/about", label: "About" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-umber/10 bg-brand-ivory/95 backdrop-blur supports-[backdrop-filter]:bg-brand-ivory/80">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="7teen2wenty home" onClick={() => setMenuOpen(false)}>
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-6 font-body text-sm md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-brand-charcoal transition hover:text-brand-umber"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <WhatsAppButton className="hidden sm:inline-flex" label="WhatsApp" />
          <CartIconButton />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-brand-umber-dark md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-brand-umber/10 bg-brand-ivory md:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-2 text-brand-charcoal hover:bg-brand-sky-light"
              >
                {link.label}
              </Link>
            ))}
            <WhatsAppButton className="mt-2 w-fit sm:hidden" label="Chat on WhatsApp" />
          </div>
        </nav>
      )}
    </header>
  );
}
