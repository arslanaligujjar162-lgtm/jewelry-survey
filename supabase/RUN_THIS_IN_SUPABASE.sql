-- ============================================================
-- 1720 — bring the live catalogue up to date
-- Run this ONCE in the Supabase SQL Editor. Paste the whole
-- thing and press Run. It replaces migrations 0005, 0006 and
-- 0007 — you do not need to run those separately.
--
-- What it does:
--   * replaces the demo catalogue with the real 21 products
--   * puts the real earring photography and copy in place
--   * renames "Confetti Hoop" to its real name, Mermaid Tear
--
-- Safe on a live database: orders keep their own snapshot of
-- what was bought, so past orders are unaffected. Any reviews
-- left on the old demo products are removed with them.
-- ============================================================

begin;

delete from products;

insert into products (sku, name, slug, category_id, price, compare_at_price, description, plating_spec, material_spec, images, stock_count, is_new, ring_size_range) values
  ('1720-EAR-001', 'Mermaid Tear', 'mermaid-tear', (select id from categories where slug = 'earrings'), 2200, null, 'A smooth teardrop dome scattered with flush-set crystals. Post-and-butterfly backs. Shown in multicolour and clear crystal.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated, crystal', ARRAY['/products/mermaid-tear-1.jpg','/products/mermaid-tear-2.jpg','/products/mermaid-tear-3.jpg'], 20, true, null),
  ('1720-EAR-002', 'Moon Drop', 'moon-drop', (select id from categories where slug = 'earrings'), 1728, null, 'A round shell pearl suspended from a polished lever-back fitting. Weighted enough to hang straight, light enough for all day.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated, shell pearl', ARRAY['/products/moon-drop-1.jpg','/products/moon-drop-2.jpg'], 11, true, null),
  ('1720-EAR-003', 'Vogue Hoop', 'vogue-hoop', (select id from categories where slug = 'earrings'), 2402, null, 'A squared-off hoop in high-polish tubing, open at the base. Post-and-butterfly backs. Shown in gold and bare steel.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/vogue-hoop-1.jpg','/products/vogue-hoop-2.jpg'], 18, false, null),
  ('1720-EAR-004', 'Ribbon Hoop', 'ribbon-hoop', (select id from categories where slug = 'earrings'), 1352, null, 'An open hoop that tapers from a fine post to a broad, rounded base. High-polish throughout. Everyday size.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/ribbon-hoop-1.jpg','/products/ribbon-hoop-2.jpg'], 5, false, null),
  ('1720-EAR-005', 'Cascade Drop', 'cascade-drop', (select id from categories where slug = 'earrings'), 2076, null, 'Three graduated crystals — round, pear and oval — bezel-set and falling from the post for movement without extra weight.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated, cubic zirconia', ARRAY['/products/cascade-drop-1.jpg','/products/cascade-drop-2.jpg'], 12, false, null),
  ('1720-EAR-006', 'Gala Stud', 'gala-stud', (select id from categories where slug = 'earrings'), 1612, null, 'Three slim polished bars curving together into a single sculptural stud. Secure push backs.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/gala-stud-1.jpg'], 19, true, null),
  ('1720-EAR-007', 'Jet Hoop', 'jet-hoop', (select id from categories where slug = 'earrings'), 2216, null, 'A chunky open hoop, half high-polish gold and half glossy black enamel. Post-and-butterfly backs.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated, enamel', ARRAY['/products/jet-hoop-1.jpg','/products/jet-hoop-2.jpg'], 6, true, null),
  ('1720-RNG-001', 'Hammered Band', 'hammered-band', (select id from categories where slug = 'rings'), 1650, null, 'A hand-hammered texture across a simple band. Runs true to size.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/hammered-band-1.svg','/products/hammered-band-2.svg'], 13, false, 'US 5-9'),
  ('1720-RNG-002', 'Dewdrop Ring', 'dewdrop-ring', (select id from categories where slug = 'rings'), 2100, null, 'A single round-cut cubic zirconia set low on a slim band, so it sits close to the finger.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated, cubic zirconia', ARRAY['/products/dewdrop-ring-1.svg','/products/dewdrop-ring-2.svg'], 20, false, 'US 5-9'),
  ('1720-RNG-003', 'Confetti Band', 'confetti-band', (select id from categories where slug = 'rings'), 2340, null, 'A textured, scattered-finish band with a slight dome.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/confetti-band-1.svg','/products/confetti-band-2.svg'], 7, false, 'US 5-9'),
  ('1720-RNG-004', 'Starlet Ring', 'starlet-ring', (select id from categories where slug = 'rings'), 1810, null, 'A small star-cut cubic zirconia in a claw setting on a thin band.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated, cubic zirconia', ARRAY['/products/starlet-ring-1.svg','/products/starlet-ring-2.svg'], 14, true, 'US 5-9'),
  ('1720-RNG-005', 'Studded Band', 'studded-band', (select id from categories where slug = 'rings'), 1652, null, 'A row of small cubic zirconia set flush into a straight band.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated, cubic zirconia', ARRAY['/products/studded-band-1.svg','/products/studded-band-2.svg'], 21, true, 'US 5-9'),
  ('1720-RNG-006', 'Sculpt Ring', 'sculpt-ring', (select id from categories where slug = 'rings'), 1938, null, 'An asymmetric, sculpted band that reads as more than one ring stacked.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/sculpt-ring-1.svg','/products/sculpt-ring-2.svg'], 8, false, 'US 5-9'),
  ('1720-RNG-007', 'Whisper Band', 'whisper-band', (select id from categories where slug = 'rings'), 2476, null, 'A fine, low-profile band built to layer under or over other rings.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/whisper-band-1.svg','/products/whisper-band-2.svg'], 15, false, 'US 5-10'),
  ('1720-BRC-001', 'Trinket Cuff', 'trinket-cuff', (select id from categories where slug = 'bracelets'), 1250, null, 'An open cuff with a brushed finish. One size, adjustable by hand.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/trinket-cuff-1.svg','/products/trinket-cuff-2.svg'], 22, false, null),
  ('1720-BRC-002', 'Deco Link', 'deco-link', (select id from categories where slug = 'bracelets'), 1770, null, 'Rectangular links in a geometric, art-deco pattern. Lobster clasp with a 2in extender.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/deco-link-1.svg','/products/deco-link-2.svg'], 9, true, null),
  ('1720-BRC-003', 'Baroque Link', 'baroque-link', (select id from categories where slug = 'bracelets'), 1770, null, 'Ornate, curved links in a heavier chain. Lobster clasp with a 2in extender.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/baroque-link-1.svg','/products/baroque-link-2.svg'], 16, true, null),
  ('1720-BRC-004', 'Channel Bangle', 'channel-bangle', (select id from categories where slug = 'bracelets'), 1770, null, 'A row of cubic zirconia set into a channel along a solid, hinged bangle.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated, cubic zirconia', ARRAY['/products/channel-bangle-1.svg','/products/channel-bangle-2.svg'], 23, false, null),
  ('1720-BRC-005', 'Confetti Bangle', 'confetti-bangle', (select id from categories where slug = 'bracelets'), 3666, null, 'A textured, scattered-finish bangle, solid and hinged.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/confetti-bangle-1.svg','/products/confetti-bangle-2.svg'], 10, false, null),
  ('1720-BRC-006', 'Vine Bangle', 'vine-bangle', (select id from categories where slug = 'bracelets'), 1564, null, 'A thin, twisting vine-textured bangle. Open style, one size.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/vine-bangle-1.svg','/products/vine-bangle-2.svg'], 17, false, null),
  ('1720-NCK-001', 'Clover Pendant', 'clover-pendant', (select id from categories where slug = 'necklaces'), 1488, null, 'A four-leaf clover pendant on a fine box chain, 16-18in adjustable.', '18k gold PVD coating over 316L stainless steel', '316L stainless steel, PVD gold plated', ARRAY['/products/clover-pendant-1.svg','/products/clover-pendant-2.svg'], 4, true, null)
on conflict (sku) do nothing;

commit;

-- Check it worked — should list 21 products, 7 of them earrings
-- with /products/*.jpg images:
-- select sku, name, slug, price, images from products order by sku;
