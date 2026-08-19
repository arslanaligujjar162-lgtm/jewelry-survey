// Generates flat-colour SVG placeholder product photography (solid matte
// backgrounds only, per brand photography rules) and the matching seed.sql
// insert statements. Run with: node scripts/generate-placeholders.mjs
// Replace these with real product photography before launch.
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const MATTE_BACKGROUNDS = ["#FBF7EE", "#F3E3A6", "#DDF0F7", "#EFE3D8"];

const products = [
  // Earrings
  { sku: "1720-EAR-001", name: "Sadaf Hoop Earrings", category: "earrings", price: 3200, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "Chunky retro hoops with a brushed finish. Everyday wear, hypoallergenic base." },
  { sku: "1720-EAR-002", name: "Noor Drop Earrings", category: "earrings", price: 3600, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "Teardrop silhouette with a warm, retro-gold tone. Secure butterfly backs." },
  { sku: "1720-EAR-003", name: "Meher Stud Earrings", category: "earrings", price: 2800, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated, cubic zirconia", desc: "Cubic zirconia studs set in a low-profile PVD gold setting. Easy to layer." },
  { sku: "1720-EAR-004", name: "Zara Chain Earrings", category: "earrings", price: 3400, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "Fine curb-chain drops that catch the light without being loud." },
  { sku: "1720-EAR-005", name: "Laila Huggie Earrings", category: "earrings", price: 2900, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "Close-fit huggies for a second or third piercing. Wear them and forget them." },
  // Rings
  { sku: "1720-RNG-001", name: "Amber Signet Ring", category: "rings", price: 3800, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A classic signet shape, flat top left blank. Runs true to size.", ring: "US 5-9" },
  { sku: "1720-RNG-002", name: "Rani Stone Ring", category: "rings", price: 4200, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated, cubic zirconia", desc: "A single round-cut cubic zirconia in a retro claw setting.", ring: "US 5-9" },
  { sku: "1720-RNG-003", name: "Yasmin Band Ring", category: "rings", price: 3200, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A simple, slightly domed band for stacking or wearing solo.", ring: "US 5-10" },
  { sku: "1720-RNG-004", name: "Dilnaz Twist Ring", category: "rings", price: 3600, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A twisted rope band, an old motif we kept because it still works.", ring: "US 5-9" },
  { sku: "1720-RNG-005", name: "Sana Layer Ring", category: "rings", price: 3400, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "Three fine bands fused into one ring, so it reads as a stack.", ring: "US 5-9" },
  // Bracelets
  { sku: "1720-BRC-001", name: "Farah Curb Chain Bracelet", category: "bracelets", price: 4400, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A substantial curb chain with a lobster clasp and 2in extender." },
  { sku: "1720-BRC-002", name: "Alina Bangle", category: "bracelets", price: 4800, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A solid, hinged bangle. Fits most wrists 14-18cm." },
  { sku: "1720-BRC-003", name: "Nashwa Charm Bracelet", category: "bracelets", price: 5200, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A fine chain bracelet with three retro-shaped charms attached." },
  { sku: "1720-BRC-004", name: "Rukhsar Cuff Bracelet", category: "bracelets", price: 5600, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "An open cuff with a brushed finish. One size, adjustable by hand." },
  { sku: "1720-BRC-005", name: "Mahnoor Tennis Bracelet", category: "bracelets", price: 6200, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated, cubic zirconia", desc: "A row of cubic zirconia stones in a low, everyday-wearable setting." },
  // Necklaces
  { sku: "1720-NCK-001", name: "Sana Chain Necklace", category: "necklaces", price: 4600, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "An 18in curb chain, the one piece that goes with everything." },
  { sku: "1720-NCK-002", name: "Roshni Pendant Necklace", category: "necklaces", price: 4900, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A coin-shaped pendant on a fine box chain, 16-18in adjustable." },
  { sku: "1720-NCK-003", name: "Bela Layered Necklace", category: "necklaces", price: 5800, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "Two chains of different weights, pre-layered so you don't have to." },
  { sku: "1720-NCK-004", name: "Anaya Choker", category: "necklaces", price: 4400, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A close-fit chain choker, 14in with a 2in extender." },
  { sku: "1720-NCK-005", name: "Meerab Coin Necklace", category: "necklaces", price: 5200, plating: "18k gold PVD coating over 316L stainless steel", material: "316L stainless steel, PVD gold plated", desc: "A textured coin pendant, the kind that looks like it has a history." },
];

const outDir = join(process.cwd(), "public", "products");
mkdirSync(outDir, { recursive: true });

function svgFor(name, sku, bg) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
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
