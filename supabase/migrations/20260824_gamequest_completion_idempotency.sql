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
  select * into player_row from public.gamequest_players where id = p_player_id for update;
  if run_row.status = 'completed' then
    return jsonb_build_object('already_completed', true, 'experience', player_row.experience, 'level', player_row.level, 'relics', player_row.relics, 'xpAwarded', 0, 'relicsAwarded', 0);
  end if;
  if run_row.status <> 'active' then raise exception 'RUN_NOT_ACTIVE'; end if;
  if coalesce((run_row.progress_json->>'checkpointIndex')::integer, 0) <> 3 then raise exception 'RUN_NOT_READY'; end if;

  update public.player_quests set status = 'completed', completed_at = now(), updated_at = now() where id = p_run_id;
  insert into public.player_reward_ledger (player_id, currency, amount, reason, idempotency_key, metadata_json)
  values (p_player_id, 'xp', 25, 'genesis_run_completed', p_idempotency_prefix || ':xp', jsonb_build_object('runId', p_run_id)) on conflict (idempotency_key) do nothing;
  insert into public.player_reward_ledger (player_id, currency, amount, reason, idempotency_key, metadata_json)
  values (p_player_id, 'relic', 3, 'genesis_run_completed', p_idempotency_prefix || ':relic', jsonb_build_object('runId', p_run_id)) on conflict (idempotency_key) do nothing;

  new_experience := player_row.experience + 25;
  new_level := floor(sqrt(new_experience::numeric / 100))::integer + 1;
  update public.gamequest_players set experience = new_experience, relics = player_row.relics + 3, level = new_level, quest_streak = greatest(player_row.quest_streak, 1), player_status = 'active', updated_at = now() where id = p_player_id;
  insert into public.daily_player_stats (player_id, day_utc, completed_quests) values (p_player_id, today_utc, 1) on conflict (player_id, day_utc) do update set completed_quests = public.daily_player_stats.completed_quests + 1;
  insert into public.leaderboard_snapshots (season_id, player_id, score, updated_at) values ('alpha-1', p_player_id, new_experience, now()) on conflict (season_id, player_id) do update set score = excluded.score, updated_at = now();
  return jsonb_build_object('already_completed', false, 'experience', new_experience, 'level', new_level, 'relics', player_row.relics + 3, 'xpAwarded', 25, 'relicsAwarded', 3);
end;
$$;
