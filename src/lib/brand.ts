export const BRAND_NAME = "1720";
export const BRAND_MARK = "1720";
export const TAGLINE = "Not fast. Not a fortune. Just good jewellery.";
export const MANTRA = "Not to complete you. To express you.";
export const POSITIONING = "1720 is a modern-retro jewellery brand for women with a taste of their own.";
export const AESTHETIC = "Modern retro";

// The core brand idea — the single most prominent line on the site.
export const HERO_HEADLINE = MANTRA;
export const HERO_SUBHEAD = "Distinctive modern-retro jewellery for women who already know who they are.";

// The other hero option, kept for reuse elsewhere (e.g. secondary sections,
// meta copy) now that MANTRA has taken the primary hero slot.
export const COLLECTION_LINE = "Jewellery for a taste of your own.";

export const BRAND_DESCRIPTION =
  "1720 is a modern-retro jewellery brand for women with a taste of their own — demi-fine, PVD-coated pieces with character, sold direct to Pakistan through Instagram and COD. Not to complete you. To express you.";

// Opening line, then the pull-quote (MANTRA) is rendered separately, then
// these closing paragraphs — see the About page for the exact assembly.
export const BRAND_STORY_PARAGRAPHS = [
  "We believe the most personal pieces aren't necessarily the loudest. They're the ones that feel unmistakably yours.",
  "1720 was created around a simple idea: jewellery doesn't have to complete you. It can simply be something you chose because it feels like you.",
  "We are drawn to the shapes, colours and character of another era, but we don't want to recreate the past. We reinterpret it for now.",
  "The result is modern-retro jewellery for women with a taste of their own — selective, distinctive and made to be worn your way.",
];

export const WHY_1720 = [
  {
    title: "A Taste of Our Own",
    body: "We don't try to be everything for everyone. We curate a distinct modern-retro aesthetic.",
  },
  {
    title: "Designed With Character",
    body: "Pieces chosen for their form, detail and personality — not simply because they're trending.",
  },
  {
    title: "Made to Be Worn",
    body: "Distinctive enough to stand out. Versatile enough to become part of your everyday.",
  },
  {
    title: "Worth What You Pay For",
    body: "We focus on thoughtful materials, finishing and design at an accessible price.",
  },
] as const;

export const COLLECTION_INTRO_HEADING = "For the ones who choose differently.";
export const COLLECTION_INTRO_BODY =
  "A collection of modern-retro jewellery with character, designed for women who know what they like.";

export const QUALITY_HEADING = "See what you're actually buying.";
export const QUALITY_BODY =
  "We believe you shouldn't have to guess what arrives at your door. That's why we show our pieces as they are — clearly, closely and from different angles.";

export const SOCIAL_PROOF_HEADING = "Chosen by women with a taste of their own.";

export const NEWSLETTER_HEADING = "Come into the 1720 world.";
export const NEWSLETTER_SUBHEAD = "New pieces, stories, inspiration and first access — without the noise.";

export const FOOTER_CLOSING = "Not to complete you. To express you.";

// Address, email, and social handles are still placeholders — flagged for
// the real ones before launch. Renamed to the 1720 pattern for consistency,
// but the actual domain/handles need to be registered and confirmed.
export const CONTACT = {
  email: "hello@1720.pk", // TODO: confirm real domain before launch
  whatsappNumber: "923356389333",
  address: "Placeholder Address, Gulberg III, Lahore, Punjab, Pakistan", // TODO: confirm real business address before launch
  instagram: "https://instagram.com/1720", // TODO: confirm real handle before launch
  facebook: "https://facebook.com/1720", // TODO: confirm real handle before launch
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
