import type { Express, Request, Response } from "express";
import { authenticateGameRequest, gameErrorStatus, sendJson } from "./http";
import { getGameDashboard, getLeaderboard, startGenesisRun, submitGenesisChoice } from "./service";

function adapt(request: Request) {
  return request as unknown as Parameters<typeof authenticateGameRequest>[0];
}

export function registerGameRoutes(app: Express) {
  app.post("/api/game/dashboard", async (request: Request, response: Response) => {
    try {
      const { player } = await authenticateGameRequest(adapt(request));
      const dashboard = await getGameDashboard(player);
      response.status(200).json({ dashboard });
    } catch (error) {
      const { status, message } = gameErrorStatus(error);
      response.status(status).json({ error: message });
    }
  });

  app.post("/api/game/genesis/start", async (request: Request, response: Response) => {
    try {
      const { player, body } = await authenticateGameRequest(adapt(request));
      const run = await startGenesisRun(player, body);
      response.status(200).json({ run });
    } catch (error) {
      const { status, message } = gameErrorStatus(error);
      response.status(status).json({ error: message });
    }
  });

  app.post("/api/game/genesis/choice", async (request: Request, response: Response) => {
    try {
      const { player, body } = await authenticateGameRequest(adapt(request));
      const run = await submitGenesisChoice(player, body);
      response.status(200).json({ run });
    } catch (error) {
      const { status, message } = gameErrorStatus(error);
      response.status(status).json({ error: message });
    }
  });

  app.get("/api/game/leaderboard", async (_request: Request, response: Response) => {
    try {
      const leaderboard = await getLeaderboard();
      response.status(200).json({ leaderboard });
    } catch (error) {
      const { status, message } = gameErrorStatus(error);
      response.status(status).json({ error: message });
    }
  });
}
