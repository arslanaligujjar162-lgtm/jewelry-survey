-- Wedding Season Sale: free nationwide delivery (handled in code, see
-- src/lib/serviceable-areas.ts) + Rs 200 folded into every product's price
-- + a 10%-off promo code advertised on the homepage banner.

update products set price = 3200 where sku = '1720-EAR-001';
update products set price = 2700 where sku = '1720-EAR-002';
update products set price = 3000 where sku = '1720-EAR-003';
update products set price = 2200 where sku = '1720-EAR-004';
update products set price = 3200 where sku = '1720-EAR-005';
update products set price = 2200 where sku = '1720-EAR-006';
update products set price = 3200 where sku = '1720-EAR-007';
update products set price = 2200 where sku = '1720-RNG-001';
update products set price = 3700 where sku = '1720-RNG-004';
update products set price = 2200 where sku = '1720-RNG-005';
update products set price = 2500 where sku = '1720-RNG-007';
update products set price = 2400 where sku = '1720-BRC-004';
update products set price = 3700 where sku = '1720-BRC-005';
update products set price = 2400 where sku = '1720-NCK-001';
update products set price = 3200 where sku = '1720-RNG-008';
update products set price = 2200 where sku = '1720-EAR-008';
update products set price = 3200 where sku = '1720-EAR-009';
update products set price = 3200 where sku = '1720-EAR-010';
update products set price = 2700 where sku = '1720-EAR-011';
update products set price = 2200 where sku = '1720-EAR-012';
update products set price = 3200 where sku = '1720-EAR-013';
update products set price = 3200 where sku = '1720-EAR-014';

insert into promo_codes (code, discount_percent, active, expires_at) values
  ('WEDDING10', 10, true, '2027-02-28')
on conflict (code) do update set discount_percent = excluded.discount_percent, active = excluded.active, expires_at = excluded.expires_at;
