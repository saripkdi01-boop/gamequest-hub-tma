// server/game/profile-service.ts
import { z as z2 } from "zod";

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";

// shared/languages.ts
var SUPPORTED_LANGUAGES = [
  { code: "en", telegramCodes: ["en"], name: "English", nativeName: "English", flag: "EN" },
  { code: "id", telegramCodes: ["id"], name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "ID" },
  { code: "es", telegramCodes: ["es"], name: "Spanish", nativeName: "Espa\xF1ol", flag: "ES" },
  { code: "fr", telegramCodes: ["fr"], name: "French", nativeName: "Fran\xE7ais", flag: "FR" },
  { code: "de", telegramCodes: ["de"], name: "German", nativeName: "Deutsch", flag: "DE" },
  { code: "pt", telegramCodes: ["pt", "pt-br"], name: "Portuguese", nativeName: "Portugu\xEAs", flag: "PT" },
  { code: "ru", telegramCodes: ["ru"], name: "Russian", nativeName: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", flag: "RU" },
  { code: "zh", telegramCodes: ["zh", "zh-hans", "zh-hant"], name: "Chinese", nativeName: "\u4E2D\u6587", flag: "ZH" },
  { code: "ja", telegramCodes: ["ja"], name: "Japanese", nativeName: "\u65E5\u672C\u8A9E", flag: "JA" },
  { code: "ko", telegramCodes: ["ko"], name: "Korean", nativeName: "\uD55C\uAD6D\uC5B4", flag: "KO" },
  { code: "ar", telegramCodes: ["ar"], name: "Arabic", nativeName: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "AR" },
  { code: "hi", telegramCodes: ["hi"], name: "Hindi", nativeName: "\u0939\u093F\u0928\u094D\u0926\u0940", flag: "HI" },
  { code: "tr", telegramCodes: ["tr"], name: "Turkish", nativeName: "T\xFCrk\xE7e", flag: "TR" },
  { code: "it", telegramCodes: ["it"], name: "Italian", nativeName: "Italiano", flag: "IT" },
  { code: "nl", telegramCodes: ["nl"], name: "Dutch", nativeName: "Nederlands", flag: "NL" },
  { code: "pl", telegramCodes: ["pl"], name: "Polish", nativeName: "Polski", flag: "PL" },
  { code: "uk", telegramCodes: ["uk"], name: "Ukrainian", nativeName: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430", flag: "UA" },
  { code: "vi", telegramCodes: ["vi"], name: "Vietnamese", nativeName: "Ti\u1EBFng Vi\u1EC7t", flag: "VI" },
  { code: "th", telegramCodes: ["th"], name: "Thai", nativeName: "\u0E44\u0E17\u0E22", flag: "TH" },
  { code: "ms", telegramCodes: ["ms"], name: "Malay", nativeName: "Bahasa Melayu", flag: "MS" },
  { code: "fil", telegramCodes: ["fil"], name: "Filipino", nativeName: "Filipino", flag: "PH" },
  { code: "sw", telegramCodes: ["sw"], name: "Swahili", nativeName: "Kiswahili", flag: "SW" },
  { code: "fa", telegramCodes: ["fa"], name: "Persian", nativeName: "\u0641\u0627\u0631\u0633\u06CC", flag: "FA" },
  { code: "bn", telegramCodes: ["bn"], name: "Bengali", nativeName: "\u09AC\u09BE\u0982\u09B2\u09BE", flag: "BN" }
];
function isSupportedLanguage(value) {
  return typeof value === "string" && SUPPORTED_LANGUAGES.some((language) => language.code === value);
}

// server/supabase.ts
function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// server/game/service.ts
import { z } from "zod";

// server/game/engine.ts
function initialGenesisProgress() {
  return { checkpointIndex: 0, momentum: 0, history: [] };
}
function calculateLevel(experience) {
  return Math.floor(Math.sqrt(Math.max(0, experience) / 100)) + 1;
}
function experienceToNextLevel(experience) {
  const nextLevel = calculateLevel(experience) + 1;
  return Math.max(0, (nextLevel - 1) ** 2 * 100 - experience);
}

// api/_lib/supabase.ts
import { createClient as createClient2 } from "@supabase/supabase-js";
function getSupabaseServerClient2() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createClient2(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
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
  const { data, error } = await getSupabaseServerClient2().rpc("get_guide_benefits", { p_guide_id: guideId });
  if (error || !data) throw new Error(error?.message ?? "GUIDE_BENEFITS_UNAVAILABLE");
  return parseBenefit(data, guideId);
}
async function getGuideState(player) {
  const supabase = getSupabaseServerClient2();
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

// server/game/service.ts
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

// server/game/profile-service.ts
var languageSchema = z2.object({ language: z2.custom(isSupportedLanguage, "Unsupported language") });
async function getPlayerProfile(player) {
  const supabase = getSupabaseServerClient();
  const [{ data: ranking, error: rankingError }, dashboard] = await Promise.all([
    supabase.from("leaderboard_snapshots").select("season_id,rank,score").eq("season_id", "alpha-1").eq("player_id", player.id).maybeSingle(),
    getGameDashboard(player)
  ]);
  if (rankingError) throw new Error(rankingError.message);
  return {
    profile: {
      id: player.id,
      telegramUserId: player.telegramUserId,
      firstName: player.firstName,
      lastName: player.lastName,
      username: player.username,
      photoUrl: player.photoUrl,
      languageCode: player.languageCode,
      preferredLanguage: player.preferredLanguage,
      playerStatus: player.playerStatus,
      createdAt: player.createdAt,
      lastSeenAt: player.lastSeenAt,
      stats: {
        level: player.level,
        experience: player.experience,
        experienceToNextLevel: dashboard.player.experienceToNextLevel,
        questStreak: player.questStreak,
        relics: player.relics,
        questCoins: player.questCoins,
        mindScore: player.mindScore,
        dailyScore: player.dailyScore,
        energy: player.energy,
        maxEnergy: dashboard.player.maxEnergy,
        comboBest: player.comboBest,
        activeGuideId: dashboard.guideState.activeGuideId,
        dailyLoginStreak: dashboard.dailyLogin.streakDay,
        dailyLoginClaimedToday: dashboard.dailyLogin.claimedToday,
        guideBenefitLabel: dashboard.guideState.benefits.label
      },
      rank: { seasonId: ranking?.season_id ?? "alpha-1", rank: ranking?.rank ?? null, score: Number(ranking?.score ?? player.experience) }
    },
    dashboard
  };
}
async function updatePlayerLanguage(player, rawInput) {
  const { language } = languageSchema.parse(rawInput);
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("gamequest_players").update({ preferred_language: language, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", player.id).select().single();
  if (error || !data) throw new Error(error?.message ?? "Unable to save language preference");
  return { player: { ...player, preferredLanguage: language }, language };
}
export {
  getPlayerProfile,
  updatePlayerLanguage
};
