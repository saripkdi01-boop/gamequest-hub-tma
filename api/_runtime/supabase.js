// api/_lib/supabase.ts
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
function languageFromTelegramCode(value) {
  const normalized = value?.toLowerCase();
  const match = SUPPORTED_LANGUAGES.find((language) => language.telegramCodes.some((code) => code === (normalized ?? "")));
  return match?.code ?? "en";
}

// api/_lib/supabase.ts
function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
function toGameQuestPlayer(row) {
  return { id: String(row.id), telegramUserId: Number(row.telegram_user_id), username: row.username ? String(row.username) : null, firstName: String(row.first_name), lastName: row.last_name ? String(row.last_name) : null, languageCode: row.language_code ? String(row.language_code) : null, photoUrl: row.photo_url ? String(row.photo_url) : null, level: Number(row.level), experience: Number(row.experience), questStreak: Number(row.quest_streak), relics: Number(row.relics), questCoins: Number(row.quest_coins ?? 0), mindScore: Number(row.mind_score ?? 0), dailyScore: Number(row.daily_score ?? 0), energy: Number(row.energy ?? 10), comboBest: Number(row.combo_best ?? 0), preferredLanguage: languageFromTelegramCode(row.preferred_language ? String(row.preferred_language) : String(row.language_code ?? "en")), playerStatus: row.player_status, createdAt: String(row.created_at), updatedAt: String(row.updated_at), lastSeenAt: String(row.last_seen_at) };
}
async function upsertGameQuestPlayer(player) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const { data, error } = await getSupabaseServerClient().from("gamequest_players").upsert({ telegram_user_id: player.id, first_name: player.first_name, last_name: player.last_name ?? null, username: player.username ?? null, language_code: player.language_code ?? null, photo_url: player.photo_url ?? null, preferred_language: languageFromTelegramCode(player.language_code), last_seen_at: now, updated_at: now }, { onConflict: "telegram_user_id" }).select().single();
  if (error || !data) throw new Error(error?.message ?? "Unable to persist Telegram player");
  return toGameQuestPlayer(data);
}
async function checkGameQuestPlayersAccess() {
  const { error } = await getSupabaseServerClient().from("gamequest_players").select("telegram_user_id").limit(1);
  if (error) throw new Error(error.message);
}
export {
  checkGameQuestPlayersAccess,
  getSupabaseServerClient,
  upsertGameQuestPlayer
};
