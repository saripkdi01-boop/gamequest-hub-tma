alter table public.player_reward_ledger drop constraint if exists player_reward_ledger_currency_check;
alter table public.player_reward_ledger add constraint player_reward_ledger_currency_check check (currency in ('xp', 'relic', 'quest_coin'));

alter table public.ad_reward_intents drop constraint if exists ad_reward_intents_placement_check;
alter table public.ad_reward_intents add constraint ad_reward_intents_placement_check check (placement in ('daily_bonus', 'revive_genesis_run', 'signal_mining', 'relic_resonance'));
alter table public.ad_reward_intents drop constraint if exists ad_reward_intents_reward_currency_check;
alter table public.ad_reward_intents add constraint ad_reward_intents_reward_currency_check check (reward_currency in ('xp', 'relic', 'quest_coin'));

alter table public.daily_player_stats add column if not exists rewarded_quest_coins bigint not null default 0 check (rewarded_quest_coins >= 0);

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
  select * into intent_row from public.ad_reward_intents where ymid = p_ymid for update;
  if not found then raise exception 'INTENT_NOT_FOUND'; end if;
  if intent_row.status = 'verified' then return jsonb_build_object('rewarded', false, 'duplicate', true); end if;
  if intent_row.status <> 'pending' or intent_row.expires_at <= now() then
    update public.ad_reward_intents set status = case when status = 'pending' then 'expired' else status end where ymid = p_ymid;
    return jsonb_build_object('rewarded', false, 'duplicate', false);
  end if;

  select * into player_row from public.gamequest_players where id = intent_row.player_id for update;
  reward_reason := 'rewarded_ad:' || intent_row.provider || ':' || intent_row.placement;
  idempotency_prefix := intent_row.provider || ':';

  insert into public.player_reward_ledger (player_id, currency, amount, reason, idempotency_key, metadata_json)
  values (intent_row.player_id, intent_row.reward_currency, intent_row.reward_amount, reward_reason, idempotency_prefix || intent_row.ymid::text,
    jsonb_build_object('ymid', intent_row.ymid, 'provider', intent_row.provider, 'placement', intent_row.placement))
  on conflict (idempotency_key) do nothing;
  get diagnostics ledger_created = row_count;
  if not ledger_created then
    update public.ad_reward_intents set status = 'verified', verified_at = now() where ymid = p_ymid;
    return jsonb_build_object('rewarded', false, 'duplicate', true);
  end if;

  if intent_row.reward_currency = 'relic' then
    update public.gamequest_players set relics = player_row.relics + intent_row.reward_amount, updated_at = now() where id = player_row.id;
  elsif intent_row.reward_currency = 'quest_coin' then
    update public.gamequest_players set quest_coins = player_row.quest_coins + intent_row.reward_amount, updated_at = now() where id = player_row.id;
  elsif intent_row.reward_currency = 'xp' then
    update public.gamequest_players set experience = player_row.experience + intent_row.reward_amount, level = floor(sqrt(greatest(0, player_row.experience + intent_row.reward_amount)::numeric / 100))::integer + 1, updated_at = now() where id = player_row.id;
  else
    raise exception 'UNSUPPORTED_REWARD_CURRENCY';
  end if;

  update public.ad_reward_intents set status = 'verified', verified_at = now() where ymid = p_ymid;
  insert into public.daily_player_stats (player_id, day_utc, rewarded_ads_count, rewarded_relics, rewarded_quest_coins)
  values (player_row.id, today_utc, 1, case when intent_row.reward_currency = 'relic' then intent_row.reward_amount else 0 end, case when intent_row.reward_currency = 'quest_coin' then intent_row.reward_amount else 0 end)
  on conflict (player_id, day_utc) do update set
    rewarded_ads_count = public.daily_player_stats.rewarded_ads_count + 1,
    rewarded_relics = public.daily_player_stats.rewarded_relics + excluded.rewarded_relics,
    rewarded_quest_coins = public.daily_player_stats.rewarded_quest_coins + excluded.rewarded_quest_coins;
  return jsonb_build_object('rewarded', true, 'duplicate', false, 'currency', intent_row.reward_currency, 'amount', intent_row.reward_amount);
end;
$$;

revoke all on function public.grant_ad_reward(uuid) from public, anon, authenticated;
grant execute on function public.grant_ad_reward(uuid) to service_role;
