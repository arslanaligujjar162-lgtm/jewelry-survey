-- RPC used by the checkout flow to atomically decrement stock after an order is placed.
create or replace function decrement_stock(p_product_id uuid, p_quantity integer)
returns void as $$
begin
  update products
  set stock_count = greatest(stock_count - p_quantity, 0)
  where id = p_product_id;
end;
$$ language plpgsql security definer;
