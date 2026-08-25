import type { ServerResponse } from "node:http";
import { authenticateGameRequest, gameErrorStatus, sendJson } from "../_runtime/game-http.js";
import type { ApiRequest } from "../_lib/game/http";
import { getGameDashboard } from "../_runtime/game-service.js";
import { getPlayerProfile, updatePlayerLanguage } from "../_runtime/profile-service.js";
import { createStarsInvoiceLink, getPublicStarsCatalog } from "../_runtime/game-stars-service.js";
import { claimDailyLogin, getGuideState, regenerateEnergy, selectGuide, unlockGuideWithRelics } from "../_runtime/game-guide-service.js";

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed" });
  try {
    const { player, body } = await authenticateGameRequest(request);
    if (body.action === "profile") return sendJson(response, 200, await getPlayerProfile(player));
    if (body.action === "language") return sendJson(response, 200, { preference: await updatePlayerLanguage(player, body) });
    if (body.action === "stars_invoice") return sendJson(response, 200, { invoice: await createStarsInvoiceLink(player, body) });
    if (body.action === "stars_catalog") return sendJson(response, 200, { catalog: getPublicStarsCatalog() });
    if (body.action === "guide_state") return sendJson(response, 200, { guideState: await getGuideState(player) });
    if (body.action === "select_guide") return sendJson(response, 200, { selection: await selectGuide(player, body.guideId) });
    if (body.action === "unlock_guide_relics") return sendJson(response, 200, { unlock: await unlockGuideWithRelics(player, body.guideId) });
    if (body.action === "claim_daily_login") return sendJson(response, 200, { claim: await claimDailyLogin(player) });
    if (body.action === "regenerate_energy") return sendJson(response, 200, { energy: await regenerateEnergy(player) });
    return sendJson(response, 200, { dashboard: await getGameDashboard(player) });
  } catch (error) {
    const { status, message } = gameErrorStatus(error);
    return sendJson(response, status, { error: message });
  }
}
