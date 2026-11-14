import type { Product } from "@/lib/types";

// Designed collages (captions, frames) read well as gallery shots but are too
// busy for a small landing-page tile.
const COLLAGES = new Set([
  "/products/trinket-cuff-4.jpg",
  "/products/og-ring-4.jpg",
  "/products/moon-drop-4.jpg",
  "/products/eclipse-drop-4.jpg",
  "/products/cascade-drop-4.jpg",
  "/products/baroque-link-3.jpg",
  "/products/starlet-ring-4.jpg",
  "/products/deco-link-5.jpg",
  "/products/mermaid-tear-4.jpg",
  "/products/confetti-studs-4.jpg",
]);

/** The styled photo shown for a product on the landing page, not the plain cut-out. */
export function landingImage(product: Product): string {
  return product.images.slice(1).find((src) => !COLLAGES.has(src)) ?? product.images[0];
}
