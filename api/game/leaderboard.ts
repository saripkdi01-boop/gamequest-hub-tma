import type { IncomingMessage, ServerResponse } from "node:http";
import { gameErrorStatus, sendJson } from "../_lib/game/http";
import { getLeaderboard } from "../_lib/game/service";

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== "GET") return sendJson(response, 405, { error: "Method not allowed" });
  try {
    return sendJson(response, 200, { leaderboard: await getLeaderboard() });
  } catch (error) {
    const { status, message } = gameErrorStatus(error);
    return sendJson(response, status, { error: message });
  }
}
