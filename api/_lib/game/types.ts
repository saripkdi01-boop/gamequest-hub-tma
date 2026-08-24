export type GenesisChoice = { id: string; title: string; description: string; momentum: number };
export type GenesisCheckpoint = { index: number; title: string; narrative: string; choices: GenesisChoice[] };
export type GenesisProgress = { checkpointIndex: number; momentum: number; history: Array<{ checkpoint: number; choiceId: string; momentum: number }> };
export type QuestStatus = "active" | "completed" | "abandoned";
export type GameDashboard = { player: { id: string; firstName: string; username: string | null; level: number; experience: number; experienceToNextLevel: number; questStreak: number; relics: number }; genesisRun: { id: string | null; status: QuestStatus | "available"; title: string; description: string; rewardXp: number; rewardRelics: number; checkpointIndex: number }; daily: { completedQuests: number; rewardedAdsCount: number } };
export type RunUpdate = { runId: string; status: QuestStatus; checkpoint: GenesisCheckpoint | null; momentum: number; result?: { success: boolean; xpAwarded: number; relicsAwarded: number; level: number; experience: number; relics: number } };
