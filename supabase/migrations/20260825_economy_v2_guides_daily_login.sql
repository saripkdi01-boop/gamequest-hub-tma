-- Quest Nexus economy v2: verified guide ownership and daily retention.
-- Stars, ads, wallet, referral, VIP, season pass, staking, and redemption
-- remain disabled until their separate server contracts are configured.

alter table public.gamequest_players
  add column if not exists active_guide_id text not null default 'nexus',
  add column if not exists daily_login_streak integer not null default 0 check (daily_login_streak >= 0),
  add column if not exists daily_login_last_day date;

alter table public.gamequest_players drop constraint if exists gamequest_players_active_guide_check;
alter table public.gamequest_players add constraint gamequest_players_active_guide_check
  check (active_guide_id in ('nexus','pocket','tonbit','crosslink','neura','sosialis','shieldtma','pixelx','speedrun','legenda'));

create table if not exists public.player_guides (
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  guide_id text not null check (guide_id in ('nexus','pocket','tonbit','crosslink','neura','sosialis','shieldtma','pixelx','speedrun','legenda')),
  level integer not null default 1 check (level >= 1),
  unlocked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (player_id, guide_id)
);

create table if not exists public.daily_login_claims (
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  day_utc date not null,
  streak_day integer not null check (streak_day between 1 and 7),
  reward_relics integer not null check (reward_relics > 0),
  created_at timestamptz not null default now(),
  primary key (player_id, day_utc)
);

alter table public.player_guides enable row level security;
alter table public.daily_login_claims enable row level security;
revoke all on public.player_guides, public.daily_login_claims from anon, authenticated;
grant all on public.player_guides, public.daily_login_claims to service_role;

insert into public.player_guides (player_id, guide_id, level)
select id, 'nexus', 1 from public.gamequest_players
on conflict (player_id, guide_id) do nothing;

create or replace function public.get_guide_benefits(p_guide_id text)
returns jsonb language plpgsql immutable security definer set search_path = public as $$
begin
  if p_guide_id = 'nexus' then return jsonb_build_object('guideId','nexus','rarity','common','xpMultiplier',1.10,'qcMultiplier',1,'mindMultiplier',1,'maxEnergyBonus',0,'label','+10% Genesis XP'); end if;
  if p_guide_id = 'pocket' then return jsonb_build_object('guideId','pocket','rarity','rare','xpMultiplier',1,'qcMultiplier',1,'mindMultiplier',1,'maxEnergyBonus',2,'label','+2 maximum energy'); end if;
  if p_guide_id = 'tonbit' then return jsonb_build_object('guideId','tonbit','rarity','epic','xpMultiplier',1,'qcMultiplier',1,'mindMultiplier',1,'maxEnergyBonus',0,'starsBonusPercent',5,'label','+5% Stars utility'); end if;
  if p_guide_id = 'crosslink' then return jsonb_build_object('guideId','crosslink','rarity','rare','xpMultiplier',1,'qcMultiplier',1,'mindMultiplier',1,'maxEnergyBonus',0,'energyCostMultiplier',0.90,'label','-10% route energy cost'); end if;
  if p_guide_id = 'neura' then return jsonb_build_object('guideId','neura','rarity','epic','xpMultiplier',1,'qcMultiplier',1,'mindMultiplier',1.15,'maxEnergyBonus',0,'label','+15% Mind score'); end if;
  if p_guide_id = 'sosialis' then return jsonb_build_object('guideId','sosialis','rarity','rare','xpMultiplier',1,'qcMultiplier',1,'mindMultiplier',1,'maxEnergyBonus',0,'referralBonusPercent',10,'label','+10% referral utility'); end if;
  if p_guide_id = 'shieldtma' then return jsonb_build_object('guideId','shieldtma','rarity','epic','xpMultiplier',1,'qcMultiplier',1,'mindMultiplier',1,'maxEnergyBonus',0,'streakProtection',1,'label','1 streak protection per day'); end if;
  if p_guide_id = 'pixelx' then return jsonb_build_object('guideId','pixelx','rarity','epic','xpMultiplier',1,'qcMultiplier',1.20,'mindMultiplier',1,'maxEnergyBonus',0,'label','+20% quiz Quest Coins'); end if;
  if p_guide_id = 'speedrun' then return jsonb_build_object('guideId','speedrun','rarity','rare','xpMultiplier',1.05,'qcMultiplier',1.05,'mindMultiplier',1,'maxEnergyBonus',0,'label','+5% XP and Quest Coins'); end if;
  if p_guide_id = 'legenda' then return jsonb_build_object('guideId','legenda','rarity','legendary','xpMultiplier',1.05,'qcMultiplier',1.05,'mindMultiplier',1.05,'maxEnergyBonus',0,'label','All active bonuses +5%'); end if;
  raise exception 'GUIDE_NOT_FOUND';
end;
$$;

create or replace function public.select_guide(p_player_id uuid, p_guide_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare player_row public.gamequest_players%rowtype;
begin
  if p_guide_id not in ('nexus','pocket','tonbit','crosslink','neura','sosialis','shieldtma','pixelx','speedrun','legenda') then raise exception 'GUIDE_NOT_FOUND'; end if;
  select * into player_row from public.gamequest_players where id = p_player_id for update;
  if not found then raise exception 'PLAYER_NOT_FOUND'; end if;
  if not exists (select 1 from public.player_guides where player_id = p_player_id and guide_id = p_guide_id) then raise exception 'GUIDE_NOT_OWNED'; end if;
  update public.gamequest_players set active_guide_id = p_guide_id, updated_at = now() where id = p_player_id;
  return jsonb_build_object('activeGuideId',p_guide_id,'benefits',public.get_guide_benefits(p_guide_id));
end;
$$;

create or replace function public.unlock_guide_relics(p_player_id uuid, p_guide_id text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare player_row public.gamequest_players%rowtype; unlock_cost integer := 50;
begin
  if p_guide_id not in ('pocket','tonbit','crosslink','neura','sosialis','shieldtma','pixelx','speedrun','legenda') then raise exception 'GUIDE_NOT_UNLOCKABLE'; end if;
  select * into player_row from public.gamequest_players where id = p_player_id for update;
  if not found then raise exception 'PLAYER_NOT_FOUND'; end if;
  if exists (select 1 from public.player_guides where player_id = p_player_id and guide_id = p_guide_id) then return jsonb_build_object('unlocked',false,'duplicate',true,'guideId',p_guide_id,'relics',player_row.relics); end if;
  if player_row.relics < unlock_cost then raise exception 'INSUFFICIENT_RELICS'; end if;
  insert into public.player_reward_ledger (player_id,currency,amount,reason,idempotency_key,metadata_json)
  values (p_player_id,'relic',-unlock_cost,'guide_unlocked','guide-unlock:'||p_player_id::text||':'||p_guide_id,jsonb_build_object('guideId',p_guide_id));
  update public.gamequest_players set relics = relics - unlock_cost, updated_at = now() where id = p_player_id;
  insert into public.player_guides (player_id,guide_id,level) values (p_player_id,p_guide_id,1);
  return jsonb_build_object('unlocked',true,'duplicate',false,'guideId',p_guide_id,'relics',player_row.relics-unlock_cost);
end;
$$;

create or replace function public.claim_daily_login(p_player_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare player_row public.gamequest_players%rowtype; today_utc date := (now() at time zone 'utc')::date; next_streak integer; reward_value integer;
begin
  select * into player_row from public.gamequest_players where id = p_player_id for update;
  if not found then raise exception 'PLAYER_NOT_FOUND'; end if;
  if player_row.daily_login_last_day = today_utc then return jsonb_build_object('claimed',false,'duplicate',true,'streakDay',player_row.daily_login_streak,'rewardRelics',0,'relics',player_row.relics); end if;
  next_streak := case when player_row.daily_login_last_day = today_utc - 1 then least(7,player_row.daily_login_streak+1) else 1 end;
  reward_value := case next_streak when 1 then 1 when 2 then 2 when 3 then 3 when 4 then 4 when 5 then 5 when 6 then 6 else 10 end;
  insert into public.daily_login_claims (player_id,day_utc,streak_day,reward_relics) values (p_player_id,today_utc,next_streak,reward_value) on conflict (player_id,day_utc) do nothing;
  if not found then return jsonb_build_object('claimed',false,'duplicate',true,'streakDay',player_row.daily_login_streak,'rewardRelics',0,'relics',player_row.relics); end if;
  insert into public.player_reward_ledger (player_id,currency,amount,reason,idempotency_key,metadata_json)
  values (p_player_id,'relic',reward_value,'daily_login','daily-login:'||p_player_id::text||':'||today_utc::text,jsonb_build_object('streakDay',next_streak));
  update public.gamequest_players set relics = relics + reward_value, daily_login_streak = next_streak, daily_login_last_day = today_utc, updated_at = now() where id = p_player_id;
  return jsonb_build_object('claimed',true,'duplicate',false,'streakDay',next_streak,'rewardRelics',reward_value,'relics',player_row.relics+reward_value);
end;
$$;

create or replace function public.regenerate_energy(p_player_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare player_row public.gamequest_players%rowtype; max_energy integer := 10; ticks integer; next_energy integer;
begin
  select * into player_row from public.gamequest_players where id = p_player_id for update;
  if not found then raise exception 'PLAYER_NOT_FOUND'; end if;
  if player_row.active_guide_id = 'pocket' then max_energy := 12; end if;
  ticks := greatest(0,floor(extract(epoch from (now()-player_row.energy_updated_at))/1800)::integer);
  next_energy := least(max_energy,player_row.energy+ticks);
  update public.gamequest_players set energy=next_energy,energy_updated_at=case when ticks>0 then now() else energy_updated_at end,updated_at=now() where id=p_player_id;
  return jsonb_build_object('energy',next_energy,'maxEnergy',max_energy,'recovered',greatest(0,next_energy-player_row.energy));
end;
$$;

revoke all on function public.get_guide_benefits(text), public.select_guide(uuid,text), public.unlock_guide_relics(uuid,text), public.claim_daily_login(uuid), public.regenerate_energy(uuid) from public, anon, authenticated;
grant execute on function public.get_guide_benefits(text), public.select_guide(uuid,text), public.unlock_guide_relics(uuid,text), public.claim_daily_login(uuid), public.regenerate_energy(uuid) to service_role;

create index if not exists idx_player_guides_player on public.player_guides(player_id,guide_id);
create index if not exists idx_daily_login_claims_player on public.daily_login_claims(player_id,day_utc desc);
create index if not exists idx_gamequest_players_active_guide on public.gamequest_players(active_guide_id);

insert into public.qm_economy_config (key,value_numeric,value_text)
values ('guide_unlock_relic_cost',50,'Non-NEXUS guide unlock cost'),('daily_login_streak_cap',7,'UTC streak cycle cap')
on conflict (key) do update set value_numeric=excluded.value_numeric,value_text=excluded.value_text,updated_at=now();

-- End economy v2 foundation.
