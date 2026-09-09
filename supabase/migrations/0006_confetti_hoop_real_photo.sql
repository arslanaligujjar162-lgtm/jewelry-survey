-- Updates the Confetti Hoop listing (1720-EAR-001) with its real price,
-- stock count, and actual product photo, replacing the placeholder SVG.
update products
set
  price = 2200,
  stock_count = 20,
  images = ARRAY['/products/confetti-hoop-1.png', '/products/confetti-hoop-2.svg']
where sku = '1720-EAR-001';
