alter table public.ad_reward_intents
  add column if not exists provider text not null default 'monetag';

alter table public.ad_reward_intents
  drop constraint if exists ad_reward_intents_provider_check;

alter table public.ad_reward_intents
  add constraint ad_reward_intents_provider_check
  check (provider in ('monetag', 'adsgram'));

create index if not exists idx_ad_intents_provider_status
  on public.ad_reward_intents(provider, status);

create or replace function public.grant_ad_reward(p_ymid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  intent_row public.ad_reward_intents%rowtype;
  player_row public.gamequest_players%rowtype;
  ledger_created boolean := false;
  today_utc date := (now() at time zone 'utc')::date;
  reward_reason text;
  idempotency_prefix text;
begin
  select * into intent_row
    from public.ad_reward_intents
   where ymid = p_ymid
   for update;

  if not found then raise exception 'INTENT_NOT_FOUND'; end if;
  if intent_row.status = 'verified' then
    return jsonb_build_object('rewarded', false, 'duplicate', true);
  end if;
  if intent_row.status <> 'pending' or intent_row.expires_at <= now() then
    update public.ad_reward_intents
       set status = case when status = 'pending' then 'expired' else status end
     where ymid = p_ymid;
    return jsonb_build_object('rewarded', false, 'duplicate', false);
  end if;

  select * into player_row
    from public.gamequest_players
   where id = intent_row.player_id
   for update;

  reward_reason := 'rewarded_ad:' || intent_row.provider || ':' || intent_row.placement;
  idempotency_prefix := intent_row.provider || ':';

  insert into public.player_reward_ledger
    (player_id, currency, amount, reason, idempotency_key, metadata_json)
  values
    (intent_row.player_id, intent_row.reward_currency, intent_row.reward_amount,
     reward_reason, idempotency_prefix || intent_row.ymid::text,
     jsonb_build_object('ymid', intent_row.ymid, 'provider', intent_row.provider, 'placement', intent_row.placement))
  on conflict (idempotency_key) do nothing;

  get diagnostics ledger_created = row_count;
  if not ledger_created then
    update public.ad_reward_intents
       set status = 'verified', verified_at = now()
     where ymid = p_ymid;
    return jsonb_build_object('rewarded', false, 'duplicate', true);
  end if;

  update public.gamequest_players
     set relics = player_row.relics + intent_row.reward_amount,
         updated_at = now()
   where id = player_row.id;

  update public.ad_reward_intents
     set status = 'verified', verified_at = now()
   where ymid = p_ymid;

  insert into public.daily_player_stats
    (player_id, day_utc, rewarded_ads_count, rewarded_relics)
  values
    (player_row.id, today_utc, 1, intent_row.reward_amount)
  on conflict (player_id, day_utc)
  do update set
    rewarded_ads_count = public.daily_player_stats.rewarded_ads_count + 1,
    rewarded_relics = public.daily_player_stats.rewarded_relics + excluded.rewarded_relics;

  return jsonb_build_object('rewarded', true, 'duplicate', false);
end;
$$;

revoke all on function public.grant_ad_reward(uuid) from public, anon, authenticated;
grant execute on function public.grant_ad_reward(uuid) to service_role;

create or replace function public.grant_monetag_reward(p_ymid uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.grant_ad_reward(p_ymid);
end;
$$;

revoke all on function public.grant_monetag_reward(uuid) from public, anon, authenticated;
grant execute on function public.grant_monetag_reward(uuid) to service_role;
