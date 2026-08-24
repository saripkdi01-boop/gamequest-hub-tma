import type { IncomingMessage, ServerResponse } from "node:http";
import { handleTelegramUpdate, verifyWebhookSecret } from "../_runtime/telegram.js";
import type { TelegramUpdate } from "../_lib/telegram";

type ApiRequest = IncomingMessage & { body?: unknown };

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

async function readBody(request: ApiRequest): Promise<TelegramUpdate> {
  if (request.body && typeof request.body === "object") return request.body as TelegramUpdate;
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as TelegramUpdate;
}

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed" });
  const secret = request.headers["x-telegram-bot-api-secret-token"];
  const receivedSecret = Array.isArray(secret) ? secret[0] : secret;
  if (!verifyWebhookSecret(receivedSecret)) return sendJson(response, 401, { error: "Unauthorized webhook" });

  try {
    await handleTelegramUpdate(await readBody(request));
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    console.error("[Telegram] Webhook handler error", error);
    return sendJson(response, 500, { error: "Webhook processing failed" });
  }
}
