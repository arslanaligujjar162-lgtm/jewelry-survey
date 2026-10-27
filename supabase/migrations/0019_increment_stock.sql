-- RPC used when an order is cancelled, to give its reserved stock back.
create or replace function increment_stock(p_product_id uuid, p_quantity integer)
returns void as $$
begin
  update products
  set stock_count = stock_count + p_quantity
  where id = p_product_id;
end;
$$ language plpgsql security definer;
