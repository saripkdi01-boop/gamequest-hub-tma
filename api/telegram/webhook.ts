import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import { answerStarsPreCheckout, recordStarsSuccessfulPayment } from "../_runtime/game-stars-service.js";

type TelegramUpdate = {
  message?: { text?: string; chat?: { id?: number }; from?: { id?: number }; successful_payment?: { invoice_payload?: string; telegram_payment_charge_id?: string; total_amount?: number; currency?: string } };
  pre_checkout_query?: { id: string; from?: { id?: number }; currency?: string; total_amount?: number; invoice_payload?: string };
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
    ? "Your Genesis Run is ready. Tap the Menu button below to continue your active route."
    : "Welcome to GameQuest Hub. Tap the Menu button below to begin your first quest.";
  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
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
    if (update.pre_checkout_query) {
      await answerStarsPreCheckout(update.pre_checkout_query);
      console.info("[Telegram] answered Stars pre-checkout query");
      return sendJson(response, 200, { ok: true });
    }
    if (update.message?.successful_payment) {
      const paymentResult = await recordStarsSuccessfulPayment({ from: update.message.from, successful_payment: update.message.successful_payment });
      console.info(`[Telegram] recorded Stars payment ${paymentResult.orderId ?? "rejected"}`);
      return sendJson(response, 200, { ok: true });
    }
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
