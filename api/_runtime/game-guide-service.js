// api/_lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are not configured");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// api/_lib/game/guide-service.ts
var GUIDE_IDS = ["nexus", "pocket", "tonbit", "crosslink", "neura", "sosialis", "shieldtma", "pixelx", "speedrun", "legenda"];
var GUIDE_META = [
  { id: "nexus", name: "NEXUS", codename: "The Pathfinder", rarity: "common", role: "Route command" },
  { id: "pocket", name: "POCKET", codename: "The Battery", rarity: "rare", role: "Energy reserve" },
  { id: "tonbit", name: "TONBIT", codename: "The Broker", rarity: "epic", role: "Stars utility" },
  { id: "crosslink", name: "CROSSLINK", codename: "The Relay", rarity: "rare", role: "Route efficiency" },
  { id: "neura", name: "NEURA", codename: "The Oracle", rarity: "epic", role: "Mind analysis" },
  { id: "sosialis", name: "SOSIALIS", codename: "The Signal", rarity: "rare", role: "Referral network" },
  { id: "shieldtma", name: "SHIELDTMA", codename: "The Warden", rarity: "epic", role: "Streak defense" },
  { id: "pixelx", name: "PIXELX", codename: "The Miner", rarity: "epic", role: "Quest Coin output" },
  { id: "speedrun", name: "SPEEDRUN", codename: "The Runner", rarity: "rare", role: "Fast progression" },
  { id: "legenda", name: "LEGENDA", codename: "The Crown", rarity: "legendary", role: "Nexus mastery" }
];
function isGuideId(value) {
  return typeof value === "string" && GUIDE_IDS.includes(value);
}
function parseBenefit(value, guideId) {
  const raw = value ?? {};
  return {
    guideId,
    rarity: raw.rarity ?? "common",
    xpMultiplier: Number(raw.xpMultiplier ?? 1),
    qcMultiplier: Number(raw.qcMultiplier ?? 1),
    mindMultiplier: Number(raw.mindMultiplier ?? 1),
    maxEnergyBonus: Number(raw.maxEnergyBonus ?? 0),
    starsBonusPercent: raw.starsBonusPercent == null ? void 0 : Number(raw.starsBonusPercent),
    energyCostMultiplier: raw.energyCostMultiplier == null ? void 0 : Number(raw.energyCostMultiplier),
    referralBonusPercent: raw.referralBonusPercent == null ? void 0 : Number(raw.referralBonusPercent),
    streakProtection: raw.streakProtection == null ? void 0 : Number(raw.streakProtection),
    label: String(raw.label ?? "Quest Nexus guide benefit")
  };
}
async function benefitsFor(guideId) {
  const { data, error } = await getSupabaseServerClient().rpc("get_guide_benefits", { p_guide_id: guideId });
  if (error || !data) throw new Error(error?.message ?? "GUIDE_BENEFITS_UNAVAILABLE");
  return parseBenefit(data, guideId);
}
async function getGuideState(player) {
  const supabase = getSupabaseServerClient();
  const { error: nexusError } = await supabase.from("player_guides").upsert({ player_id: player.id, guide_id: "nexus", level: 1 }, { onConflict: "player_id,guide_id", ignoreDuplicates: true });
  if (nexusError) throw new Error(nexusError.message);
  const [{ data: ownedRows, error: ownedError }, benefits] = await Promise.all([
    supabase.from("player_guides").select("guide_id,level").eq("player_id", player.id),
    Promise.all(GUIDE_IDS.map(benefitsFor))
  ]);
  if (ownedError) throw new Error(ownedError.message);
  const owned = new Map((ownedRows ?? []).map((row) => [String(row.guide_id), Number(row.level ?? 1)]));
  const activeGuideId = isGuideId(player.activeGuideId) ? player.activeGuideId : "nexus";
  return {
    activeGuideId,
    unlockCostRelics: 50,
    benefits: benefits.find((item) => item.guideId === activeGuideId) ?? benefits[0],
    guides: GUIDE_META.map((meta) => ({
      ...meta,
      owned: owned.has(meta.id),
      level: owned.get(meta.id) ?? 0,
      benefit: benefits.find((item) => item.guideId === meta.id) ?? benefits[0]
    }))
  };
}
async function selectGuide(player, guideId) {
  if (!isGuideId(guideId)) throw new Error("GUIDE_NOT_FOUND");
  const { data, error } = await getSupabaseServerClient().rpc("select_guide", { p_player_id: player.id, p_guide_id: guideId });
  if (error || !data) throw new Error(error?.message ?? "GUIDE_SELECTION_FAILED");
  return { activeGuideId: guideId, benefits: parseBenefit(data.benefits, guideId) };
}
async function unlockGuideWithRelics(player, guideId) {
  if (!isGuideId(guideId) || guideId === "nexus") throw new Error("GUIDE_NOT_UNLOCKABLE");
  const { data, error } = await getSupabaseServerClient().rpc("unlock_guide_relics", { p_player_id: player.id, p_guide_id: guideId });
  if (error || !data) throw new Error(error?.message ?? "GUIDE_UNLOCK_FAILED");
  return data;
}
async function claimDailyLogin(player) {
  const { data, error } = await getSupabaseServerClient().rpc("claim_daily_login", { p_player_id: player.id });
  if (error || !data) throw new Error(error?.message ?? "DAILY_LOGIN_UNAVAILABLE");
  return data;
}
async function regenerateEnergy(player) {
  const { data, error } = await getSupabaseServerClient().rpc("regenerate_energy", { p_player_id: player.id });
  if (error || !data) throw new Error(error?.message ?? "ENERGY_RECOVERY_UNAVAILABLE");
  return data;
}
function getDailyLoginState(player) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const streakDay = Math.max(0, Math.min(7, player.dailyLoginStreak));
  const claimedToday = player.dailyLoginLastDay === today;
  const nextDay = claimedToday ? Math.min(7, Math.max(1, streakDay)) : player.dailyLoginLastDay === new Date(Date.now() - 864e5).toISOString().slice(0, 10) ? Math.min(7, streakDay + 1) : 1;
  const rewardTrack = [1, 2, 3, 4, 5, 6, 10];
  return { streakDay, claimedToday, nextRewardRelics: rewardTrack[nextDay - 1], rewardTrack };
}
export {
  GUIDE_IDS,
  claimDailyLogin,
  getDailyLoginState,
  getGuideState,
  regenerateEnergy,
  selectGuide,
  unlockGuideWithRelics
};
