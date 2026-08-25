import { getSupabaseServerClient, type GameQuestPlayer } from "../supabase";

export const GUIDE_IDS = ["nexus", "pocket", "tonbit", "crosslink", "neura", "sosialis", "shieldtma", "pixelx", "speedrun", "legenda"] as const;
export type GuideId = (typeof GUIDE_IDS)[number];
export type GuideRarity = "common" | "rare" | "epic" | "legendary";

export type GuideBenefit = {
  guideId: GuideId;
  rarity: GuideRarity;
  xpMultiplier: number;
  qcMultiplier: number;
  mindMultiplier: number;
  maxEnergyBonus: number;
  starsBonusPercent?: number;
  energyCostMultiplier?: number;
  referralBonusPercent?: number;
  streakProtection?: number;
  label: string;
};

export type GuideState = {
  activeGuideId: GuideId;
  unlockCostRelics: number;
  benefits: GuideBenefit;
  guides: Array<{
    id: GuideId;
    name: string;
    codename: string;
    rarity: GuideRarity;
    role: string;
    owned: boolean;
    level: number;
    benefit: GuideBenefit;
  }>;
};

export type DailyLoginState = {
  streakDay: number;
  claimedToday: boolean;
  nextRewardRelics: number;
  rewardTrack: number[];
};

type GuideMeta = Omit<GuideState["guides"][number], "owned" | "level" | "benefit">;

const GUIDE_META: GuideMeta[] = [
  { id: "nexus", name: "NEXUS", codename: "The Pathfinder", rarity: "common", role: "Route command" },
  { id: "pocket", name: "POCKET", codename: "The Battery", rarity: "rare", role: "Energy reserve" },
  { id: "tonbit", name: "TONBIT", codename: "The Broker", rarity: "epic", role: "Stars utility" },
  { id: "crosslink", name: "CROSSLINK", codename: "The Relay", rarity: "rare", role: "Route efficiency" },
  { id: "neura", name: "NEURA", codename: "The Oracle", rarity: "epic", role: "Mind analysis" },
  { id: "sosialis", name: "SOSIALIS", codename: "The Signal", rarity: "rare", role: "Referral network" },
  { id: "shieldtma", name: "SHIELDTMA", codename: "The Warden", rarity: "epic", role: "Streak defense" },
  { id: "pixelx", name: "PIXELX", codename: "The Miner", rarity: "epic", role: "Quest Coin output" },
  { id: "speedrun", name: "SPEEDRUN", codename: "The Runner", rarity: "rare", role: "Fast progression" },
  { id: "legenda", name: "LEGENDA", codename: "The Crown", rarity: "legendary", role: "Nexus mastery" },
];

function isGuideId(value: unknown): value is GuideId {
  return typeof value === "string" && (GUIDE_IDS as readonly string[]).includes(value);
}

function parseBenefit(value: unknown, guideId: GuideId): GuideBenefit {
  const raw = (value ?? {}) as Record<string, unknown>;
  return {
    guideId,
    rarity: (raw.rarity as GuideRarity) ?? "common",
    xpMultiplier: Number(raw.xpMultiplier ?? 1),
    qcMultiplier: Number(raw.qcMultiplier ?? 1),
    mindMultiplier: Number(raw.mindMultiplier ?? 1),
    maxEnergyBonus: Number(raw.maxEnergyBonus ?? 0),
    starsBonusPercent: raw.starsBonusPercent == null ? undefined : Number(raw.starsBonusPercent),
    energyCostMultiplier: raw.energyCostMultiplier == null ? undefined : Number(raw.energyCostMultiplier),
    referralBonusPercent: raw.referralBonusPercent == null ? undefined : Number(raw.referralBonusPercent),
    streakProtection: raw.streakProtection == null ? undefined : Number(raw.streakProtection),
    label: String(raw.label ?? "Quest Nexus guide benefit"),
  };
}

async function benefitsFor(guideId: GuideId): Promise<GuideBenefit> {
  const { data, error } = await getSupabaseServerClient().rpc("get_guide_benefits", { p_guide_id: guideId });
  if (error || !data) throw new Error(error?.message ?? "GUIDE_BENEFITS_UNAVAILABLE");
  return parseBenefit(data, guideId);
}

export async function getGuideState(player: GameQuestPlayer): Promise<GuideState> {
  const supabase = getSupabaseServerClient();
  const { error: nexusError } = await supabase.from("player_guides").upsert({ player_id: player.id, guide_id: "nexus", level: 1 }, { onConflict: "player_id,guide_id", ignoreDuplicates: true });
  if (nexusError) throw new Error(nexusError.message);
  const [{ data: ownedRows, error: ownedError }, benefits] = await Promise.all([
    supabase.from("player_guides").select("guide_id,level").eq("player_id", player.id),
    Promise.all(GUIDE_IDS.map(benefitsFor)),
  ]);
  if (ownedError) throw new Error(ownedError.message);
  const owned = new Map((ownedRows ?? []).map(row => [String(row.guide_id), Number(row.level ?? 1)]));
  const activeGuideId = isGuideId(player.activeGuideId) ? player.activeGuideId : "nexus";
  return {
    activeGuideId,
    unlockCostRelics: 50,
    benefits: benefits.find(item => item.guideId === activeGuideId) ?? benefits[0],
    guides: GUIDE_META.map(meta => ({
      ...meta,
      owned: owned.has(meta.id),
      level: owned.get(meta.id) ?? 0,
      benefit: benefits.find(item => item.guideId === meta.id) ?? benefits[0],
    })),
  };
}

export async function selectGuide(player: GameQuestPlayer, guideId: unknown) {
  if (!isGuideId(guideId)) throw new Error("GUIDE_NOT_FOUND");
  const { data, error } = await getSupabaseServerClient().rpc("select_guide", { p_player_id: player.id, p_guide_id: guideId });
  if (error || !data) throw new Error(error?.message ?? "GUIDE_SELECTION_FAILED");
  return { activeGuideId: guideId, benefits: parseBenefit((data as Record<string, unknown>).benefits, guideId) };
}

export async function unlockGuideWithRelics(player: GameQuestPlayer, guideId: unknown) {
  if (!isGuideId(guideId) || guideId === "nexus") throw new Error("GUIDE_NOT_UNLOCKABLE");
  const { data, error } = await getSupabaseServerClient().rpc("unlock_guide_relics", { p_player_id: player.id, p_guide_id: guideId });
  if (error || !data) throw new Error(error?.message ?? "GUIDE_UNLOCK_FAILED");
  return data as { unlocked: boolean; duplicate: boolean; guideId: GuideId; relics: number };
}

export async function claimDailyLogin(player: GameQuestPlayer) {
  const { data, error } = await getSupabaseServerClient().rpc("claim_daily_login", { p_player_id: player.id });
  if (error || !data) throw new Error(error?.message ?? "DAILY_LOGIN_UNAVAILABLE");
  return data as { claimed: boolean; duplicate: boolean; streakDay: number; rewardRelics: number; relics: number };
}

export async function regenerateEnergy(player: GameQuestPlayer) {
  const { data, error } = await getSupabaseServerClient().rpc("regenerate_energy", { p_player_id: player.id });
  if (error || !data) throw new Error(error?.message ?? "ENERGY_RECOVERY_UNAVAILABLE");
  return data as { energy: number; maxEnergy: number; recovered: number };
}

export function getDailyLoginState(player: GameQuestPlayer): DailyLoginState {
  const today = new Date().toISOString().slice(0, 10);
  const streakDay = Math.max(0, Math.min(7, player.dailyLoginStreak));
  const claimedToday = player.dailyLoginLastDay === today;
  const nextDay = claimedToday ? Math.min(7, Math.max(1, streakDay)) : player.dailyLoginLastDay === new Date(Date.now() - 86400000).toISOString().slice(0, 10) ? Math.min(7, streakDay + 1) : 1;
  const rewardTrack = [1, 2, 3, 4, 5, 6, 10];
  return { streakDay, claimedToday, nextRewardRelics: rewardTrack[nextDay - 1], rewardTrack };
}
