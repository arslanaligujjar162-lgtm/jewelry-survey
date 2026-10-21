-- Removes the 4 remaining demo-placeholder products that never got real
-- photos or pricing: Dewdrop Ring, Confetti Band, Sculpt Ring, Vine Bangle.
-- The owner's finalized pricing sheet only covers 22 products, and asked
-- for every product not on it to be removed rather than left on
-- placeholder images.
--
-- Safe on a live database: no product FK from orders/return_requests (they
-- keep their own JSON snapshot), so past orders are unaffected. Any reviews
-- on these products cascade-delete with them.
delete from products where sku in (
  '1720-RNG-002', -- Dewdrop Ring
  '1720-RNG-003', -- Confetti Band
  '1720-RNG-006', -- Sculpt Ring
  '1720-BRC-006'  -- Vine Bangle
);
