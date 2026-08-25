create table if not exists public.player_item_inventory (
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  item_key text not null,
  quantity integer not null default 0 check (quantity >= 0),
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (player_id, item_key)
);

alter table public.player_item_inventory enable row level security;
revoke all on public.player_item_inventory from anon, authenticated;
grant all on public.player_item_inventory to service_role;

create or replace function public.grant_stars_item(p_order_id text, p_player_id uuid, p_item_key text, p_benefit_json jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  entitlement_created boolean := false;
  new_quantity integer;
begin
  insert into public.telegram_star_entitlements (order_id, player_id, sku, benefit_json)
  values (p_order_id, p_player_id, p_item_key, coalesce(p_benefit_json, '{}'::jsonb))
  on conflict (order_id, sku) do nothing;
  get diagnostics entitlement_created = row_count;
  if not entitlement_created then
    select quantity into new_quantity from public.player_item_inventory where player_id = p_player_id and item_key = p_item_key;
    return jsonb_build_object('granted', false, 'duplicate', true, 'quantity', coalesce(new_quantity, 0));
  end if;

  insert into public.player_item_inventory (player_id, item_key, quantity, metadata_json)
  values (p_player_id, p_item_key, 1, coalesce(p_benefit_json, '{}'::jsonb))
  on conflict (player_id, item_key) do update set quantity = public.player_item_inventory.quantity + 1, updated_at = now();
  select quantity into new_quantity from public.player_item_inventory where player_id = p_player_id and item_key = p_item_key;
  return jsonb_build_object('granted', true, 'duplicate', false, 'quantity', new_quantity);
end;
$$;

revoke all on function public.grant_stars_item(text, uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.grant_stars_item(text, uuid, text, jsonb) to service_role;
