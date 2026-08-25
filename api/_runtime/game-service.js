// api/_lib/game/service.ts
import { randomUUID } from "node:crypto";
import { z } from "zod";

// api/_lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// api/_lib/game/engine.ts
var GENESIS_CHECKPOINTS = [
  { index: 0, title: "The Signal Ridge", narrative: "A fractured beacon is broadcasting from the ridge. Choose how to approach its unstable signal.", choices: [{ id: "scan", title: "Scan the beacon", description: "Map the safe route before moving.", momentum: 2 }, { id: "rush", title: "Rush the ridge", description: "Move fast and claim the high ground.", momentum: 1 }, { id: "salvage", title: "Salvage nearby parts", description: "Trade speed for a sturdier path.", momentum: 0 }] },
  { index: 1, title: "The Glass Crossing", narrative: "The route divides over a field of mirrored glass. Every move changes the map ahead.", choices: [{ id: "anchor", title: "Set an anchor line", description: "A deliberate route keeps the team steady.", momentum: 2 }, { id: "drift", title: "Follow the light", description: "A fast route, but the terrain may shift.", momentum: 1 }, { id: "detour", title: "Take the quiet detour", description: "Lose time to preserve your resources.", momentum: 0 }] },
  { index: 2, title: "The Relic Gate", narrative: "The gate opens for a Pathfinder willing to commit to a final approach.", choices: [{ id: "align", title: "Align the signal", description: "Use the route data to open the gate precisely.", momentum: 2 }, { id: "override", title: "Override the lock", description: "Force a quick opening at moderate risk.", momentum: 1 }, { id: "stabilize", title: "Stabilize the core", description: "Protect the route before taking the relic.", momentum: 0 }] }
];
function initialGenesisProgress() {
  return { checkpointIndex: 0, momentum: 0, history: [] };
}
function checkpointFor(progress) {
  return GENESIS_CHECKPOINTS[progress.checkpointIndex] ?? null;
}
function resolveChoice(seed, progress, choiceId) {
  const checkpoint = checkpointFor(progress);
  if (!checkpoint) throw new Error("No checkpoint is available");
  const choice = checkpoint.choices.find((item) => item.id === choiceId);
  if (!choice) throw new Error("Invalid checkpoint choice");
  const deterministicRisk = hashSeed(`${seed}:${checkpoint.index}:${choiceId}`) % 3 - 1;
  const momentum = progress.momentum + choice.momentum + deterministicRisk;
  return { checkpointIndex: progress.checkpointIndex + 1, momentum, history: [...progress.history, { checkpoint: checkpoint.index, choiceId, momentum }] };
}
function hashSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function calculateLevel(experience) {
  return Math.floor(Math.sqrt(Math.max(0, experience) / 100)) + 1;
}
function experienceToNextLevel(experience) {
  const nextLevel = calculateLevel(experience) + 1;
  return Math.max(0, (nextLevel - 1) ** 2 * 100 - experience);
}

// api/_lib/game/guide-service.ts
var GUIDE_IDS = ["nexus", "pocket", "tonbit", "crosslink", "neura", "sosialis", "shieldtma", "pixelx", "speedrun", "legenda"];
var GUIDE_META = [
  { id: "nexus", name: "NEXUS", codename: "The Pathfinder", rarity: "common", role: "Route command" },
  { id: "pocket", name: "POCKET", codename: "The Battery", rarity: "rare", role: "Energy reserve" },
  { id: "tonbit", name: "TONBIT", codename: "The Broker", rarity: "epic", role: "Stars utility" },
  { id: "crosslink", name: "CROSSLINK", codename: "The Relay", rarity: "rare", role: "Route efficiency" },
  { id: "neura", name: "NEURA", codename: "The Oracle", rarity: "epic", role: "Mind analysis" },
  { id: "sosialis", name: "SOSIALIS", codename: "The Signal", rarity: "rare", role: "Referral network" },
  { id: "shieldtma", name: "SHIELDTMA", codename: "The Warden", rarity: "epic", role: "Streak defense" },
  { id: "pixelx", name: "PIXELX", codename: "The Miner", rarity: "epic", role: "Quest Coin output" },
  { id: "speedrun", name: "SPEEDRUN", codename: "The Runner", rarity: "rare", role: "Fast progression" },
  { id: "legenda", name: "LEGENDA", codename: "The Crown", rarity: "legendary", role: "Nexus mastery" }
];
function isGuideId(value) {
  return typeof value === "string" && GUIDE_IDS.includes(value);
}
function parseBenefit(value, guideId) {
  const raw = value ?? {};
  return {
    guideId,
    rarity: raw.rarity ?? "common",
    xpMultiplier: Number(raw.xpMultiplier ?? 1),
    qcMultiplier: Number(raw.qcMultiplier ?? 1),
    mindMultiplier: Number(raw.mindMultiplier ?? 1),
    maxEnergyBonus: Number(raw.maxEnergyBonus ?? 0),
    starsBonusPercent: raw.starsBonusPercent == null ? void 0 : Number(raw.starsBonusPercent),
    energyCostMultiplier: raw.energyCostMultiplier == null ? void 0 : Number(raw.energyCostMultiplier),
    referralBonusPercent: raw.referralBonusPercent == null ? void 0 : Number(raw.referralBonusPercent),
    streakProtection: raw.streakProtection == null ? void 0 : Number(raw.streakProtection),
    label: String(raw.label ?? "Quest Nexus guide benefit")
  };
}
async function benefitsFor(guideId) {
  const { data, error } = await getSupabaseServerClient().rpc("get_guide_benefits", { p_guide_id: guideId });
  if (error || !data) throw new Error(error?.message ?? "GUIDE_BENEFITS_UNAVAILABLE");
  return parseBenefit(data, guideId);
}
async function getGuideState(player) {
  const supabase = getSupabaseServerClient();
  const { error: nexusError } = await supabase.from("player_guides").upsert({ player_id: player.id, guide_id: "nexus", level: 1 }, { onConflict: "player_id,guide_id", ignoreDuplicates: true });
  if (nexusError) throw new Error(nexusError.message);
  const [{ data: ownedRows, error: ownedError }, benefits] = await Promise.all([
    supabase.from("player_guides").select("guide_id,level").eq("player_id", player.id),
    Promise.all(GUIDE_IDS.map(benefitsFor))
  ]);
  if (ownedError) throw new Error(ownedError.message);
  const owned = new Map((ownedRows ?? []).map((row) => [String(row.guide_id), Number(row.level ?? 1)]));
  const activeGuideId = isGuideId(player.activeGuideId) ? player.activeGuideId : "nexus";
  return {
    activeGuideId,
    unlockCostRelics: 50,
    benefits: benefits.find((item) => item.guideId === activeGuideId) ?? benefits[0],
    guides: GUIDE_META.map((meta) => ({
      ...meta,
      owned: owned.has(meta.id),
      level: owned.get(meta.id) ?? 0,
      benefit: benefits.find((item) => item.guideId === meta.id) ?? benefits[0]
    }))
  };
}
function getDailyLoginState(player) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const streakDay = Math.max(0, Math.min(7, player.dailyLoginStreak));
  const claimedToday = player.dailyLoginLastDay === today;
  const nextDay = claimedToday ? Math.min(7, Math.max(1, streakDay)) : player.dailyLoginLastDay === new Date(Date.now() - 864e5).toISOString().slice(0, 10) ? Math.min(7, streakDay + 1) : 1;
  const rewardTrack = [1, 2, 3, 4, 5, 6, 10];
  return { streakDay, claimedToday, nextRewardRelics: rewardTrack[nextDay - 1], rewardTrack };
}

// api/_lib/game/service.ts
var startQuestSchema = z.object({ questSlug: z.literal("genesis-run") });
var choiceSchema = z.object({ runId: z.string().uuid(), choiceId: z.string().min(1).max(32) });
function todayUtc() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function asProgress(value) {
  const parsed = z.object({
    checkpointIndex: z.number().int().min(0).max(3),
    momentum: z.number().int(),
    history: z.array(z.object({ checkpoint: z.number().int(), choiceId: z.string(), momentum: z.number().int() }))
  }).safeParse(value);
  return parsed.success ? parsed.data : initialGenesisProgress();
}
async function getGameDashboard(player) {
  const supabase = getSupabaseServerClient();
  const [{ data: quest, error: questError }, { data: activeRun, error: runError }, { data: daily, error: dailyError }, { data: inventory, error: inventoryError }, guideState] = await Promise.all([
    supabase.from("quests").select("id,title,description,reward_xp,reward_relics").eq("slug", "genesis-run").eq("active", true).single(),
    supabase.from("player_quests").select("id,status,progress_json,quest_id").eq("player_id", player.id).eq("status", "active").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("daily_player_stats").select("completed_quests,rewarded_ads_count,correct_answers,qc_emitted,daily_score").eq("player_id", player.id).eq("day_utc", todayUtc()).maybeSingle(),
    supabase.from("player_item_inventory").select("item_key,quantity").eq("player_id", player.id).order("item_key", { ascending: true }),
    getGuideState(player)
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
      activeGuideId: guideState.activeGuideId
    },
    genesisRun: {
      id: activeRun?.id ?? null,
      status: activeRun?.status ?? "available",
      title: quest.title,
      description: quest.description,
      rewardXp: quest.reward_xp,
      rewardRelics: quest.reward_relics,
      checkpointIndex: progress.checkpointIndex
    },
    daily: { completedQuests: daily?.completed_quests ?? 0, rewardedAdsCount: daily?.rewarded_ads_count ?? 0, correctAnswers: daily?.correct_answers ?? 0, qcEmitted: daily?.qc_emitted ?? 0, dailyScore: daily?.daily_score ?? 0 },
    guideState,
    dailyLogin: getDailyLoginState(player),
    inventory: (inventory ?? []).map((item) => ({ itemKey: item.item_key, quantity: item.quantity }))
  };
}
async function startGenesisRun(player, rawInput) {
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
async function createGenesisRun(playerId, questId) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("player_quests").insert({
    player_id: playerId,
    quest_id: questId,
    status: "active",
    seed: randomUUID(),
    progress_json: initialGenesisProgress(),
    started_at: (/* @__PURE__ */ new Date()).toISOString()
  }).select("id,status,seed,progress_json,quest_id").single();
  if (error || !data) {
    if (error?.code === "23505") return startExistingRun(playerId, questId);
    throw new Error(error?.message ?? "Unable to start Genesis Run");
  }
  return data;
}
async function startExistingRun(playerId, questId) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("player_quests").select("id,status,seed,progress_json,quest_id").eq("player_id", playerId).eq("quest_id", questId).eq("status", "active").single();
  if (error || !data) throw new Error(error?.message ?? "Unable to retrieve existing Genesis Run");
  return data;
}
async function submitGenesisChoice(player, rawInput) {
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
  const { error: progressError } = await supabase.from("player_quests").update({ progress_json: nextProgress, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", run.id).eq("status", "active");
  if (progressError) throw new Error(progressError.message);
  if (!isFinalCheckpoint) return { runId: run.id, status: "active", checkpoint: checkpointFor(nextProgress), momentum: nextProgress.momentum };
  const { data: result, error: completionError } = await supabase.rpc("complete_genesis_run", { p_run_id: run.id, p_player_id: player.id, p_idempotency_prefix: `genesis:${run.id}` });
  if (completionError || !result) throw new Error(completionError?.message ?? "Unable to complete Genesis Run");
  const completed = result;
  return {
    runId: run.id,
    status: "completed",
    checkpoint: null,
    momentum: nextProgress.momentum,
    result: { success: true, experience: completed.experience, level: completed.level, relics: completed.relics, xpAwarded: completed.xpAwarded, relicsAwarded: completed.relicsAwarded }
  };
}
async function getLeaderboard(limit = 20) {
  const supabase = getSupabaseServerClient();
  const { data: rows, error } = await supabase.from("leaderboard_snapshots").select("player_id,score,rank").eq("season_id", "alpha-1").order("score", { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  const ids = (rows ?? []).map((row) => row.player_id);
  if (ids.length === 0) return [];
  const { data: players, error: playersError } = await supabase.from("gamequest_players").select("id,first_name,username,level,photo_url").in("id", ids);
  if (playersError) throw new Error(playersError.message);
  const playerById = new Map((players ?? []).map((player) => [player.id, player]));
  return (rows ?? []).map((row, index) => ({
    rank: index + 1,
    score: row.score,
    player: playerById.get(row.player_id) ?? { first_name: "Pathfinder", username: null, level: 1 }
  }));
}
export {
  getGameDashboard,
  getLeaderboard,
  startGenesisRun,
  submitGenesisChoice
};
