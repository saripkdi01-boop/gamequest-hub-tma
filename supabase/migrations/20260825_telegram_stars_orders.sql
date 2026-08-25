create table if not exists public.telegram_star_orders (
  order_id text primary key,
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  telegram_user_id bigint not null,
  sku text not null,
  amount_xtr integer not null check (amount_xtr > 0),
  status text not null default 'created' check (status in ('created', 'paid', 'refunded', 'rejected')),
  telegram_payment_charge_id text unique,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists idx_telegram_star_orders_player on public.telegram_star_orders(player_id, created_at desc);
create index if not exists idx_telegram_star_orders_status on public.telegram_star_orders(status, created_at desc);

create table if not exists public.telegram_star_entitlements (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.telegram_star_orders(order_id) on delete cascade,
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  sku text not null,
  benefit_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(order_id, sku)
);

alter table public.telegram_star_orders enable row level security;
alter table public.telegram_star_entitlements enable row level security;
revoke all on public.telegram_star_orders, public.telegram_star_entitlements from anon, authenticated;
grant all on public.telegram_star_orders, public.telegram_star_entitlements to service_role;
