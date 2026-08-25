import type { Express, Request, Response } from "express";
import { authenticateGameRequest, gameErrorStatus, sendJson } from "./http";
import { getGameDashboard, getLeaderboard, startGenesisRun, submitGenesisChoice } from "./service";
import { startQuiz, submitQuizAnswer } from "./quiz-service";
import { getPlayerProfile, updatePlayerLanguage } from "./profile-service";

function adapt(request: Request) {
  return request as unknown as Parameters<typeof authenticateGameRequest>[0];
}

export function registerGameRoutes(app: Express) {
  app.post("/api/game/profile", async (request: Request, response: Response) => {
    try {
      const { player, body } = await authenticateGameRequest(adapt(request));
      if (body.action === "language") {
        response.status(200).json({ preference: await updatePlayerLanguage(player, body) });
        return;
      }
      response.status(200).json(await getPlayerProfile(player));
    } catch (error) {
      const { status, message } = gameErrorStatus(error);
      response.status(status).json({ error: message });
    }
  });

  app.post("/api/game/profile/language", async (request: Request, response: Response) => {
    try {
      const { player, body } = await authenticateGameRequest(adapt(request));
      response.status(200).json({ preference: await updatePlayerLanguage(player, body) });
    } catch (error) {
      const { status, message } = gameErrorStatus(error);
      response.status(status).json({ error: message });
    }
  });

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

  app.post("/api/game/quiz/start", async (request: Request, response: Response) => {
    try {
      const { player, body } = await authenticateGameRequest(adapt(request));
      const quiz = await startQuiz(player, body);
      response.status(200).json({ quiz });
    } catch (error) {
      const { status, message } = gameErrorStatus(error);
      response.status(status).json({ error: message });
    }
  });

  app.post("/api/game/quiz/answer", async (request: Request, response: Response) => {
    try {
      const { player, body } = await authenticateGameRequest(adapt(request));
      const quiz = await submitQuizAnswer(player, body);
      response.status(200).json({ quiz });
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
