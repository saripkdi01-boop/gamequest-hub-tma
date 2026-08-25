import type { IncomingMessage, ServerResponse } from "node:http";
import { ZodError } from "zod";
import { upsertGameQuestPlayer } from "../supabase";
import { TelegramValidationError, verifyTelegramInitData } from "../telegram";
import type { GameQuestPlayer } from "../supabase";

export type ApiRequest = IncomingMessage & { body?: unknown };

export function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.end(JSON.stringify(body));
}

export async function readJsonBody(request: ApiRequest): Promise<Record<string, unknown>> {
  if (request.body && typeof request.body === "object") return request.body as Record<string, unknown>;
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text.trim()) return {};
  try { return JSON.parse(text) as Record<string, unknown>; }
  catch { throw new SyntaxError("Malformed request body"); }
}

export async function authenticateGameRequest(request: ApiRequest): Promise<{ player: GameQuestPlayer; body: Record<string, unknown> }> {
  const body = await readJsonBody(request);
  const initData = typeof body.initData === "string" ? body.initData : "";
  const telegramUser = verifyTelegramInitData(initData);
  const player = await upsertGameQuestPlayer(telegramUser);
  return { player, body };
}

export function gameErrorStatus(error: unknown): { status: number; message: string } {
  if (error instanceof TelegramValidationError) return { status: 401, message: "Invalid Telegram authentication data" };
  if (error instanceof ZodError) return { status: 400, message: "Invalid game request" };
  if (error instanceof SyntaxError) return { status: 400, message: "Malformed request body" };
  const message = error instanceof Error ? error.message : "Game service is unavailable";
  if (/invalid json|malformed request body/i.test(message)) return { status: 400, message: "Malformed request body" };
  if (/not found|unavailable|not active|invalid|already|daily|cooling down/i.test(message)) return { status: 409, message };
  return { status: 503, message: "Game service is temporarily unavailable" };
}
