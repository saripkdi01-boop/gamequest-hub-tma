export type QuizMode = "know" | "bluff" | "chain" | "boss" | "world";

export type PublicQuestion = {
  id: string;
  category: string;
  difficulty: "easy" | "medium" | "hard" | "boss";
  question: string;
  answers: Array<{ id: string; text: string }>;
  timeLimitMs: number;
  sequence: number;
  sessionId: string;
  expiresAt: string;
};

export type Profile = {
  id: string;
  telegramUserId: number;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  languageCode: string | null;
  preferredLanguage: string;
  playerStatus: "new" | "active" | "inactive";
  createdAt: string;
  lastSeenAt: string;
  stats: {
    level: number;
    experience: number;
    experienceToNextLevel: number;
    questStreak: number;
    relics: number;
    questCoins: number;
    mindScore: number;
    dailyScore: number;
    energy: number;
    comboBest: number;
  };
  rank: { seasonId: string; rank: number | null; score: number };
};

export type ProfileResponse = { profile: Profile; dashboard: Dashboard };

export type Dashboard = {
  player: {
    id: string;
    firstName: string;
    username: string | null;
    level: number;
    experience: number;
    experienceToNextLevel: number;
    questStreak: number;
    relics: number;
    questCoins: number;
    mindScore: number;
    dailyScore: number;
    energy: number;
    comboBest: number;
  };
  genesisRun: {
    id: string | null;
    status: "available" | "active" | "completed" | "failed";
    title: string;
    description: string;
    rewardXp: number;
    rewardRelics: number;
    checkpointIndex: number;
  };
  daily: { completedQuests: number; rewardedAdsCount: number; correctAnswers?: number; qcEmitted?: number };
};

export type Run = {
  runId: string;
  status: "active" | "completed" | "failed";
  momentum: number;
  checkpoint: null | { index: number; title: string; narrative: string; choices: Array<{ id: string; title: string; description: string; momentum: number }> };
  result?: { success: boolean; xpAwarded: number; relicsAwarded: number; level: number; experience: number; relics: number };
};

export type QuizStart = {
  session: { id: string; mode: QuizMode; expiresAt: string; questionCount: number; energy: number };
  question: PublicQuestion;
};

export type QuizAnswer = {
  sessionId: string;
  mode: QuizMode;
  duplicate: boolean;
  result: {
    correct: boolean;
    qcAwarded: number;
    xpAwarded: number;
    mindScoreAwarded: number;
    combo: number;
    sequence: number;
    explanation: string;
    serverResponseMs: number | null;
    fraudScore: number;
    sessionCompleted: boolean;
  };
  question: PublicQuestion | null;
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

export function getProfile(initData?: string) {
  return request<ProfileResponse>("/api/game/profile", initData);
}

export function updateLanguage(initData: string | undefined, language: string) {
  return request<{ preference: { language: string } }>("/api/game/profile", initData, { action: "language", language });
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

export function startQuiz(initData: string | undefined, mode: QuizMode) {
  return request<{ quiz: QuizStart }>("/api/game/quiz/start", initData, { mode });
}

export function submitQuizAnswer(initData: string | undefined, sessionId: string, answerId: string, clientResponseMs: number) {
  return request<{ quiz: QuizAnswer }>("/api/game/quiz/answer", initData, { sessionId, answerId, clientResponseMs });
}

export type LeaderboardRow = { rank: number; score: number; player: { id?: string; first_name: string; username: string | null; level: number; photo_url?: string | null } };

export async function getLeaderboard(season = "alpha-1") {
  const response = await fetch(`/api/game/leaderboard?season=${encodeURIComponent(season)}`, { headers: { accept: "application/json" } });
  const data = await response.json() as GameResponse<{ leaderboard: LeaderboardRow[]; season: string }>;
  if (!response.ok) throw new Error(data.error ?? "Leaderboard unavailable");
  return data;
}
