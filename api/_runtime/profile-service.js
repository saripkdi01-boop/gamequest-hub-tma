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
  const [{ data: quest, error: questError }, { data: activeRun, error: runError }, { data: daily, error: dailyError }] = await Promise.all([
    supabase.from("quests").select("id,title,description,reward_xp,reward_relics").eq("slug", "genesis-run").eq("active", true).single(),
    supabase.from("player_quests").select("id,status,progress_json,quest_id").eq("player_id", player.id).eq("status", "active").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("daily_player_stats").select("completed_quests,rewarded_ads_count,correct_answers,qc_emitted,daily_score").eq("player_id", player.id).eq("day_utc", todayUtc()).maybeSingle()
  ]);
  if (questError || !quest) throw new Error(questError?.message ?? "Genesis Run is unavailable");
  if (runError || dailyError) throw new Error(runError?.message ?? dailyError?.message ?? "Unable to load game state");
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
      comboBest: player.comboBest
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
    daily: { completedQuests: daily?.completed_quests ?? 0, rewardedAdsCount: daily?.rewarded_ads_count ?? 0, correctAnswers: daily?.correct_answers ?? 0, qcEmitted: daily?.qc_emitted ?? 0, dailyScore: daily?.daily_score ?? 0 }
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
        comboBest: player.comboBest
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
