-- Adds back a second Clover Pendant photo (the on-neck proof shot), cropped
-- to remove the supplier's watermark/copyright stamp that ran along the
-- bottom of the original frame.
update products set
  images = array['/products/clover-pendant-1.jpg', '/products/clover-pendant-2.jpg']
where sku = '1720-NCK-001';
