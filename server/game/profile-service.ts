import { z } from "zod";
import { getSupabaseServerClient, type GameQuestPlayer } from "../supabase";
import { getGameDashboard } from "./service";
import { isSupportedLanguage, type LanguageCode } from "../../shared/languages";

const languageSchema = z.object({ language: z.custom<LanguageCode>(isSupportedLanguage, "Unsupported language") });

export type PlayerProfile = {
  id: string;
  telegramUserId: number;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  languageCode: string | null;
  preferredLanguage: LanguageCode;
  playerStatus: GameQuestPlayer["playerStatus"];
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
    maxEnergy: number;
    comboBest: number;
    activeGuideId: string;
    dailyLoginStreak: number;
    dailyLoginClaimedToday: boolean;
    guideBenefitLabel: string;
  };
  rank: { seasonId: string; rank: number | null; score: number };
};

export async function getPlayerProfile(player: GameQuestPlayer): Promise<{ profile: PlayerProfile; dashboard: Awaited<ReturnType<typeof getGameDashboard>> }> {
  const supabase = getSupabaseServerClient();
  const [{ data: ranking, error: rankingError }, dashboard] = await Promise.all([
    supabase.from("leaderboard_snapshots").select("season_id,rank,score").eq("season_id", "alpha-1").eq("player_id", player.id).maybeSingle(),
    getGameDashboard(player),
  ]);
  if (rankingError) throw new Error(rankingError.message);
  return {
    profile: {
      id: player.id,
      telegramUserId: player.telegramUserId,
      firstName: player.firstName,
      lastName: player.lastName,
      username: player.username,
      photoUrl: player.photoUrl,
      languageCode: player.languageCode,
      preferredLanguage: player.preferredLanguage,
      playerStatus: player.playerStatus,
      createdAt: player.createdAt,
      lastSeenAt: player.lastSeenAt,
      stats: {
        level: player.level,
        experience: player.experience,
        experienceToNextLevel: dashboard.player.experienceToNextLevel,
        questStreak: player.questStreak,
        relics: player.relics,
        questCoins: player.questCoins,
        mindScore: player.mindScore,
        dailyScore: player.dailyScore,
        energy: player.energy,
        maxEnergy: dashboard.player.maxEnergy,
        comboBest: player.comboBest,
        activeGuideId: dashboard.guideState.activeGuideId,
        dailyLoginStreak: dashboard.dailyLogin.streakDay,
        dailyLoginClaimedToday: dashboard.dailyLogin.claimedToday,
        guideBenefitLabel: dashboard.guideState.benefits.label,
      },
      rank: { seasonId: ranking?.season_id ?? "alpha-1", rank: ranking?.rank ?? null, score: Number(ranking?.score ?? player.experience) },
    },
    dashboard,
  };
}

export async function updatePlayerLanguage(player: GameQuestPlayer, rawInput: unknown): Promise<{ player: GameQuestPlayer; language: LanguageCode }> {
  const { language } = languageSchema.parse(rawInput);
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("gamequest_players").update({ preferred_language: language, updated_at: new Date().toISOString() }).eq("id", player.id).select().single();
  if (error || !data) throw new Error(error?.message ?? "Unable to save language preference");
  return { player: { ...player, preferredLanguage: language }, language };
}
