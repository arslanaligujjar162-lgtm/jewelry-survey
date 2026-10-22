-- Drops "Hoops" from these two product names; slugs and images are unaffected.
update products set name = 'Black Olive' where sku = '1720-EAR-007';
update products set name = 'Green Olive' where sku = '1720-EAR-009';
