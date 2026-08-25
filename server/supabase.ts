import { createClient } from "@supabase/supabase-js";
import { languageFromTelegramCode, type LanguageCode } from "../shared/languages";

export type TelegramPlayerInput = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type GameQuestPlayer = {
  id: string;
  telegramUserId: number;
  username: string | null;
  firstName: string;
  lastName: string | null;
  languageCode: string | null;
  photoUrl: string | null;
  level: number;
  experience: number;
  questStreak: number;
  relics: number;
  questCoins: number;
  mindScore: number;
  dailyScore: number;
  energy: number;
  comboBest: number;
  preferredLanguage: LanguageCode;
  playerStatus: "new" | "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
};

export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured");

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function toGameQuestPlayer(row: Record<string, unknown>): GameQuestPlayer {
  return {
    id: String(row.id),
    telegramUserId: Number(row.telegram_user_id),
    username: row.username ? String(row.username) : null,
    firstName: String(row.first_name),
    lastName: row.last_name ? String(row.last_name) : null,
    languageCode: row.language_code ? String(row.language_code) : null,
    photoUrl: row.photo_url ? String(row.photo_url) : null,
    level: Number(row.level),
    experience: Number(row.experience),
    questStreak: Number(row.quest_streak),
    relics: Number(row.relics),
    questCoins: Number(row.quest_coins ?? 0),
    mindScore: Number(row.mind_score ?? 0),
    dailyScore: Number(row.daily_score ?? 0),
    energy: Number(row.energy ?? 10),
    comboBest: Number(row.combo_best ?? 0),
    preferredLanguage: languageFromTelegramCode(row.preferred_language ? String(row.preferred_language) : String(row.language_code ?? "en")),
    playerStatus: row.player_status as GameQuestPlayer["playerStatus"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    lastSeenAt: String(row.last_seen_at),
  };
}

export async function upsertGameQuestPlayer(player: TelegramPlayerInput): Promise<GameQuestPlayer> {
  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("gamequest_players")
    .upsert({
      telegram_user_id: player.id,
      first_name: player.first_name,
      last_name: player.last_name ?? null,
      username: player.username ?? null,
      language_code: player.language_code ?? null,
      photo_url: player.photo_url ?? null,
      preferred_language: languageFromTelegramCode(player.language_code),
      last_seen_at: now,
      updated_at: now,
    }, { onConflict: "telegram_user_id" })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Unable to persist Telegram player");
  return toGameQuestPlayer(data);
}

export async function checkGameQuestPlayersAccess(): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("gamequest_players").select("telegram_user_id").limit(1);
  if (error) throw new Error(error.message);
}
