import type { ServerResponse } from "node:http";
import { authenticateGameRequest, gameErrorStatus, sendJson } from "../../_runtime/game-http.js";
import type { ApiRequest } from "../../_lib/game/http";
import { updatePlayerLanguage } from "../../_runtime/profile-service.js";

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed" });
  try {
    const { player, body } = await authenticateGameRequest(request);
    return sendJson(response, 200, { preference: await updatePlayerLanguage(player, body) });
  } catch (error) {
    const { status, message } = gameErrorStatus(error);
    return sendJson(response, status, { error: message });
  }
}
