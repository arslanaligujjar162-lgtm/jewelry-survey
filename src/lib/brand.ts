export const BRAND_NAME = "7teen2wenty";
export const BRAND_MARK = "1720";
export const TAGLINE = "Not fast. Not a fortune. Just good jewellery.";
export const NORTH_STAR_LINE = "She didn't need a reason. She just said yes.";
export const AESTHETIC = "Modern retro";

export const BRAND_DESCRIPTION =
  "7teen2wenty is a modern Pakistani jewellery brand that celebrates the warmth of retro-era gold and gemstone design, while embracing durability, transparency, and everyday wearability. Working in 316L stainless steel with real PVD gold plating, it exists to give buyers pieces that feel like they already have a story — priced and built so saying yes to yourself doesn't need a justification. Not fast. Not a fortune. Just good jewellery.";

export const BRAND_STORY_PARAGRAPHS = [
  "There's a small hesitation before buying jewellery for yourself. Not about the money — about whether it's worth it.",
  "I used to feel that every time I saw something from retro times — the shapes, the warm colour, jewellery that felt like it already had a story attached. I'd talk myself out of it. Save it for later. Never quite get around to it.",
  "7teen2wenty is the yes I kept putting off.",
  "PVD-coated, built to hold up, priced so saying yes to yourself doesn't need a justification.",
  "Not fast fashion. Not a fortune. Just good jewellery — the kind you don't have to talk yourself into.",
];

// Placeholder contact details — flagged for real business info before launch.
export const CONTACT = {
  email: "hello@7teen2wenty.pk",
  whatsappNumber: "923001234567", // TODO: replace with real WhatsApp Business number before launch
  address: "Placeholder Address, Gulberg III, Lahore, Punjab, Pakistan", // TODO: confirm real business address before launch
  instagram: "https://instagram.com/7teen2wenty",
  facebook: "https://facebook.com/7teen2wenty",
};

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${CONTACT.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const CATEGORIES = [
  { slug: "earrings", label: "Earrings" },
  { slug: "rings", label: "Rings" },
  { slug: "bracelets", label: "Bracelets" },
  { slug: "necklaces", label: "Necklaces" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];
