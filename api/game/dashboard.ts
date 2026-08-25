import type { ServerResponse } from "node:http";
import { authenticateGameRequest, gameErrorStatus, sendJson } from "../_runtime/game-http.js";
import type { ApiRequest } from "../_lib/game/http";
import { getGameDashboard } from "../_runtime/game-service.js";
import { getPlayerProfile, updatePlayerLanguage } from "../_runtime/profile-service.js";
import { createStarsInvoiceLink } from "../_lib/game/stars-service";

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed" });
  try {
    const { player, body } = await authenticateGameRequest(request);
    if (body.action === "profile") return sendJson(response, 200, await getPlayerProfile(player));
    if (body.action === "language") return sendJson(response, 200, { preference: await updatePlayerLanguage(player, body) });
    if (body.action === "stars_invoice") return sendJson(response, 200, { invoice: await createStarsInvoiceLink(player, body) });
    return sendJson(response, 200, { dashboard: await getGameDashboard(player) });
  } catch (error) {
    const { status, message } = gameErrorStatus(error);
    return sendJson(response, status, { error: message });
  }
}
