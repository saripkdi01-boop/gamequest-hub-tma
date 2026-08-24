create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  objective_type text not null check (objective_type in ('checkpoint_choice', 'daily_bonus')),
  config_json jsonb not null default '{}'::jsonb,
  reward_xp integer not null default 0 check (reward_xp >= 0),
  reward_relics integer not null default 0 check (reward_relics >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.player_quests (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  quest_id uuid not null references public.quests(id) on delete cascade,
  status text not null check (status in ('available', 'active', 'completed', 'failed')),
  seed text,
  progress_json jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists idx_player_quests_player_status on public.player_quests(player_id, status);
create index if not exists idx_player_quests_quest on public.player_quests(quest_id);
create unique index if not exists one_active_player_quest_per_quest on public.player_quests(player_id, quest_id) where status = 'active';

create table if not exists public.player_reward_ledger (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  currency text not null check (currency in ('xp', 'relic')),
  amount integer not null,
  reason text not null,
  idempotency_key text not null unique,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_ledger_player_currency on public.player_reward_ledger(player_id, currency);

create table if not exists public.daily_player_stats (
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  day_utc date not null,
  completed_quests integer not null default 0 check (completed_quests >= 0),
  rewarded_ads_count integer not null default 0 check (rewarded_ads_count >= 0),
  rewarded_relics integer not null default 0 check (rewarded_relics >= 0),
  primary key (player_id, day_utc)
);

create table if not exists public.leaderboard_snapshots (
  season_id text not null,
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  score integer not null default 0 check (score >= 0),
  rank integer,
  updated_at timestamptz not null default now(),
  primary key (season_id, player_id)
);

create table if not exists public.ad_reward_intents (
  ymid uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  placement text not null check (placement in ('daily_bonus', 'revive_genesis_run')),
  reward_currency text not null check (reward_currency in ('xp', 'relic')),
  reward_amount integer not null check (reward_amount > 0),
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);
create index if not exists idx_ad_intents_player_status on public.ad_reward_intents(player_id, status);

create table if not exists public.ad_postbacks (
  id uuid primary key default gen_random_uuid(),
  ymid uuid not null references public.ad_reward_intents(ymid) on delete cascade,
  event_type text not null,
  reward_event_type text,
  zone_id text,
  sub_zone_id text,
  telegram_id text,
  estimated_price numeric,
  payload_safe_json jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  unique (ymid, event_type, reward_event_type)
);
create index if not exists idx_postbacks_ymid on public.ad_postbacks(ymid);

alter table public.quests enable row level security;
alter table public.player_quests enable row level security;
alter table public.player_reward_ledger enable row level security;
alter table public.daily_player_stats enable row level security;
alter table public.leaderboard_snapshots enable row level security;
alter table public.ad_reward_intents enable row level security;
alter table public.ad_postbacks enable row level security;

revoke all on public.quests, public.player_quests, public.player_reward_ledger, public.daily_player_stats, public.leaderboard_snapshots, public.ad_reward_intents, public.ad_postbacks from anon, authenticated;
grant all on public.quests, public.player_quests, public.player_reward_ledger, public.daily_player_stats, public.leaderboard_snapshots, public.ad_reward_intents, public.ad_postbacks to service_role;

create or replace function public.complete_genesis_run(p_run_id uuid, p_player_id uuid, p_idempotency_prefix text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  run_row public.player_quests%rowtype;
  player_row public.gamequest_players%rowtype;
  today_utc date := (now() at time zone 'utc')::date;
  new_experience integer;
  new_level integer;
begin
  select * into run_row from public.player_quests where id = p_run_id and player_id = p_player_id for update;
  if not found then raise exception 'RUN_NOT_FOUND'; end if;
  if run_row.status = 'completed' then
    select * into player_row from public.gamequest_players where id = p_player_id;
    return jsonb_build_object('already_completed', true, 'experience', player_row.experience, 'level', player_row.level, 'relics', player_row.relics);
  end if;
  if run_row.status <> 'active' then raise exception 'RUN_NOT_ACTIVE'; end if;
  if coalesce((run_row.progress_json->>'checkpointIndex')::integer, 0) <> 3 then raise exception 'RUN_NOT_READY'; end if;

  update public.player_quests set status = 'completed', completed_at = now(), updated_at = now() where id = p_run_id;
  insert into public.player_reward_ledger (player_id, currency, amount, reason, idempotency_key, metadata_json)
  values (p_player_id, 'xp', 25, 'genesis_run_completed', p_idempotency_prefix || ':xp', jsonb_build_object('runId', p_run_id))
  on conflict (idempotency_key) do nothing;
  insert into public.player_reward_ledger (player_id, currency, amount, reason, idempotency_key, metadata_json)
  values (p_player_id, 'relic', 3, 'genesis_run_completed', p_idempotency_prefix || ':relic', jsonb_build_object('runId', p_run_id))
  on conflict (idempotency_key) do nothing;

  select * into player_row from public.gamequest_players where id = p_player_id for update;
  new_experience := player_row.experience + 25;
  new_level := floor(sqrt(new_experience::numeric / 100))::integer + 1;
  update public.gamequest_players
  set experience = new_experience, relics = player_row.relics + 3, level = new_level, quest_streak = greatest(player_row.quest_streak, 1), player_status = 'active', updated_at = now()
  where id = p_player_id;

  insert into public.daily_player_stats (player_id, day_utc, completed_quests)
  values (p_player_id, today_utc, 1)
  on conflict (player_id, day_utc) do update set completed_quests = public.daily_player_stats.completed_quests + 1;

  insert into public.leaderboard_snapshots (season_id, player_id, score, updated_at)
  values ('alpha-1', p_player_id, new_experience, now())
  on conflict (season_id, player_id) do update set score = excluded.score, updated_at = now();

  return jsonb_build_object('already_completed', false, 'experience', new_experience, 'level', new_level, 'relics', player_row.relics + 3, 'xpAwarded', 25, 'relicsAwarded', 3);
end;
$$;

revoke all on function public.complete_genesis_run(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.complete_genesis_run(uuid, uuid, text) to service_role;

insert into public.quests (slug, title, description, objective_type, config_json, reward_xp, reward_relics, active)
values ('genesis-run', 'Genesis Run', 'Navigate three frontier checkpoints to secure the first relic route.', 'checkpoint_choice', '{"checkpointCount":3}'::jsonb, 25, 3, true)
on conflict (slug) do update set title = excluded.title, description = excluded.description, config_json = excluded.config_json, reward_xp = excluded.reward_xp, reward_relics = excluded.reward_relics, active = true;
