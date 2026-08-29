export const BRAND_NAME = "7teen2wenty";
export const BRAND_MARK = "1720";
export const TAGLINE = "Not fast. Not a fortune. Just good jewellery.";
export const MANTRA = "Buy yourself the yes.";
export const VISION =
  "Jewellery for yourself shouldn't need a reason. 7teen2wenty exists so that saying yes — to something retro, something warm, something just for you — becomes ordinary in Pakistan, not an exception.";
export const VISION_LINE = "Jewellery for yourself shouldn't need a reason.";
export const AESTHETIC = "Modern retro";

export const BRAND_DESCRIPTION =
  "7teen2wenty makes demi-fine, modern retro jewellery — PVD-coated pieces built to hold up, priced for daily wear, sold direct to Pakistan through Instagram and COD. Not fast. Not a fortune. Just good jewellery.";

export const BRAND_STORY_PARAGRAPHS = [
  "There's a hesitation before buying jewellery for yourself. You don't think twice buying it for your mother, your sister, your daughter — but somehow it's harder to say yes when it's for you. Not about the money. About whether you're worth it.",
  "I used to feel that every time I saw something from retro times — the shapes, the warm colour, jewellery that felt like it already had a story attached. I'd talk myself out of it. Save it for later. Never quite get around to it.",
  "7teen2wenty is the yes I kept putting off.",
  "Not fast. Not a fortune. Just good jewellery — the kind you don't have to talk yourself into.",
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
