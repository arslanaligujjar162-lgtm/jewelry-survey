// Short character lines shown above each product's factual description on
// the product page — one sentence about what the piece feels like, not a
// generic "elevate your style" line. Keyed by product slug.
export const PRODUCT_TAGLINES: Record<string, string> = {
  "confetti-hoop": "A little playful. A little scattered. Completely 1720.",
  "moon-drop": "A little quiet. A little nocturnal. Completely 1720.",
  "vogue-hoop": "A little bold. A little unbothered. Completely 1720.",
  "ribbon-hoop": "A little twisted. A little playful. Completely 1720.",
  "cascade-drop": "A little movement. A little drama. Completely 1720.",
  "gala-stud": "A little sparkle. A little understated. Completely 1720.",
  "jet-hoop": "A little heavy. A little unapologetic. Completely 1720.",
  "hammered-band": "A little rough. A little raw. Completely 1720.",
  "dewdrop-ring": "A little delicate. A little quiet. Completely 1720.",
  "confetti-band": "A little scattered. A little celebratory. Completely 1720.",
  "starlet-ring": "A little sparkle. A little wink. Completely 1720.",
  "studded-band": "A little edge. A little shine. Completely 1720.",
  "sculpt-ring": "A little sculpted. A little stacked. Completely 1720.",
  "whisper-band": "A little quiet. A little constant. Completely 1720.",
  "trinket-cuff": "A little loose. A little easy. Completely 1720.",
  "deco-link": "A little geometric. A little deco. Completely 1720.",
  "baroque-link": "A little ornate. A little heavy-handed. Completely 1720.",
  "channel-bangle": "A little lined up. A little precise. Completely 1720.",
  "confetti-bangle": "A little scattered. A little loud. Completely 1720.",
  "vine-bangle": "A little winding. A little wild. Completely 1720.",
  "clover-pendant": "A little lucky. A little sentimental. Completely 1720.",
};

export const DEFAULT_PRODUCT_TAGLINE = "A little retro. A little unexpected. Completely 1720.";

export function getProductTagline(slug: string): string {
  return PRODUCT_TAGLINES[slug] ?? DEFAULT_PRODUCT_TAGLINE;
}
