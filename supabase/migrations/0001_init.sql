-- 7teen2wenty (1720) — core schema
-- Run in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug in ('earrings', 'rings', 'bracelets', 'necklaces')),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  slug text unique not null,
  category_id uuid not null references categories(id) on delete restrict,
  price integer not null check (price >= 0), -- PKR, integer (no paisa)
  compare_at_price integer,
  description text not null default '',
  plating_spec text not null default '',
  material_spec text not null default '316L stainless steel, PVD gold plated',
  images text[] not null default '{}',
  stock_count integer not null default 0 check (stock_count >= 0),
  is_new boolean not null default false,
  ring_size_range text, -- e.g. "US 5-9", null for non-ring categories
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on products(category_id);
create index if not exists products_is_new_idx on products(is_new);

-- ---------------------------------------------------------------------------
-- promo_codes
-- ---------------------------------------------------------------------------
create table if not exists promo_codes (
  code text primary key,
  discount_percent integer not null check (discount_percent between 1 and 100),
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- otp_codes — short-lived pre-dispatch verification codes
-- ---------------------------------------------------------------------------
create table if not exists otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code text not null,
  verified boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists otp_codes_phone_idx on otp_codes(phone);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  shipping_address jsonb not null,
  items jsonb not null,
  subtotal integer not null,
  discount integer not null default 0,
  delivery_fee integer not null default 0,
  total integer not null,
  promo_code text,
  payment_method text not null default 'cod' check (payment_method in ('cod', 'gateway')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'dispatched', 'delivered', 'returned', 'cancelled')),
  otp_verified boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on orders(status);
create index if not exists orders_phone_idx on orders(customer_phone);

-- ---------------------------------------------------------------------------
-- return_requests
-- ---------------------------------------------------------------------------
create table if not exists return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  order_number text not null,
  reason text not null,
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected', 'picked_up', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at before update on products
  for each row execute function set_updated_at();

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at before update on orders
  for each row execute function set_updated_at();

drop trigger if exists return_requests_set_updated_at on return_requests;
create trigger return_requests_set_updated_at before update on return_requests
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public (anon) can read catalog data only. All writes (orders, returns,
-- product/order management) go through the service-role key on the server
-- (see src/lib/supabase/admin.ts / server actions), never directly from
-- the browser.
-- ---------------------------------------------------------------------------
alter table categories enable row level security;
alter table products enable row level security;
alter table promo_codes enable row level security;
alter table otp_codes enable row level security;
alter table orders enable row level security;
alter table return_requests enable row level security;

create policy "Public can read categories" on categories for select using (true);
create policy "Public can read products" on products for select using (true);

-- promo_codes, otp_codes, orders, return_requests: no public policies —
-- only the service-role key (server-side) can read/write these.
