// api/_lib/game/http.ts
import { ZodError } from "zod";

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

// api/_lib/telegram.ts
import { createHmac, timingSafeEqual } from "node:crypto";
var TelegramValidationError = class extends Error {
};
function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
function verifyTelegramInitData(initData, botToken = process.env.TELEGRAM_BOT_TOKEN, nowSeconds = Math.floor(Date.now() / 1e3)) {
  if (!botToken) throw new TelegramValidationError("Telegram bot token is not configured");
  if (!initData) throw new TelegramValidationError("Missing initData");
  const parameters = new URLSearchParams(initData);
  const receivedHash = parameters.get("hash");
  const authDate = Number(parameters.get("auth_date"));
  const serializedUser = parameters.get("user");
  if (!receivedHash || !serializedUser || !Number.isFinite(authDate)) throw new TelegramValidationError("Malformed initData");
  if (authDate > nowSeconds + 60 || nowSeconds - authDate > 86400) throw new TelegramValidationError("Expired initData");
  const dataCheckString = Array.from(parameters.entries()).filter(([key]) => key !== "hash").sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${key}=${value}`).join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  if (!safeCompare(computedHash, receivedHash)) throw new TelegramValidationError("Invalid initData signature");
  try {
    const user = JSON.parse(serializedUser);
    if (!Number.isSafeInteger(user.id) || !user.first_name) throw new Error("Invalid user");
    return user;
  } catch {
    throw new TelegramValidationError("Invalid user payload");
  }
}

// api/_lib/game/http.ts
function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.end(JSON.stringify(body));
}
async function readJsonBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}
async function authenticateGameRequest(request) {
  const body = await readJsonBody(request);
  const initData = typeof body.initData === "string" ? body.initData : "";
  const player = await upsertGameQuestPlayer(verifyTelegramInitData(initData));
  return { player, body };
}
function gameErrorStatus(error) {
  if (error instanceof TelegramValidationError) return { status: 401, message: "Invalid Telegram authentication data" };
  if (error instanceof ZodError) return { status: 400, message: "Invalid game request" };
  if (error instanceof SyntaxError) return { status: 400, message: "Malformed request body" };
  const message = error instanceof Error ? error.message : "Game service is unavailable";
  if (/not found|unavailable|not active|invalid|already|daily|cooling down/i.test(message)) return { status: 409, message };
  return { status: 503, message: "Game service is temporarily unavailable" };
}
export {
  authenticateGameRequest,
  gameErrorStatus,
  readJsonBody,
  sendJson
};
