import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getSupabaseServerClient, type GameQuestPlayer } from "../supabase";
import { checkpointFor, experienceToNextLevel, initialGenesisProgress, resolveChoice } from "./engine";
import type { GameDashboard, GenesisProgress, QuestStatus, RunUpdate } from "./types";
import { getDailyLoginState, getGuideState } from "./guide-service";

const startQuestSchema = z.object({ questSlug: z.literal("genesis-run") });
const choiceSchema = z.object({ runId: z.string().uuid(), choiceId: z.string().min(1).max(32) });

type QuestRow = { id: string; title: string; description: string; reward_xp: number; reward_relics: number };
type RunRow = { id: string; status: QuestStatus; seed: string | null; progress_json: GenesisProgress; quest_id: string };

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function asProgress(value: unknown): GenesisProgress {
  const parsed = z.object({
    checkpointIndex: z.number().int().min(0).max(3),
    momentum: z.number().int(),
    history: z.array(z.object({ checkpoint: z.number().int(), choiceId: z.string(), momentum: z.number().int() })),
  }).safeParse(value);
  return parsed.success ? parsed.data : initialGenesisProgress();
}

export async function getGameDashboard(player: GameQuestPlayer): Promise<GameDashboard> {
  const supabase = getSupabaseServerClient();
  const [{ data: quest, error: questError }, { data: activeRun, error: runError }, { data: daily, error: dailyError }, { data: inventory, error: inventoryError }, guideState] = await Promise.all([
    supabase.from("quests").select("id,title,description,reward_xp,reward_relics").eq("slug", "genesis-run").eq("active", true).single(),
    supabase.from("player_quests").select("id,status,progress_json,quest_id").eq("player_id", player.id).eq("status", "active").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("daily_player_stats").select("completed_quests,rewarded_ads_count,correct_answers,qc_emitted,daily_score").eq("player_id", player.id).eq("day_utc", todayUtc()).maybeSingle(),
    supabase.from("player_item_inventory").select("item_key,quantity").eq("player_id", player.id).order("item_key", { ascending: true }),
    getGuideState(player),
  ]);
  if (questError || !quest) throw new Error(questError?.message ?? "Genesis Run is unavailable");
  if (runError || dailyError || inventoryError) throw new Error(runError?.message ?? dailyError?.message ?? inventoryError?.message ?? "Unable to load game state");
  const progress = activeRun ? asProgress(activeRun.progress_json) : initialGenesisProgress();
  return {
    player: {
      id: player.id,
      firstName: player.firstName,
      username: player.username,
      level: player.level,
      experience: player.experience,
      experienceToNextLevel: experienceToNextLevel(player.experience),
      questStreak: player.questStreak,
      relics: player.relics,
      questCoins: player.questCoins,
      mindScore: player.mindScore,
      dailyScore: player.dailyScore,
      energy: player.energy,
      maxEnergy: 10 + guideState.benefits.maxEnergyBonus,
      comboBest: player.comboBest,
      activeGuideId: guideState.activeGuideId,
    },
    genesisRun: {
      id: activeRun?.id ?? null,
      status: activeRun?.status ?? "available",
      title: quest.title,
      description: quest.description,
      rewardXp: quest.reward_xp,
      rewardRelics: quest.reward_relics,
      checkpointIndex: progress.checkpointIndex,
    },
    daily: { completedQuests: daily?.completed_quests ?? 0, rewardedAdsCount: daily?.rewarded_ads_count ?? 0, correctAnswers: daily?.correct_answers ?? 0, qcEmitted: daily?.qc_emitted ?? 0, dailyScore: daily?.daily_score ?? 0 },
    guideState,
    dailyLogin: getDailyLoginState(player),
    inventory: (inventory ?? []).map(item => ({ itemKey: item.item_key, quantity: item.quantity })),
  };
}

export async function startGenesisRun(player: GameQuestPlayer, rawInput: unknown): Promise<RunUpdate> {
  startQuestSchema.parse(rawInput);
  const supabase = getSupabaseServerClient();
  const { data: quest, error: questError } = await supabase.from("quests").select("id").eq("slug", "genesis-run").eq("active", true).single();
  if (questError || !quest) throw new Error("Genesis Run is unavailable");
  const { data: existing, error: existingError } = await supabase.from("player_quests").select("id,status,seed,progress_json,quest_id").eq("player_id", player.id).eq("quest_id", quest.id).eq("status", "active").maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (!existing) {
    const { data: daily, error: dailyError } = await supabase.from("daily_player_stats").select("completed_quests").eq("player_id", player.id).eq("day_utc", todayUtc()).maybeSingle();
    if (dailyError) throw new Error(dailyError.message);
    if ((daily?.completed_quests ?? 0) >= 1) throw new Error("Genesis Run has already been completed today");
  }
  const run = existing ?? await createGenesisRun(player.id, quest.id);
  const progress = asProgress(run.progress_json);
  return { runId: run.id, status: run.status, checkpoint: checkpointFor(progress), momentum: progress.momentum };
}

async function createGenesisRun(playerId: string, questId: string): Promise<RunRow> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("player_quests").insert({
    player_id: playerId,
    quest_id: questId,
    status: "active",
    seed: randomUUID(),
    progress_json: initialGenesisProgress(),
    started_at: new Date().toISOString(),
  }).select("id,status,seed,progress_json,quest_id").single();
  if (error || !data) {
    if (error?.code === "23505") return startExistingRun(playerId, questId);
    throw new Error(error?.message ?? "Unable to start Genesis Run");
  }
  return data as RunRow;
}

async function startExistingRun(playerId: string, questId: string): Promise<RunRow> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("player_quests").select("id,status,seed,progress_json,quest_id").eq("player_id", playerId).eq("quest_id", questId).eq("status", "active").single();
  if (error || !data) throw new Error(error?.message ?? "Unable to retrieve existing Genesis Run");
  return data as RunRow;
}

export async function submitGenesisChoice(player: GameQuestPlayer, rawInput: unknown): Promise<RunUpdate> {
  const input = choiceSchema.parse(rawInput);
  const supabase = getSupabaseServerClient();
  const { data: run, error: runError } = await supabase.from("player_quests").select("id,status,seed,progress_json,quest_id").eq("id", input.runId).eq("player_id", player.id).single();
  if (runError || !run) throw new Error("Quest run not found");
  const currentProgress = asProgress(run.progress_json);
  if (run.status === "completed") {
    return { runId: run.id, status: "completed", checkpoint: null, momentum: currentProgress.momentum, result: { success: true, experience: player.experience, level: player.level, relics: player.relics, xpAwarded: 0, relicsAwarded: 0 } };
  }
  if (run.status !== "active" || !run.seed) throw new Error("Quest run is no longer active");
  const nextProgress = resolveChoice(run.seed, currentProgress, input.choiceId);
  const isFinalCheckpoint = nextProgress.checkpointIndex === 3;
  const { error: progressError } = await supabase.from("player_quests").update({ progress_json: nextProgress, updated_at: new Date().toISOString() }).eq("id", run.id).eq("status", "active");
  if (progressError) throw new Error(progressError.message);

  if (!isFinalCheckpoint) return { runId: run.id, status: "active", checkpoint: checkpointFor(nextProgress), momentum: nextProgress.momentum };
  const { data: result, error: completionError } = await supabase.rpc("complete_genesis_run", { p_run_id: run.id, p_player_id: player.id, p_idempotency_prefix: `genesis:${run.id}` });
  if (completionError || !result) throw new Error(completionError?.message ?? "Unable to complete Genesis Run");
  const completed = result as { experience: number; level: number; relics: number; xpAwarded: number; relicsAwarded: number };
  return {
    runId: run.id,
    status: "completed",
    checkpoint: null,
    momentum: nextProgress.momentum,
    result: { success: true, experience: completed.experience, level: completed.level, relics: completed.relics, xpAwarded: completed.xpAwarded, relicsAwarded: completed.relicsAwarded },
  };
}

export async function getLeaderboard(limit = 20) {
  const supabase = getSupabaseServerClient();
  const { data: rows, error } = await supabase.from("leaderboard_snapshots").select("player_id,score,rank").eq("season_id", "alpha-1").order("score", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  const ids = (rows ?? []).map(row => row.player_id);
  if (ids.length === 0) return [];
  const { data: players, error: playersError } = await supabase.from("gamequest_players").select("id,first_name,username,level,photo_url").in("id", ids);
  if (playersError) throw new Error(playersError.message);
  const playerById = new Map((players ?? []).map(player => [player.id, player]));
  return (rows ?? []).map((row, index) => ({
    rank: index + 1,
    score: row.score,
    player: playerById.get(row.player_id) ?? { first_name: "Pathfinder", username: null, level: 1 },
  }));
}
