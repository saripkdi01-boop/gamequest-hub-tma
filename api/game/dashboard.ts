import type { ServerResponse } from "node:http";
import { authenticateGameRequest, gameErrorStatus, sendJson, type ApiRequest } from "../../server/game/http";
import { getGameDashboard } from "../../server/game/service";

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed" });
  try {
    const { player } = await authenticateGameRequest(request);
    return sendJson(response, 200, { dashboard: await getGameDashboard(player) });
  } catch (error) {
    const { status, message } = gameErrorStatus(error);
    return sendJson(response, status, { error: message });
  }
}
