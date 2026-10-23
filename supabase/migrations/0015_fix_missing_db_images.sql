-- Three products from the 0009 photo batch never got their full image set
-- pushed to the live database, even though the local fallback catalog
-- (seed-products.ts) has had the correct arrays all along. Traced against
-- every migration touching each sku; these are the only three found broken.

-- The OG Ring: 0009 inserted only the display photo, missing the
-- studio/iPhone shot entirely — no thumbnail gallery showed at all.
update products set images = array['/products/og-ring-1.jpg', '/products/og-ring-2.jpg'] where sku = '1720-RNG-008';

-- Studded Band: same gap — 0009 set only the display photo.
update products set images = array['/products/studded-band-1.jpg', '/products/studded-band-2.jpg'] where sku = '1720-RNG-005';

-- Eclipse Drop: 0009 set only the display photo, then 0012 appended the
-- worn/lifestyle photo on top of that 1-element array — landing the worn
-- shot in position 2 and dropping the studio/iPhone photo entirely.
update products set images = array['/products/eclipse-drop-1.jpg', '/products/eclipse-drop-2.jpg', '/products/eclipse-drop-3.jpg'] where sku = '1720-EAR-011';
