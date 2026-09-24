-- Colourways per product: an array of {"name", "image"}, where image is one
-- of the product's own photos. Null means the piece comes in one colour.
-- Stock stays per product, shared across its colours.
alter table products add column if not exists colour_options jsonb;

update products
set
  colour_options = '[{"name": "Multicolour", "image": "/products/mermaid-tear-1.jpg"}, {"name": "Clear crystal", "image": "/products/mermaid-tear-2.jpg"}]'::jsonb,
  description = 'A smooth teardrop dome scattered with flush-set crystals. Post-and-butterfly backs. In multicolour or clear crystal.'
where sku = '1720-EAR-001';

update products
set
  colour_options = '[{"name": "Gold", "image": "/products/vogue-hoop-1.jpg"}, {"name": "Steel", "image": "/products/vogue-hoop-2.jpg"}]'::jsonb,
  description = 'A squared-off hoop in high-polish tubing, open at the base. Post-and-butterfly backs. In gold or bare polished steel.',
  material_spec = '316L stainless steel — PVD gold plated, or bare polished steel'
where sku = '1720-EAR-003';
