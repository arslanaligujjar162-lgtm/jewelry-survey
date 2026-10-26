-- The gateway's transaction reference for online-paid orders. Only written for
-- gateway orders, so cash-on-delivery checkout does not depend on this column.
alter table orders add column if not exists payment_reference text;
