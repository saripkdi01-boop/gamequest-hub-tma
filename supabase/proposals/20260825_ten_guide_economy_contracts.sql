-- PROPOSAL ONLY — do not execute with production migrations until reviewed.
-- This schema records verified state; it does not mint, spend, stake, redeem, or confirm payment.

create table if not exists public.player_guide_preferences (
  player_id uuid primary key references public.gamequest_players(id) on delete cascade,
  guide_id text not null check (guide_id in ('nexus', 'pocket', 'tonbit', 'crosslink', 'neura', 'sosialis', 'shieldtma', 'pixelx', 'speedrun', 'legenda')),
  selected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guide_feature_flags (
  key text primary key check (key in ('guide_rewards', 'referral_program', 'vip_pass', 'season_pass', 'relic_staking', 'wallet_proof', 'wallet_redemption')),
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by text
);

insert into public.guide_feature_flags (key, enabled)
values
  ('guide_rewards', false), ('referral_program', false), ('vip_pass', false), ('season_pass', false), ('relic_staking', false), ('wallet_proof', false), ('wallet_redemption', false)
on conflict (key) do nothing;

create table if not exists public.player_referral_claims (
  referred_player_id uuid primary key references public.gamequest_players(id) on delete cascade,
  referrer_player_id uuid not null references public.gamequest_players(id) on delete restrict,
  referral_code text not null,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  idempotency_key text not null unique,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  check (referred_player_id <> referrer_player_id)
);

create table if not exists public.player_season_entitlements (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  season_key text not null,
  entitlement text not null check (entitlement in ('guide_legenda', 'vip', 'season_pass')),
  source text not null check (source in ('verified_stars_order', 'admin_grant', 'season_rule')),
  source_reference text not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'expired', 'revoked')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  unique (player_id, season_key, entitlement, source_reference)
);

revoke all on table public.player_guide_preferences, public.guide_feature_flags, public.player_referral_claims, public.player_season_entitlements from public, anon, authenticated;
