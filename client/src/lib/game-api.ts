export type Dashboard = {
  player: { id: string; firstName: string; username: string | null; level: number; experience: number; experienceToNextLevel: number; questStreak: number; relics: number };
  genesisRun: { id: string | null; status: "available" | "active" | "completed" | "failed"; title: string; description: string; rewardXp: number; rewardRelics: number; checkpointIndex: number };
  daily: { completedQuests: number; rewardedAdsCount: number };
};

export type Run = {
  runId: string;
  status: "active" | "completed" | "failed";
  momentum: number;
  checkpoint: null | { index: number; title: string; narrative: string; choices: Array<{ id: string; title: string; description: string; momentum: number }> };
  result?: { success: boolean; xpAwarded: number; relicsAwarded: number; level: number; experience: number; relics: number };
};

type GameResponse<T> = T & { error?: string };

async function request<T>(path: string, initData?: string, payload?: Record<string, unknown>): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...(payload ?? {}), initData }),
  });
  const data = await response.json() as GameResponse<T>;
  if (!response.ok) throw new Error(data.error ?? "Game request failed");
  return data as T;
}

export function getDashboard(initData?: string) {
  return request<{ dashboard: Dashboard }>("/api/game/dashboard", initData);
}

export function startGenesisRun(initData?: string) {
  return request<{ run: Run }>("/api/game/genesis/start", initData, { questSlug: "genesis-run" });
}

export function submitGenesisChoice(initData: string | undefined, runId: string, choiceId: string) {
  return request<{ run: Run }>("/api/game/genesis/choice", initData, { runId, choiceId });
}

export async function getLeaderboard() {
  const response = await fetch("/api/game/leaderboard", { headers: { accept: "application/json" } });
  const data = await response.json() as GameResponse<{ leaderboard: Array<{ rank: number; score: number; player: { first_name: string; username: string | null; level: number } }> }>;
  if (!response.ok) throw new Error(data.error ?? "Leaderboard unavailable");
  return data.leaderboard;
}
