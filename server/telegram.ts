import { createHmac, timingSafeEqual } from "node:crypto";

export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type TelegramUpdate = {
  update_id: number;
  message?: {
    text?: string;
    chat: { id: number };
  };
};

type TelegramApiResponse = { ok: boolean; description?: string };

export class TelegramValidationError extends Error {}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyWebhookSecret(receivedSecret: string | undefined, expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET): boolean {
  return Boolean(receivedSecret && expectedSecret && safeCompare(receivedSecret, expectedSecret));
}

export function verifyTelegramInitData(initData: string, botToken = process.env.TELEGRAM_BOT_TOKEN, nowSeconds = Math.floor(Date.now() / 1000)): TelegramUser {
  if (!botToken) throw new TelegramValidationError("Telegram bot token is not configured");
  if (!initData) throw new TelegramValidationError("Missing initData");

  const parameters = new URLSearchParams(initData);
  const receivedHash = parameters.get("hash");
  const authDate = Number(parameters.get("auth_date"));
  const serializedUser = parameters.get("user");

  if (!receivedHash || !serializedUser || !Number.isFinite(authDate)) {
    throw new TelegramValidationError("Malformed initData");
  }

  if (authDate > nowSeconds + 60 || nowSeconds - authDate > 86_400) {
    throw new TelegramValidationError("Expired initData");
  }

  const dataCheckString = Array.from(parameters.entries())
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (!safeCompare(computedHash, receivedHash)) {
    throw new TelegramValidationError("Invalid initData signature");
  }

  try {
    const user = JSON.parse(serializedUser) as TelegramUser;
    if (!Number.isSafeInteger(user.id) || !user.first_name) throw new Error("Invalid user");
    return user;
  } catch {
    throw new TelegramValidationError("Invalid user payload");
  }
}

export async function sendTelegramMessage(chatId: number, text: string, webAppUrl = process.env.TELEGRAM_WEB_APP_URL): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("Telegram bot token is not configured");

  const payload: Record<string, unknown> = { chat_id: chatId, text };
  if (webAppUrl) {
    payload.reply_markup = {
      inline_keyboard: [[{ text: "Open GameQuest Hub", web_app: { url: webAppUrl } }]],
    };
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json() as TelegramApiResponse;
  if (!response.ok || !result.ok) throw new Error(result.description ?? "Unable to send Telegram message");
}

export async function handleTelegramUpdate(update: TelegramUpdate): Promise<{ handled: boolean }> {
  const text = update.message?.text?.trim();
  if (!text || !update.message) {
    console.info("[Telegram] update ignored: no text message");
    return { handled: false };
  }

  const command = text.split(/\s+/, 1)[0]?.toLowerCase().split("@", 1)[0];
  if (command !== "/start" && command !== "/run") {
    console.info("[Telegram] update ignored: unsupported command");
    return { handled: false };
  }

  await sendTelegramMessage(
    update.message.chat.id,
    command === "/run"
      ? "Your Genesis Run is ready. Open GameQuest Hub to continue your active route."
      : "Welcome to GameQuest Hub. Your first quest is waiting—open the Mini App to begin.",
  );
  console.info(`[Telegram] reply sent for ${command}`);
  return { handled: true };
}
