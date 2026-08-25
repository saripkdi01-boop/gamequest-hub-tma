import { authenticateGameRequest, gameErrorStatus, sendJson } from "../../_runtime/game-http.js";
import { submitQuizAnswer } from "../../_runtime/quiz-service.js";

export default async function handler(request: import("../../_lib/game/http").ApiRequest, response: import("node:http").ServerResponse) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }
  try {
    const { player, body } = await authenticateGameRequest(request);
    const result = await submitQuizAnswer(player, body);
    sendJson(response, 200, { quiz: result });
  } catch (error) {
    const mapped = gameErrorStatus(error);
    sendJson(response, mapped.status, { error: mapped.message });
  }
}
