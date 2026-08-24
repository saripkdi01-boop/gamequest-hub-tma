import type { Express, Request, Response } from "express";
import { createDailyBonusIntent, processMonetagPostback } from "./ad-service";
import { authenticateGameRequest, gameErrorStatus } from "./http";

export function registerAdRoutes(app: Express) {
  app.post("/api/game/ads/intent", async (request: Request, response: Response) => {
    try {
      const { player, body } = await authenticateGameRequest(request as never);
      response.status(200).json({ intent: await createDailyBonusIntent(player, body) });
    } catch (error) {
      const { status, message } = gameErrorStatus(error);
      response.status(status).json({ error: message });
    }
  });

  app.get("/api/ads/monetag/:secret", async (request: Request, response: Response) => {
    if (!process.env.MONETAG_POSTBACK_PATH_SECRET || request.params.secret !== process.env.MONETAG_POSTBACK_PATH_SECRET) return response.sendStatus(404);
    try {
      await processMonetagPostback(request.query);
      response.sendStatus(200);
    } catch (error) {
      console.error("[Monetag] Postback processing failed", error);
      response.sendStatus(400);
    }
  });
}
