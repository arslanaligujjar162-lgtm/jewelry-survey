-- Adds a third, model-worn lifestyle photo (previously sent but never applied)
-- to the 10 products where one was available, after the studio pair already
-- in images[1:2].
update products set images = images || ARRAY['/products/ribbon-hoop-3.jpg'] where sku = '1720-EAR-004';
update products set images = images || ARRAY['/products/green-olive-hoops-3.jpg'] where sku = '1720-EAR-009';
update products set images = images || ARRAY['/products/gala-studs-3.jpg'] where sku = '1720-EAR-008';
update products set images = images || ARRAY['/products/eclipse-drop-3.jpg'] where sku = '1720-EAR-011';
update products set images = images || ARRAY['/products/deco-link-3.jpg'] where sku = '1720-EAR-013';
update products set images = images || ARRAY['/products/cascade-drop-3.jpg'] where sku = '1720-EAR-005';
update products set images = images || ARRAY['/products/black-olive-hoops-3.jpg'] where sku = '1720-EAR-007';
update products set images = images || ARRAY['/products/vogue-hoop-3.jpg'] where sku = '1720-EAR-003';
update products set images = images || ARRAY['/products/trinket-cuff-3.jpg'] where sku = '1720-EAR-012';
update products set images = images || ARRAY['/products/moon-drop-3.jpg'] where sku = '1720-EAR-002';
