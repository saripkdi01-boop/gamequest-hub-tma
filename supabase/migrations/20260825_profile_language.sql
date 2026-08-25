-- GameQuest profile preference extension.
-- Telegram remains the source of truth for identity fields; this column stores the player's UI preference.

alter table public.gamequest_players
  add column if not exists preferred_language text not null default 'en';

alter table public.gamequest_players
  drop constraint if exists gamequest_players_preferred_language_check;

alter table public.gamequest_players
  add constraint gamequest_players_preferred_language_check
  check (preferred_language in ('en','id','es','fr','de','pt','ru','zh','ja','ko','ar','hi','tr','it','nl','pl','uk','vi','th','ms','fil','sw','fa','bn'));

create index if not exists idx_gamequest_players_preferred_language
  on public.gamequest_players(preferred_language);

revoke all on public.gamequest_players from anon, authenticated;
