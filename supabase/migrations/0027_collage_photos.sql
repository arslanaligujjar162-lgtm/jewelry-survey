-- Adds the designed collage as each product's 2nd photo. Full arrays are
-- written so the live order matches the site code exactly.

update products set images = array['/products/trinket-cuff-1.jpg', '/products/trinket-cuff-4.jpg', '/products/trinket-cuff-2.jpg', '/products/trinket-cuff-3.jpg'] where sku = '1720-EAR-012';
update products set images = array['/products/og-ring-1.jpg', '/products/og-ring-4.jpg', '/products/og-ring-3.jpg', '/products/og-ring-2.jpg'] where sku = '1720-RNG-008';
update products set images = array['/products/moon-drop-1.jpg', '/products/moon-drop-4.jpg', '/products/moon-drop-2.jpg', '/products/moon-drop-3.jpg'] where sku = '1720-EAR-002';
update products set images = array['/products/eclipse-drop-1.jpg', '/products/eclipse-drop-4.jpg', '/products/eclipse-drop-2.jpg', '/products/eclipse-drop-3.jpg'] where sku = '1720-EAR-011';
update products set images = array['/products/cascade-drop-1.jpg', '/products/cascade-drop-4.jpg', '/products/cascade-drop-2.jpg', '/products/cascade-drop-3.jpg'] where sku = '1720-EAR-005';
update products set images = array['/products/baroque-link-1.jpg', '/products/baroque-link-3.jpg', '/products/baroque-link-2.jpg'] where sku = '1720-EAR-014';
update products set images = array['/products/starlet-ring-1.jpg', '/products/starlet-ring-4.jpg', '/products/starlet-ring-2.jpg', '/products/starlet-ring-3.jpg'] where sku = '1720-RNG-004';
update products set images = array['/products/deco-link-1.jpg', '/products/deco-link-5.jpg', '/products/deco-link-4.jpg', '/products/deco-link-2.jpg', '/products/deco-link-3.jpg'] where sku = '1720-EAR-013';
update products set images = array['/products/mermaid-tear-1.jpg', '/products/mermaid-tear-4.jpg', '/products/mermaid-tear-2.jpg', '/products/mermaid-tear-3.jpg'] where sku = '1720-EAR-001';
update products set images = array['/products/confetti-studs-1.jpg', '/products/confetti-studs-4.jpg', '/products/confetti-studs-3.jpg', '/products/confetti-studs-2.jpg'] where sku = '1720-EAR-010';
