-- Wedding Season Sale v2: bake the discount directly into displayed
-- prices (crossed-out compare_at_price + the new lower price), instead
-- of requiring the WEDDING10 promo code. Also retires that code so it
-- can't be stacked on top of the already-discounted price.

update products set price = 2650, compare_at_price = 2900 where sku = '1720-EAR-010';
update products set price = 2650, compare_at_price = 2900 where sku = '1720-EAR-001';
update products set price = 2400, compare_at_price = 2650 where sku = '1720-EAR-002';
update products set price = 2400, compare_at_price = 2650 where sku = '1720-EAR-011';
update products set price = 2700, compare_at_price = 3000 where sku = '1720-EAR-003';
update products set price = 1650, compare_at_price = 1800 where sku = '1720-EAR-012';
update products set price = 2500, compare_at_price = 2750 where sku = '1720-EAR-013';
update products set price = 2500, compare_at_price = 2750 where sku = '1720-EAR-014';
update products set price = 1900, compare_at_price = 2100 where sku = '1720-EAR-004';
update products set price = 2650, compare_at_price = 2900 where sku = '1720-EAR-005';
update products set price = 1950, compare_at_price = 2150 where sku = '1720-EAR-008';
update products set price = 1950, compare_at_price = 2150 where sku = '1720-EAR-006';
update products set price = 2650, compare_at_price = 2900 where sku = '1720-EAR-007';
update products set price = 2650, compare_at_price = 2900 where sku = '1720-EAR-009';
update products set price = 1700, compare_at_price = 1850 where sku = '1720-RNG-001';
update products set price = 2800, compare_at_price = 3100 where sku = '1720-RNG-008';
update products set price = 2850, compare_at_price = 3150 where sku = '1720-RNG-004';
update products set price = 2000, compare_at_price = 2200 where sku = '1720-RNG-005';
update products set price = 2250, compare_at_price = 2500 where sku = '1720-RNG-007';
update products set price = 2100, compare_at_price = 2300 where sku = '1720-BRC-004';
update products set price = 3400, compare_at_price = 3750 where sku = '1720-BRC-005';
update products set price = 2100, compare_at_price = 2300 where sku = '1720-NCK-001';

update promo_codes set active = false where code = 'WEDDING10';
