"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPKR } from "@/lib/format";

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function CartDrawer() {
  const { lines, removeLine, updateQuantity, subtotal, itemCount, drawerOpen, closeDrawer } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Keep the page behind the drawer from scrolling while it's open.
  useEffect(() => {
    if (!drawerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [drawerOpen]);

  // Move focus into the drawer on open, and hand it back on close.
  useEffect(() => {
    if (!drawerOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [drawerOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      if (e.key !== "Tab") return;

      // Trap focus inside the panel — an aria-modal dialog that lets Tab
      // wander into the page behind it isn't really modal.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [closeDrawer]
  );

  if (!drawerOpen) return null;

  return (
    // Above all fixed page chrome (header, cookie banner, sticky CTA, all of
    // which sit at z-50 or below) — a modal that something can cover isn't modal.
    <div className="fixed inset-0 z-[60] flex justify-end" onKeyDown={handleKeyDown}>
      <div
        className="absolute inset-0 bg-brand-charcoal/40"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="animate-slide-in relative flex h-full w-full max-w-md flex-col border-l-2 border-brand-umber bg-brand-ivory shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-brand-umber/15 px-5 py-4">
          <div>
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-brand-charcoal/60">Your bag</p>
            <p className="font-display text-xl font-semibold text-brand-umber-dark">
              {itemCount} {itemCount === 1 ? "piece" : "pieces"}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="rounded-full p-2 text-brand-umber-dark transition hover:bg-brand-sky/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="font-display text-lg italic text-brand-umber-dark">Nothing in your bag yet.</p>
            <Link
              href="/shop"
              onClick={closeDrawer}
              className="shadow-retro-sm mt-5 inline-flex items-center justify-center rounded-full bg-brand-umber px-6 py-3 font-body text-sm font-bold text-brand-ivory transition hover:-translate-y-0.5 hover:bg-brand-umber-dark"
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 py-4">
              {lines.map((line) => (
                <li
                  key={`${line.product_id}-${line.ring_size ?? ""}`}
                  className="flex gap-3 border-b border-brand-umber/10 py-4 first:pt-0"
                >
                  <Link
                    href={`/product/${line.slug}`}
                    onClick={closeDrawer}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-sky/10"
                  >
                    <Image
                      src={line.image}
                      alt={line.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-3">
                      <div>
                        <Link
                          href={`/product/${line.slug}`}
                          onClick={closeDrawer}
                          className="font-body text-sm font-medium text-brand-charcoal hover:text-brand-umber"
                        >
                          {line.name}
                        </Link>
                        {line.ring_size && (
                          <p className="mt-0.5 font-body text-xs text-brand-charcoal/60">Size US {line.ring_size}</p>
                        )}
                        <p className="mt-0.5 font-body text-sm font-semibold text-brand-umber-dark">
                          {formatPKR(line.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.product_id, line.ring_size)}
                        className="h-fit font-body text-xs text-brand-charcoal/50 underline hover:text-brand-error"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-2 flex w-fit items-center rounded-lg border border-brand-umber/20">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.product_id, line.quantity - 1, line.ring_size)}
                        className="px-2.5 py-1 font-body text-sm"
                        aria-label={`Decrease quantity of ${line.name}`}
                      >
                        −
                      </button>
                      <span className="px-2.5 font-body text-sm">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.product_id, line.quantity + 1, line.ring_size)}
                        className="px-2.5 py-1 font-body text-sm disabled:opacity-40"
                        aria-label={`Increase quantity of ${line.name}`}
                        disabled={line.quantity >= line.max_stock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t-2 border-brand-umber/20 px-5 py-4">
              <div className="flex justify-between font-body text-sm">
                <span className="text-brand-charcoal/70">Subtotal</span>
                <span className="font-semibold text-brand-charcoal">{formatPKR(subtotal)}</span>
              </div>
              <p className="mt-1 font-body text-xs text-brand-charcoal/60">
                Delivery calculated at checkout · Cash on Delivery available.
              </p>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="shadow-retro-sm mt-4 flex w-full items-center justify-center rounded-full bg-brand-umber py-3.5 font-body text-sm font-bold text-brand-ivory transition hover:-translate-y-0.5 hover:bg-brand-umber-dark"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeDrawer}
                className="mt-2 flex w-full items-center justify-center rounded-full border-2 border-brand-umber-dark py-3 font-body text-sm font-bold text-brand-umber-dark transition hover:bg-brand-sky/10"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
