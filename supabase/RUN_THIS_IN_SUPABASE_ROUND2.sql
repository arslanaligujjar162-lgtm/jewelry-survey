-- ============================================================
-- 1720 — round 2: real photos for ~20 more products + your
-- own pricing sheet. Run this ONCE in the Supabase SQL Editor,
-- after the first RUN_THIS_IN_SUPABASE.sql (which you already
-- ran). Paste the whole thing and press Run. Safe to re-run.
--
-- What it does:
--   * updates price/stock/photos for every product you priced
--   * Mermaid Tear and Vogue Hoop now have ONE real photo set
--     each (the old two-colourway guess is cleared)
--   * renames "Gala Stud" -> "Sunray Studs" and "Jet Hoop" ->
--     "Black Olive Hoops" (same pieces, your real names)
--   * moves Trinket Cuff, Deco Link, Baroque Link from
--     Bracelets to Earrings — your photos and pricing sheet
--     show these are earrings, not the bracelets they were
--     placeholder-seeded as
--   * adds 5 new products: The OG Ring, Gala Studs, Green
--     Olive Hoops, Confetti Studs, Eclipse Drop
--
-- Does NOT touch: Dewdrop Ring, Confetti Band, Sculpt Ring,
-- Vine Bangle — no photo/pricing for these yet, still on
-- placeholder images.
--
-- Safe on a live database: no deletes, only updates/inserts
-- keyed by SKU. Past orders keep their own snapshot either way.
-- ============================================================

begin;

-- ---------------------------------------------------------------------------
-- Earrings: existing products, new photos + your pricing
-- ---------------------------------------------------------------------------
update products set
  price = 3000,
  stock_count = 11,
  images = array['/products/mermaid-tear-1.jpg', '/products/mermaid-tear-2.jpg'],
  colour_options = null,
  description = 'A smooth teardrop dome scattered with flush-set crystals. Post backs.'
where sku = '1720-EAR-001';

update products set
  price = 2500,
  stock_count = 3
where sku = '1720-EAR-002';

update products set
  price = 2800,
  stock_count = 8,
  colour_options = null,
  description = 'An open oval hoop in high-polish tubing, tapered at the base. Post backs.',
  material_spec = '316L stainless steel, PVD gold plated'
where sku = '1720-EAR-003';

update products set
  price = 2000,
  stock_count = 11
where sku = '1720-EAR-004';

update products set
  price = 3000,
  stock_count = 11
where sku = '1720-EAR-005';

update products set
  name = 'Sunray Studs',
  slug = 'sunray-studs',
  price = 2000,
  stock_count = 4,
  images = array['/products/sunray-studs-1.jpg', '/products/sunray-studs-2.jpg']
where sku = '1720-EAR-006';

update products set
  name = 'Black Olive Hoops',
  slug = 'black-olive-hoops',
  price = 3000,
  stock_count = 7,
  images = array['/products/black-olive-hoops-1.jpg', '/products/black-olive-hoops-2.jpg']
where sku = '1720-EAR-007';

-- ---------------------------------------------------------------------------
-- Rings: existing products, new photos + your pricing
-- ---------------------------------------------------------------------------
update products set
  price = 2000,
  stock_count = 8,
  images = array['/products/hammered-band-1.jpg', '/products/hammered-band-2.jpg'],
  ring_size_range = null,
  description = 'A hand-hammered texture across an open, adjustable band.'
where sku = '1720-RNG-001';

update products set
  price = 3500,
  stock_count = 9,
  images = array['/products/starlet-ring-1.jpg', '/products/starlet-ring-2.jpg'],
  ring_size_range = 'US 6-7',
  description = 'A pear-cut cubic zirconia set deep in a wide, polished band.'
where sku = '1720-RNG-004';

update products set
  price = 2000,
  stock_count = 11,
  images = array['/products/studded-band-1.jpg']
where sku = '1720-RNG-005';

update products set
  price = 2300,
  stock_count = 8,
  images = array['/products/whisper-band-1.jpg', '/products/whisper-band-2.jpg'],
  ring_size_range = 'US 6-7',
  description = 'A polished, domed band scattered with small star-set cubic zirconia.'
where sku = '1720-RNG-007';

-- ---------------------------------------------------------------------------
-- Bracelets: existing products, new photos + your pricing
-- ---------------------------------------------------------------------------
update products set
  price = 2200,
  stock_count = 6,
  images = array['/products/channel-bangle-1.jpg', '/products/channel-bangle-2.jpg']
where sku = '1720-BRC-004';

update products set
  price = 3500,
  stock_count = 6,
  images = array['/products/confetti-bangle-1.jpg', '/products/confetti-bangle-2.jpg'],
  description = 'A textured, scattered-finish bangle set with multicolour stones, solid and hinged.'
where sku = '1720-BRC-005';

-- ---------------------------------------------------------------------------
-- Necklaces: existing products, new photos + your pricing
-- ---------------------------------------------------------------------------
update products set
  price = 2200,
  stock_count = 6,
  images = array['/products/clover-pendant-1.jpg'],
  description = 'Four-leaf clovers and pearls strung along a fine chain, 16-18in adjustable.',
  material_spec = '316L stainless steel, PVD gold plated, shell pearl'
where sku = '1720-NCK-001';

-- ---------------------------------------------------------------------------
-- Recategorize: seeded as placeholder bracelets, your photos and pricing
-- sheet confirm these are earrings
-- ---------------------------------------------------------------------------
update products set
  sku = '1720-EAR-012',
  category_id = (select id from categories where slug = 'earrings'),
  price = 2000,
  stock_count = 5,
  images = array['/products/trinket-cuff-1.jpg', '/products/trinket-cuff-2.jpg'],
  ring_size_range = null,
  description = 'A chunky bezel-set pear stone on an open ear cuff — no piercing needed, adjustable fit.'
where sku = '1720-BRC-001';

update products set
  sku = '1720-EAR-013',
  category_id = (select id from categories where slug = 'earrings'),
  price = 3000,
  stock_count = 11,
  images = array['/products/deco-link-1.jpg', '/products/deco-link-2.jpg'],
  ring_size_range = null,
  description = 'Two polished oval links drop from a high-polish stud post.'
where sku = '1720-BRC-002';

update products set
  sku = '1720-EAR-014',
  category_id = (select id from categories where slug = 'earrings'),
  price = 3000,
  stock_count = 11,
  images = array['/products/baroque-link-1.jpg', '/products/baroque-link-2.jpg'],
  ring_size_range = null,
  description = 'Two-tone oval links — bright silver-tone steel and gold — drop from a polished post.',
  material_spec = '316L stainless steel — PVD gold plated and bare polished steel'
where sku = '1720-BRC-003';

-- ---------------------------------------------------------------------------
-- New products
-- ---------------------------------------------------------------------------
insert into products
  (sku, name, slug, category_id, price, description, plating_spec, material_spec, images, stock_count, is_new, ring_size_range)
values
  (
    '1720-RNG-008', 'The OG Ring', 'og-ring',
    (select id from categories where slug = 'rings'),
    3000,
    'A wide polished band set with a single oversized pear-cut stone in a claw setting.',
    '18k gold PVD coating over 316L stainless steel',
    '316L stainless steel, PVD gold plated, cubic zirconia',
    array['/products/og-ring-1.jpg'],
    10, true, 'US 6-7'
  ),
  (
    '1720-EAR-008', 'Gala Studs', 'gala-studs',
    (select id from categories where slug = 'earrings'),
    2000,
    'Three slim bars — bright silver-tone steel and gold — curving together into a two-tone sculptural stud.',
    '18k gold PVD coating over 316L stainless steel',
    '316L stainless steel — PVD gold plated and bare polished steel',
    array['/products/gala-studs-1.jpg', '/products/gala-studs-2.jpg'],
    9, true, null
  ),
  (
    '1720-EAR-009', 'Green Olive Hoops', 'green-olive-hoops',
    (select id from categories where slug = 'earrings'),
    3000,
    'A chunky open hoop, half high-polish silver-tone steel and half glossy olive-green enamel. Post backs.',
    'Bare polished 316L stainless steel',
    '316L stainless steel, enamel',
    array['/products/green-olive-hoops-1.jpg', '/products/green-olive-hoops-2.jpg'],
    3, true, null
  ),
  (
    '1720-EAR-010', 'Confetti Studs', 'confetti-studs',
    (select id from categories where slug = 'earrings'),
    3000,
    'A domed teardrop stud set with a scatter of multicolour stones. Post backs.',
    '18k gold PVD coating over 316L stainless steel',
    '316L stainless steel, PVD gold plated, cubic zirconia',
    array['/products/confetti-studs-1.jpg', '/products/confetti-studs-2.jpg'],
    11, true, null
  ),
  (
    '1720-EAR-011', 'Eclipse Drop', 'eclipse-drop',
    (select id from categories where slug = 'earrings'),
    2500,
    'A round grey shell pearl suspended from a polished lever-back fitting.',
    '18k gold PVD coating over 316L stainless steel',
    '316L stainless steel, PVD gold plated, shell pearl',
    array['/products/eclipse-drop-1.jpg'],
    9, true, null
  )
on conflict (sku) do nothing;

commit;

-- Check it worked — should list 26 products:
-- select sku, name, price, stock_count from products order by sku;
