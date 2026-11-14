-- Adds a new 2nd photo to eight products. Full arrays are written so the
-- live order matches the site code exactly.

update products set images = array['/products/green-olive-hoops-1.jpg', '/products/green-olive-hoops-4.jpg', '/products/green-olive-hoops-2.jpg', '/products/green-olive-hoops-3.jpg'] where sku = '1720-EAR-009';
update products set images = array['/products/black-olive-hoops-1.jpg', '/products/black-olive-hoops-4.jpg', '/products/black-olive-hoops-2.jpg', '/products/black-olive-hoops-3.jpg'] where sku = '1720-EAR-007';
update products set images = array['/products/channel-bangle-1.jpg', '/products/channel-bangle-3.jpg', '/products/channel-bangle-2.jpg'] where sku = '1720-BRC-004';
update products set images = array['/products/confetti-bangle-1.jpg', '/products/confetti-bangle-3.jpg', '/products/confetti-bangle-2.jpg'] where sku = '1720-BRC-005';
update products set images = array['/products/deco-link-1.jpg', '/products/deco-link-4.jpg', '/products/deco-link-2.jpg', '/products/deco-link-3.jpg'] where sku = '1720-EAR-013';
update products set images = array['/products/ribbon-hoop-1.jpg', '/products/ribbon-hoop-4.jpg', '/products/ribbon-hoop-2.jpg', '/products/ribbon-hoop-3.jpg'] where sku = '1720-EAR-004';
update products set images = array['/products/og-ring-1.jpg', '/products/og-ring-3.jpg', '/products/og-ring-2.jpg'] where sku = '1720-RNG-008';
update products set images = array['/products/confetti-studs-1.jpg', '/products/confetti-studs-3.jpg', '/products/confetti-studs-2.jpg'] where sku = '1720-EAR-010';
