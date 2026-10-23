-- Descriptions audited against each product's photo; these seven contradicted
-- what the photo shows (missing stones, wrong setting, wrong finish/shape).
update products set
  description = 'A wide, hand-hammered open band set with five bezel-set stones in ruby-pink and midnight blue. Adjustable.',
  material_spec = '316L stainless steel, PVD gold plated, cubic zirconia'
where sku = '1720-RNG-001';

update products set description = 'A slim band set with round cubic zirconia in bezels of alternating sizes, staggered around the band.' where sku = '1720-RNG-005';

update products set description = 'A smooth, polished bangle set with multicolour stones in round and eye-shaped cuts, solid and hinged.' where sku = '1720-BRC-005';

update products set description = 'A large pear-cut stone in a claw setting on a wide, open cuff — no piercing needed, adjustable fit.' where sku = '1720-EAR-012';

update products set description = 'A row of emerald-green cubic zirconia set into a channel along a solid, hinged bangle.' where sku = '1720-BRC-004';

update products set description = 'Three slim polished gold bars stacked into a single squared, sculptural stud. Secure push backs.' where sku = '1720-EAR-006';

update products set description = 'Three slim bars — bright silver-tone steel and gold — stacked into a two-tone squared, sculptural stud.' where sku = '1720-EAR-008';
