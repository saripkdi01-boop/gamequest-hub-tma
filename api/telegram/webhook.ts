import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

type TelegramUpdate = {
  message?: { text?: string; chat?: { id?: number } };
};

type ApiRequest = IncomingMessage & { body?: unknown };

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

function safeCompare(left: string | undefined, right: string | undefined): boolean {
  if (!left || !right) return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

async function readBody(request: ApiRequest): Promise<TelegramUpdate> {
  if (request.body && typeof request.body === "object") return request.body as TelegramUpdate;
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as TelegramUpdate;
}

function commandFrom(text: string | undefined): "start" | "run" | null {
  const command = text?.trim().split(/\s+/, 1)[0]?.toLowerCase().split("@", 1)[0];
  if (command === "/start") return "start";
  if (command === "/run") return "run";
  return null;
}

async function sendCommandReply(chatId: number, command: "start" | "run") {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("Telegram bot token is not configured");

  const text = command === "run"
    ? "Your Genesis Run is ready. Open GameQuest Hub to continue your active route."
    : "Welcome to GameQuest Hub. Your first quest is waiting—open the Mini App to begin.";
  const webAppUrl = process.env.TELEGRAM_WEB_APP_URL || "https://gamequest-hub-tma.vercel.app";
  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: { inline_keyboard: [[{ text: "Open GameQuest Hub", web_app: { url: webAppUrl } }]] },
    }),
  });
  const payload = await telegramResponse.json() as { ok?: boolean; description?: string };
  if (!telegramResponse.ok || !payload.ok) throw new Error(payload.description ?? "Unable to send Telegram reply");
}

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed" });
  const secret = request.headers["x-telegram-bot-api-secret-token"];
  const receivedSecret = Array.isArray(secret) ? secret[0] : secret;
  if (!safeCompare(receivedSecret, process.env.TELEGRAM_WEBHOOK_SECRET)) return sendJson(response, 401, { error: "Unauthorized webhook" });

  try {
    const update = await readBody(request);
    const command = commandFrom(update.message?.text);
    const chatId = update.message?.chat?.id;
    if (!command || !chatId) {
      console.info("[Telegram] webhook accepted non-command update");
      return sendJson(response, 200, { ok: true });
    }

    await sendCommandReply(chatId, command);
    console.info(`[Telegram] webhook replied to /${command}`);
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    console.error("[Telegram] Webhook handler error", error);
    return sendJson(response, 500, { error: "Webhook processing failed" });
  }
}
