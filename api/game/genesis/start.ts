import type { ServerResponse } from "node:http";
import { authenticateGameRequest, gameErrorStatus, sendJson, type ApiRequest } from "../../_lib/game/http";
import { startGenesisRun } from "../../_lib/game/service";

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== "POST") return sendJson(response, 405, { error: "Method not allowed" });
  try {
    const { player, body } = await authenticateGameRequest(request);
    return sendJson(response, 200, { run: await startGenesisRun(player, body) });
  } catch (error) {
    const { status, message } = gameErrorStatus(error);
    return sendJson(response, status, { error: message });
  }
}
