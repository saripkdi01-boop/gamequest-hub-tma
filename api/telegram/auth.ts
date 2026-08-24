import type { IncomingMessage, ServerResponse } from "node:http";
import { upsertTelegramPlayer } from "../../server/db";
import { TelegramValidationError, verifyTelegramInitData } from "../../server/telegram";
import { getGameDashboard } from "../../server/game/service";

type ApiRequest = IncomingMessage & { body?: unknown };

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.end(JSON.stringify(body));
}

async function readBody(request: ApiRequest): Promise<Record<string, unknown>> {
  if (request.body && typeof request.body === "object") return request.body as Record<string, unknown>;
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) as Record<string, unknown> : {};
}

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed" });

  try {
    const body = await readBody(request);
    const initData = typeof body.initData === "string" ? body.initData : "";
    const user = verifyTelegramInitData(initData);
    const player = await upsertTelegramPlayer(user);
    return sendJson(response, 200, { player, dashboard: await getGameDashboard(player) });
  } catch (error) {
    const status = error instanceof TelegramValidationError ? 401 : 503;
    return sendJson(response, status, { error: status === 401 ? "Invalid Telegram authentication data" : "Player profile is temporarily unavailable" });
  }
}
