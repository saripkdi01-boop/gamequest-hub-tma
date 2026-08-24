// api/_lib/telegram.ts
import { createHmac, timingSafeEqual } from "node:crypto";
var TelegramValidationError = class extends Error {
};
function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
function verifyWebhookSecret(receivedSecret, expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET) {
  return Boolean(receivedSecret && expectedSecret && safeCompare(receivedSecret, expectedSecret));
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
async function sendTelegramMessage(chatId, text, webAppUrl = process.env.TELEGRAM_WEB_APP_URL) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("Telegram bot token is not configured");
  const payload = { chat_id: chatId, text };
  if (webAppUrl) payload.reply_markup = { inline_keyboard: [[{ text: "Open GameQuest Hub", web_app: { url: webAppUrl } }]] };
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.description ?? "Unable to send Telegram message");
}
function commandFrom(text) {
  const command = text.trim().split(/\s+/, 1)[0]?.toLowerCase().split("@", 1)[0];
  if (command === "/start") return "start";
  if (command === "/run") return "run";
  return null;
}
async function handleTelegramUpdate(update) {
  const text = update.message?.text;
  if (!text || !update.message) {
    console.info("[Telegram] update ignored: no text message");
    return { handled: false };
  }
  const command = commandFrom(text);
  if (!command) {
    console.info("[Telegram] update ignored: unsupported command");
    return { handled: false };
  }
  const message = command === "run" ? "Your Genesis Run is ready. Open GameQuest Hub to continue your active route." : "Welcome to GameQuest Hub. Your first quest is waiting\u2014open the Mini App to begin.";
  await sendTelegramMessage(update.message.chat.id, message);
  console.info(`[Telegram] reply sent for /${command}`);
  return { handled: true };
}
export {
  TelegramValidationError,
  handleTelegramUpdate,
  sendTelegramMessage,
  verifyTelegramInitData,
  verifyWebhookSecret
};
