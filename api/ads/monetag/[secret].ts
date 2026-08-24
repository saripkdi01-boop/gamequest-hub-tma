import type { ServerResponse } from "node:http";
import { processMonetagPostback } from "../../../server/game/ad-service";
import { sendJson, type ApiRequest } from "../../../server/game/http";

type DynamicRequest = ApiRequest & { query?: Record<string, string | string[] | undefined>; url?: string };

export default async function handler(request: DynamicRequest, response: ServerResponse) {
  if (request.method !== "GET") return sendJson(response, 405, { error: "Method not allowed" });
  const secret = request.query?.secret ?? new URL(request.url ?? "/", "https://gamequest.invalid").pathname.split("/").pop();
  const value = Array.isArray(secret) ? secret[0] : secret;
  if (!process.env.MONETAG_POSTBACK_PATH_SECRET || value !== process.env.MONETAG_POSTBACK_PATH_SECRET) return sendJson(response, 404, { error: "Not found" });
  const query = request.query ?? Object.fromEntries(new URL(request.url ?? "/", "https://gamequest.invalid").searchParams.entries());
  try {
    await processMonetagPostback(query);
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    console.error("[Monetag] Postback processing failed", error);
    return sendJson(response, 400, { error: "Invalid postback" });
  }
}
