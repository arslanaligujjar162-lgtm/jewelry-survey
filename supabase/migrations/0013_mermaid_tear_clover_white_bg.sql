-- New purpose-shot white-background photos for Mermaid Tear and Clover
-- Pendant replace the content at images[1] (the old studio/tan-backdrop
-- shot moves to images[2]); the existing worn/lifestyle shot is kept as a
-- new third image. The file names at images[1] and images[2] are
-- unchanged on disk paths — only their content was swapped — so only the
-- new third image needs to be appended here.
update products set images = images || ARRAY['/products/mermaid-tear-3.jpg'] where sku = '1720-EAR-001';
update products set images = images || ARRAY['/products/clover-pendant-3.jpg'] where sku = '1720-NCK-001';
