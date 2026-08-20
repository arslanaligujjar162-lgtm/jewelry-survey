-- Product reviews. Submitted publicly, held for admin approval before showing.
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_product_idx on reviews(product_id);
create index if not exists reviews_status_idx on reviews(status);

drop trigger if exists reviews_set_updated_at on reviews;
create trigger reviews_set_updated_at before update on reviews
  for each row execute function set_updated_at();

alter table reviews enable row level security;

-- Public can read only approved reviews, and can submit new ones (which
-- default to "pending" and aren't visible until an admin approves them via
-- the service-role client).
create policy "Public can read approved reviews" on reviews
  for select using (status = 'approved');

create policy "Public can submit reviews" on reviews
  for insert with check (status = 'pending');
