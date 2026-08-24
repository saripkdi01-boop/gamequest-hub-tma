// api/_lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
function toGameQuestPlayer(row) {
  return { id: String(row.id), telegramUserId: Number(row.telegram_user_id), username: row.username ? String(row.username) : null, firstName: String(row.first_name), lastName: row.last_name ? String(row.last_name) : null, languageCode: row.language_code ? String(row.language_code) : null, photoUrl: row.photo_url ? String(row.photo_url) : null, level: Number(row.level), experience: Number(row.experience), questStreak: Number(row.quest_streak), relics: Number(row.relics), playerStatus: row.player_status, createdAt: String(row.created_at), updatedAt: String(row.updated_at), lastSeenAt: String(row.last_seen_at) };
}
async function upsertGameQuestPlayer(player) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const { data, error } = await getSupabaseServerClient().from("gamequest_players").upsert({ telegram_user_id: player.id, first_name: player.first_name, last_name: player.last_name ?? null, username: player.username ?? null, language_code: player.language_code ?? null, photo_url: player.photo_url ?? null, last_seen_at: now, updated_at: now }, { onConflict: "telegram_user_id" }).select().single();
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
