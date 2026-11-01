-- ad_order_log — "the most important measurement tool you own" (Meta Ads
-- Phase 1 brief, Section 4B): one row per order, source and outcome
-- recorded by hand, independent of whether it came through the website
-- checkout or a WhatsApp/Instagram DM — most of 1720's orders are the
-- latter, and never touch the `orders` table at all.
create table if not exists ad_order_log (
  id uuid primary key default gen_random_uuid(),
  order_date date not null default current_date,
  source text not null check (source in ('website', 'whatsapp', 'instagram_dm', 'other')),
  -- UTM/campaign/ad name; null means organic or no ad involved.
  ad_name text,
  product_name text not null,
  -- PKR. Revenue per order = Price − Discount + DeliveryChargeToCustomer.
  revenue integer not null default 0 check (revenue >= 0),
  -- placed -> cancelled (before dispatch) | shipped -> delivered | rto (refused/returned).
  status text not null default 'placed' check (status in ('placed', 'cancelled', 'shipped', 'delivered', 'rto')),
  -- What was actually collected in cash once delivered — the reconciled
  -- figure, not the order's face value.
  cash_collected integer check (cash_collected >= 0),
  dispatched_at date,
  resolved_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ad_order_log_status_idx on ad_order_log(status);
create index if not exists ad_order_log_order_date_idx on ad_order_log(order_date);

drop trigger if exists ad_order_log_set_updated_at on ad_order_log;
create trigger ad_order_log_set_updated_at before update on ad_order_log
  for each row execute function set_updated_at();

alter table ad_order_log enable row level security;
-- No public policies — service-role key (admin dashboard) only, same as `orders`.
