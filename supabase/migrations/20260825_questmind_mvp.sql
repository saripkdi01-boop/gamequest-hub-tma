-- QUEST//MIND MVP foundation.
-- All gameplay mutations run through server-side service_role/RPC.

alter table public.gamequest_players
  add column if not exists mind_score integer not null default 0 check (mind_score >= 0),
  add column if not exists daily_score integer not null default 0 check (daily_score >= 0),
  add column if not exists quest_coins bigint not null default 0 check (quest_coins >= 0),
  add column if not exists energy integer not null default 10 check (energy >= 0),
  add column if not exists energy_updated_at timestamptz not null default now(),
  add column if not exists combo_best integer not null default 0 check (combo_best >= 0),
  add column if not exists streak_last_day date;

create table if not exists public.qm_questions (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard', 'boss')),
  question text not null,
  answers jsonb not null check (jsonb_typeof(answers) = 'array'),
  correct_answer text not null,
  explanation text not null default '',
  base_reward integer not null default 25 check (base_reward > 0),
  time_limit_ms integer not null default 15000 check (time_limit_ms between 3000 and 120000),
  season text not null default 'alpha-1',
  active_from timestamptz not null default now(),
  active_until timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_qm_questions_pool on public.qm_questions(active, season, difficulty, active_from);

create table if not exists public.qm_question_sessions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  mode text not null check (mode in ('know', 'bluff', 'chain', 'boss', 'world')),
  status text not null default 'active' check (status in ('active', 'completed', 'expired', 'abandoned', 'review')),
  question_ids uuid[] not null,
  current_index integer not null default 0 check (current_index >= 0),
  combo integer not null default 0 check (combo >= 0),
  nonce text not null unique,
  question_started_at timestamptz not null default now(),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_qm_sessions_player_status on public.qm_question_sessions(player_id, status, created_at desc);

create table if not exists public.qm_question_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.qm_question_sessions(id) on delete cascade,
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  question_id uuid not null references public.qm_questions(id),
  sequence_no integer not null check (sequence_no >= 0),
  answer_id text not null,
  is_correct boolean not null,
  server_response_ms integer not null check (server_response_ms >= 0),
  client_response_ms integer,
  qc_awarded integer not null default 0 check (qc_awarded >= 0),
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  mind_score_awarded integer not null default 0 check (mind_score_awarded >= 0),
  fraud_score integer not null default 0 check (fraud_score between 0 and 100),
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  unique (session_id, sequence_no)
);
create index if not exists idx_qm_answers_player_created on public.qm_question_answers(player_id, created_at desc);

create table if not exists public.qm_coin_ledger (
  transaction_id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  type text not null check (type in ('EARN', 'BURN', 'REDEMPTION', 'REVERSAL', 'ADMIN_ADJUSTMENT')),
  amount bigint not null check (amount <> 0),
  source text not null,
  reference_id text not null,
  idempotency_key text not null unique,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_qm_coin_ledger_player_created on public.qm_coin_ledger(player_id, created_at desc);

create table if not exists public.qm_economy_config (
  key text primary key,
  value_numeric numeric,
  value_text text,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.daily_player_stats
  add column if not exists daily_score integer not null default 0 check (daily_score >= 0),
  add column if not exists correct_answers integer not null default 0 check (correct_answers >= 0),
  add column if not exists qc_emitted bigint not null default 0 check (qc_emitted >= 0);

create table if not exists public.qm_powerup_catalog (
  slug text primary key,
  title text not null,
  description text not null,
  qc_cost integer not null check (qc_cost >= 0),
  active boolean not null default true
);

create table if not exists public.qm_player_inventory (
  player_id uuid not null references public.gamequest_players(id) on delete cascade,
  powerup_slug text not null references public.qm_powerup_catalog(slug),
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (player_id, powerup_slug)
);

alter table public.qm_questions enable row level security;
alter table public.qm_question_sessions enable row level security;
alter table public.qm_question_answers enable row level security;
alter table public.qm_coin_ledger enable row level security;
alter table public.qm_economy_config enable row level security;
alter table public.qm_powerup_catalog enable row level security;
alter table public.qm_player_inventory enable row level security;

revoke all on public.qm_questions, public.qm_question_sessions, public.qm_question_answers, public.qm_coin_ledger, public.qm_economy_config, public.qm_powerup_catalog, public.qm_player_inventory from anon, authenticated;
grant all on public.qm_questions, public.qm_question_sessions, public.qm_question_answers, public.qm_coin_ledger, public.qm_economy_config, public.qm_powerup_catalog, public.qm_player_inventory to service_role;

create or replace function public.qm_start_quiz_session(
  p_player_id uuid,
  p_mode text,
  p_question_ids uuid[],
  p_nonce text,
  p_expires_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  player_row public.gamequest_players%rowtype;
  session_row public.qm_question_sessions%rowtype;
begin
  if p_mode not in ('know', 'bluff', 'chain', 'boss', 'world') then raise exception 'INVALID_QUIZ_MODE'; end if;
  if coalesce(cardinality(p_question_ids), 0) < 1 or cardinality(p_question_ids) > 10 then raise exception 'INVALID_QUESTION_SET'; end if;
  select * into player_row from public.gamequest_players where id = p_player_id for update;
  if not found then raise exception 'PLAYER_NOT_FOUND'; end if;
  if player_row.energy < 1 then raise exception 'ENERGY_DEPLETED'; end if;
  update public.gamequest_players set energy = energy - 1, updated_at = now() where id = p_player_id;
  insert into public.qm_question_sessions (player_id, mode, question_ids, nonce, expires_at)
  values (p_player_id, p_mode, p_question_ids, p_nonce, p_expires_at)
  returning * into session_row;
  return jsonb_build_object('sessionId', session_row.id, 'mode', session_row.mode, 'nonce', session_row.nonce, 'expiresAt', session_row.expires_at, 'energy', player_row.energy - 1);
end;
$$;

revoke all on function public.qm_start_quiz_session(uuid, text, uuid[], text, timestamptz) from public, anon, authenticated;
grant execute on function public.qm_start_quiz_session(uuid, text, uuid[], text, timestamptz) to service_role;

create or replace function public.qm_submit_answer(
  p_session_id uuid,
  p_player_id uuid,
  p_answer_id text,
  p_client_response_ms integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  session_row public.qm_question_sessions%rowtype;
  question_row public.qm_questions%rowtype;
  answer_row public.qm_question_answers%rowtype;
  player_row public.gamequest_players%rowtype;
  current_question_id uuid;
  is_correct_value boolean;
  sequence_value integer;
  server_response_ms_value integer;
  speed_multiplier numeric := 1;
  combo_multiplier numeric := 1;
  raw_qc integer;
  qc_value integer := 0;
  xp_value integer := 0;
  mind_value integer := 0;
  fraud_value integer := 0;
  today_utc date := (now() at time zone 'utc')::date;
  new_combo integer;
  idempotency_value text;
begin
  select * into session_row from public.qm_question_sessions where id = p_session_id and player_id = p_player_id for update;
  if not found then raise exception 'QUIZ_SESSION_NOT_FOUND'; end if;

  sequence_value := session_row.current_index;
  current_question_id := session_row.question_ids[sequence_value + 1];
  if current_question_id is null then raise exception 'QUIZ_SESSION_COMPLETE'; end if;
  idempotency_value := 'qm-answer:' || p_session_id::text || ':' || sequence_value::text;

  select * into answer_row from public.qm_question_answers where idempotency_key = idempotency_value;
  if found then
    return jsonb_build_object('duplicate', true, 'correct', answer_row.is_correct, 'qcAwarded', answer_row.qc_awarded, 'xpAwarded', answer_row.xp_awarded, 'mindScoreAwarded', answer_row.mind_score_awarded, 'combo', session_row.combo, 'sequence', answer_row.sequence_no, 'sessionCompleted', session_row.status = 'completed');
  end if;

  if session_row.status <> 'active' then raise exception 'QUIZ_SESSION_NOT_ACTIVE'; end if;
  if session_row.expires_at <= now() then
    update public.qm_question_sessions set status = 'expired' where id = session_row.id;
    raise exception 'QUIZ_SESSION_EXPIRED';
  end if;

  select * into question_row from public.qm_questions where id = current_question_id and active = true;
  if not found then raise exception 'QUESTION_NOT_AVAILABLE'; end if;
  if not exists (select 1 from jsonb_array_elements(question_row.answers) item where item->>'id' = p_answer_id) then raise exception 'INVALID_ANSWER'; end if;

  select * into player_row from public.gamequest_players where id = p_player_id for update;
  server_response_ms_value := greatest(0, floor(extract(epoch from (now() - session_row.question_started_at)) * 1000)::integer);
  is_correct_value := question_row.correct_answer = p_answer_id;
  fraud_value := case when server_response_ms_value < 650 then 25 else 0 end;
  if p_client_response_ms is not null and (p_client_response_ms < 0 or p_client_response_ms > question_row.time_limit_ms + 5000) then fraud_value := least(100, fraud_value + 20); end if;

  if is_correct_value then
    speed_multiplier := least(1.5, 1 + greatest(0, question_row.time_limit_ms - server_response_ms_value)::numeric / greatest(1, question_row.time_limit_ms)::numeric * 0.5);
    combo_multiplier := least(3, 1 + (session_row.combo * 0.2));
    raw_qc := floor(question_row.base_reward * speed_multiplier * combo_multiplier)::integer;
    qc_value := least(raw_qc, 1000);
    if fraud_value >= 70 then qc_value := 0; end if;
    xp_value := case question_row.difficulty when 'easy' then 8 when 'medium' then 15 when 'hard' then 30 when 'boss' then 80 else 8 end;
    mind_value := case question_row.difficulty when 'easy' then 3 when 'medium' then 7 when 'hard' then 15 when 'boss' then 30 else 3 end;
    new_combo := session_row.combo + 1;
  else
    new_combo := 0;
  end if;

  insert into public.qm_question_answers (session_id, player_id, question_id, sequence_no, answer_id, is_correct, server_response_ms, client_response_ms, qc_awarded, xp_awarded, mind_score_awarded, fraud_score, idempotency_key)
  values (session_row.id, p_player_id, current_question_id, sequence_value, p_answer_id, is_correct_value, server_response_ms_value, p_client_response_ms, qc_value, xp_value, mind_value, fraud_value, idempotency_value);

  update public.gamequest_players set
    experience = player_row.experience + xp_value,
    mind_score = player_row.mind_score + mind_value,
    quest_coins = player_row.quest_coins + qc_value,
    daily_score = player_row.daily_score + xp_value + mind_value,
    combo_best = greatest(player_row.combo_best, new_combo),
    level = floor(sqrt(greatest(0, player_row.experience + xp_value)::numeric / 100))::integer + 1,
    updated_at = now()
  where id = p_player_id;

  if qc_value > 0 then
    insert into public.qm_coin_ledger (player_id, type, amount, source, reference_id, idempotency_key, metadata_json)
    values (p_player_id, 'EARN', qc_value, 'quiz_' || session_row.mode, session_row.id::text || ':' || sequence_value::text, idempotency_value || ':qc', jsonb_build_object('difficulty', question_row.difficulty, 'speedMultiplier', speed_multiplier, 'comboMultiplier', combo_multiplier, 'fraudScore', fraud_value));
  end if;

  insert into public.daily_player_stats (player_id, day_utc, correct_answers, qc_emitted, daily_score)
  values (p_player_id, today_utc, case when is_correct_value then 1 else 0 end, qc_value, xp_value + mind_value)
  on conflict (player_id, day_utc) do update set
    correct_answers = public.daily_player_stats.correct_answers + excluded.correct_answers,
    qc_emitted = public.daily_player_stats.qc_emitted + excluded.qc_emitted,
    daily_score = public.daily_player_stats.daily_score + excluded.daily_score;

  update public.qm_question_sessions set
    current_index = sequence_value + 1,
    combo = new_combo,
    question_started_at = now(),
    status = case when sequence_value + 1 >= cardinality(question_ids) then 'completed' else 'active' end,
    completed_at = case when sequence_value + 1 >= cardinality(question_ids) then now() else null end
  where id = session_row.id;

  return jsonb_build_object(
    'duplicate', false,
    'correct', is_correct_value,
    'qcAwarded', qc_value,
    'xpAwarded', xp_value,
    'mindScoreAwarded', mind_value,
    'combo', new_combo,
    'sequence', sequence_value,
    'sessionCompleted', sequence_value + 1 >= cardinality(session_row.question_ids),
    'explanation', question_row.explanation,
    'serverResponseMs', server_response_ms_value,
    'fraudScore', fraud_value
  );
end;
$$;

revoke all on function public.qm_submit_answer(uuid, uuid, text, integer) from public, anon, authenticated;
grant execute on function public.qm_submit_answer(uuid, uuid, text, integer) to service_role;

insert into public.qm_economy_config (key, value_numeric) values
  ('easy.base_reward', 25), ('medium.base_reward', 60), ('hard.base_reward', 140),
  ('speed_bonus_max', 0.5), ('combo_step', 0.2), ('combo_cap', 3),
  ('per_answer_cap', 1000), ('daily_player_emission_cap', 10000),
  ('redemption_threshold_qc', 1000000)
on conflict (key) do nothing;

insert into public.qm_powerup_catalog (slug, title, description, qc_cost) values
  ('hint', 'Signal Hint', 'Reveal a strategic clue without exposing the answer key.', 250),
  ('fifty_fifty', '50/50', 'Remove two incorrect options.', 500),
  ('time_freeze', 'Time Freeze', 'Pause the visible timer once in a run.', 750),
  ('revive', 'Revive', 'Continue a failed chain with combo reset.', 1000)
on conflict (slug) do nothing;

insert into public.qm_questions (category, difficulty, question, answers, correct_answer, explanation, base_reward, time_limit_ms, season)
values
  ('Science', 'easy', 'Which planet is known as the Red Planet?', '[{"id":"a","text":"Venus"},{"id":"b","text":"Mars"},{"id":"c","text":"Jupiter"},{"id":"d","text":"Mercury"}]'::jsonb, 'b', 'Mars appears red because of iron oxide on its surface.', 25, 15000, 'alpha-1'),
  ('Logic', 'medium', 'If all glims are blue and some blue things are fast, what must be true?', '[{"id":"a","text":"All glims are fast"},{"id":"b","text":"Some glims may be fast"},{"id":"c","text":"No glims are fast"},{"id":"d","text":"All fast things are glims"}]'::jsonb, 'b', 'The premises allow overlap but do not require every glim to be fast.', 60, 15000, 'alpha-1'),
  ('History', 'medium', 'Which ancient civilization built Machu Picchu?', '[{"id":"a","text":"Maya"},{"id":"b","text":"Inca"},{"id":"c","text":"Roman"},{"id":"d","text":"Phoenician"}]'::jsonb, 'b', 'Machu Picchu was built by the Inca civilization.', 60, 15000, 'alpha-1'),
  ('Language', 'hard', 'Which word is closest in meaning to “lucid”?', '[{"id":"a","text":"Clear"},{"id":"b","text":"Heavy"},{"id":"c","text":"Hidden"},{"id":"d","text":"Noisy"}]'::jsonb, 'a', 'Lucid means clear, especially in thought or expression.', 140, 12000, 'alpha-1'),
  ('Strategy', 'hard', 'In a constrained choice, what is the safest first move?', '[{"id":"a","text":"Maximize risk"},{"id":"b","text":"Gather information"},{"id":"c","text":"Ignore the state"},{"id":"d","text":"Repeat blindly"}]'::jsonb, 'b', 'Information improves later decisions without spending the whole risk budget.', 140, 12000, 'alpha-1')
on conflict do nothing;
