// Generates flat-colour SVG placeholder product photography (solid matte
// backgrounds only, per brand photography rules) and the matching seed.sql
// insert statements. Run with: node scripts/generate-placeholders.mjs
// Replace these with real product photography before launch.
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const MATTE_BACKGROUNDS = ["#FBF7EE", "#F3E3A6", "#DDF0F7", "#EFE3D8"];

const products = [
  // Earrings
  { sku: "1720-EAR-001", name: "Confetti Hoop", category: "earrings", price: 1974, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "Hoops with a scattered, mixed-texture finish along the band. Standard post-and-butterfly backs." },
  { sku: "1720-EAR-002", name: "Moon Drop", category: "earrings", price: 1728, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A crescent-shaped drop on a fine post. Light enough for all-day wear." },
  { sku: "1720-EAR-003", name: "Vogue Hoop", category: "earrings", price: 2402, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A wide, flat-profile hoop with a brushed finish. Secure hinge closure." },
  { sku: "1720-EAR-004", name: "Ribbon Hoop", category: "earrings", price: 1352, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A slim hoop with a twisted, ribbon-like silhouette. Everyday size, easy to sleep in." },
  { sku: "1720-EAR-005", name: "Cascade Drop", category: "earrings", price: 2076, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "Three graduated links falling from the post for movement without extra weight." },
  { sku: "1720-EAR-006", name: "Gala Stud", category: "earrings", price: 1612, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated, cubic zirconia", desc: "A cluster of cubic zirconia in a rounded stud setting. Secure push backs." },
  { sku: "1720-EAR-007", name: "Jet Hoop", category: "earrings", price: 2216, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A bold, chunky hoop with a matte-brushed texture. Hinge closure." },
  // Rings
  { sku: "1720-RNG-001", name: "Hammered Band", category: "rings", price: 1650, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A hand-hammered texture across a simple band. Runs true to size.", ring: "US 5-9" },
  { sku: "1720-RNG-002", name: "Dewdrop Ring", category: "rings", price: 2100, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated, cubic zirconia", desc: "A single round-cut cubic zirconia set low on a slim band, so it sits close to the finger.", ring: "US 5-9" },
  { sku: "1720-RNG-003", name: "Confetti Band", category: "rings", price: 2340, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A textured, scattered-finish band with a slight dome.", ring: "US 5-9" },
  { sku: "1720-RNG-004", name: "Starlet Ring", category: "rings", price: 1810, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated, cubic zirconia", desc: "A small star-cut cubic zirconia in a claw setting on a thin band.", ring: "US 5-9" },
  { sku: "1720-RNG-005", name: "Studded Band", category: "rings", price: 1652, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated, cubic zirconia", desc: "A row of small cubic zirconia set flush into a straight band.", ring: "US 5-9" },
  { sku: "1720-RNG-006", name: "Sculpt Ring", category: "rings", price: 1938, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "An asymmetric, sculpted band that reads as more than one ring stacked.", ring: "US 5-9" },
  { sku: "1720-RNG-007", name: "Whisper Band", category: "rings", price: 2476, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A fine, low-profile band built to layer under or over other rings.", ring: "US 5-10" },
  // Bracelets
  { sku: "1720-BRC-001", name: "Trinket Cuff", category: "bracelets", price: 1250, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "An open cuff with a brushed finish. One size, adjustable by hand." },
  { sku: "1720-BRC-002", name: "Deco Link", category: "bracelets", price: 1770, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "Rectangular links in a geometric, art-deco pattern. Lobster clasp with a 2in extender." },
  { sku: "1720-BRC-003", name: "Baroque Link", category: "bracelets", price: 1770, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "Ornate, curved links in a heavier chain. Lobster clasp with a 2in extender." },
  { sku: "1720-BRC-004", name: "Channel Bangle", category: "bracelets", price: 1770, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated, cubic zirconia", desc: "A row of cubic zirconia set into a channel along a solid, hinged bangle." },
  { sku: "1720-BRC-005", name: "Confetti Bangle", category: "bracelets", price: 3666, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A textured, scattered-finish bangle, solid and hinged." },
  { sku: "1720-BRC-006", name: "Vine Bangle", category: "bracelets", price: 1564, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A thin, twisting vine-textured bangle. Open style, one size." },
  // Necklaces
  { sku: "1720-NCK-001", name: "Clover Pendant", category: "necklaces", price: 1488, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A four-leaf clover pendant on a fine box chain, 16-18in adjustable." },
];

const outDir = join(process.cwd(), "public", "products");
mkdirSync(outDir, { recursive: true });

function svgFor(name, sku, bg) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <rect width="1200" height="1200" fill="${bg}"/>
  <text x="600" y="640" font-family="Georgia, serif" font-size="220" fill="#5C3A21" fill-opacity="0.28" text-anchor="middle">${initials}</text>
  <text x="600" y="1120" font-family="Arial, sans-serif" font-size="28" letter-spacing="4" fill="#5C3A21" fill-opacity="0.55" text-anchor="middle">${sku}</text>
</svg>`;
}

const seedRows = [];
const fallbackProducts = [];
let catCounter = {};

products.forEach((p, i) => {
  const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const bg1 = MATTE_BACKGROUNDS[i % MATTE_BACKGROUNDS.length];
  const bg2 = MATTE_BACKGROUNDS[(i + 1) % MATTE_BACKGROUNDS.length];
  const img1 = `/products/${slug}-1.svg`;
  const img2 = `/products/${slug}-2.svg`;
  writeFileSync(join(outDir, `${slug}-1.svg`), svgFor(p.name, p.sku, bg1));
  writeFileSync(join(outDir, `${slug}-2.svg`), svgFor(p.name, p.sku, bg2));

  const isNew = i % 5 < 2; // first two per category flagged "new"
  const stock = 4 + ((i * 7) % 20); // varied stock, some low for the low-stock indicator
  const ringSize = p.ring ? `'${p.ring}'` : "null";

  seedRows.push(
    `  ('${p.sku}', '${p.name.replace(/'/g, "''")}', '${slug}', (select id from categories where slug = '${p.category}'), ${p.price}, null, '${p.desc.replace(/'/g, "''")}', '${p.plating.replace(/'/g, "''")}', '${p.material.replace(/'/g, "''")}', ARRAY['${img1}','${img2}'], ${stock}, ${isNew}, ${ringSize})`
  );

  catCounter[p.category] = (catCounter[p.category] ?? 0) + 1;
  const idNum = String(i + 1).padStart(3, "0");
  fallbackProducts.push({
    id: `seed-${idNum}`,
    sku: p.sku,
    name: p.name,
    slug,
    category_id: p.category,
    price: p.price,
    compare_at_price: null,
    description: p.desc,
    plating_spec: p.plating,
    material_spec: p.material,
    images: [img1, img2],
    stock_count: stock,
    is_new: isNew,
    ring_size_range: p.ring ?? null,
    created_at: new Date(2026, 6, 1 + i).toISOString(),
  });
});

const categoriesMeta = [
  { id: "earrings", slug: "earrings", name: "Earrings", description: "Hoops, studs, and drops in PVD gold." },
  { id: "rings", slug: "rings", name: "Rings", description: "Signets, bands, and stone rings, true to size." },
  { id: "bracelets", slug: "bracelets", name: "Bracelets", description: "Chains, bangles, and cuffs built to hold up." },
  { id: "necklaces", slug: "necklaces", name: "Necklaces", description: "Chains and pendants for everyday layering." },
];

const tsOut = `// AUTO-GENERATED by scripts/generate-placeholders.mjs — do not edit by hand.
// Local fallback catalog used when Supabase env vars aren't configured yet,
// so the storefront is fully browsable before a database is wired up.
import type { Product, Category } from "@/lib/types";

export const FALLBACK_CATEGORIES: Category[] = ${JSON.stringify(categoriesMeta, null, 2)};

export const FALLBACK_PRODUCTS: Product[] = ${JSON.stringify(fallbackProducts, null, 2)};
`;

writeFileSync(join(process.cwd(), "src", "data", "seed-products.ts"), tsOut);

const sql = `-- Seed data: categories + placeholder catalog (replace imagery with real photography before launch)
insert into categories (slug, name, description) values
  ('earrings', 'Earrings', 'Hoops, studs, and drops in PVD gold.'),
  ('rings', 'Rings', 'Signets, bands, and stone rings, true to size.'),
  ('bracelets', 'Bracelets', 'Chains, bangles, and cuffs built to hold up.'),
  ('necklaces', 'Necklaces', 'Chains and pendants for everyday layering.')
on conflict (slug) do nothing;

insert into products (sku, name, slug, category_id, price, compare_at_price, description, plating_spec, material_spec, images, stock_count, is_new, ring_size_range) values
${seedRows.join(",\n")}
on conflict (sku) do nothing;

insert into promo_codes (code, discount_percent, active, expires_at) values
  ('WELCOME10', 10, true, null)
on conflict (code) do nothing;
`;

writeFileSync(join(process.cwd(), "supabase", "seed.sql"), sql);
console.log(`Wrote ${products.length * 2} placeholder images and supabase/seed.sql`);
