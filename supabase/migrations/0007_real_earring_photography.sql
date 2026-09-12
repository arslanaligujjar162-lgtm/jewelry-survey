-- Replaces the placeholder SVGs on all seven earring listings with the real
-- product photography, and rewrites each description and material spec to
-- match what is actually in the photographs (the placeholder copy described
-- brushed/matte/twisted finishes; every real piece is high-polish).
--
-- 1720-EAR-001 is also renamed: the piece previously listed as "Confetti Hoop"
-- is really the Mermaid Tear. Its slug changes with it, so the old
-- /product/confetti-hoop URL no longer resolves.

update products
set
  name = 'Mermaid Tear',
  slug = 'mermaid-tear',
  description = 'A smooth teardrop dome scattered with flush-set crystals. Post-and-butterfly backs. Shown in multicolour and clear crystal.',
  material_spec = '316L stainless steel, PVD gold plated, crystal',
  images = ARRAY['/products/mermaid-tear-1.jpg', '/products/mermaid-tear-2.jpg', '/products/mermaid-tear-3.jpg']
where sku = '1720-EAR-001';

update products
set
  description = 'A round shell pearl suspended from a polished lever-back fitting. Weighted enough to hang straight, light enough for all day.',
  material_spec = '316L stainless steel, PVD gold plated, shell pearl',
  images = ARRAY['/products/moon-drop-1.jpg', '/products/moon-drop-2.jpg']
where sku = '1720-EAR-002';

update products
set
  description = 'A squared-off hoop in high-polish tubing, open at the base. Post-and-butterfly backs. Shown in gold and bare steel.',
  material_spec = '316L stainless steel, PVD gold plated',
  images = ARRAY['/products/vogue-hoop-1.jpg', '/products/vogue-hoop-2.jpg']
where sku = '1720-EAR-003';

update products
set
  description = 'An open hoop that tapers from a fine post to a broad, rounded base. High-polish throughout. Everyday size.',
  material_spec = '316L stainless steel, PVD gold plated',
  images = ARRAY['/products/ribbon-hoop-1.jpg', '/products/ribbon-hoop-2.jpg']
where sku = '1720-EAR-004';

update products
set
  description = 'Three graduated crystals — round, pear and oval — bezel-set and falling from the post for movement without extra weight.',
  material_spec = '316L stainless steel, PVD gold plated, cubic zirconia',
  images = ARRAY['/products/cascade-drop-1.jpg', '/products/cascade-drop-2.jpg']
where sku = '1720-EAR-005';

update products
set
  description = 'Three slim polished bars curving together into a single sculptural stud. Secure push backs.',
  material_spec = '316L stainless steel, PVD gold plated',
  images = ARRAY['/products/gala-stud-1.jpg']
where sku = '1720-EAR-006';

update products
set
  description = 'A chunky open hoop, half high-polish gold and half glossy black enamel. Post-and-butterfly backs.',
  material_spec = '316L stainless steel, PVD gold plated, enamel',
  images = ARRAY['/products/jet-hoop-1.jpg', '/products/jet-hoop-2.jpg']
where sku = '1720-EAR-007';
