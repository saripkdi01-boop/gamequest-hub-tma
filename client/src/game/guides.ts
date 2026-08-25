export const guideIds = [
  "nexus",
  "pocket",
  "tonbit",
  "crosslink",
  "neura",
  "sosialis",
  "shieldtma",
  "pixelx",
  "speedrun",
  "legenda",
] as const;

export type GuideId = (typeof guideIds)[number];

export type Guide = {
  id: GuideId;
  name: string;
  role: string;
  affinity: string;
  protocol: string;
  description: string;
  primary: string;
  secondary: string;
  form: "guardian" | "console" | "orb" | "scout" | "mist" | "link" | "warden" | "prism" | "runner" | "crown";
  unlock: "available" | "seasonal";
  economyFeature?: "vip" | "season" | "referral" | "wallet";
};

export const guides: readonly Guide[] = [
  { id: "nexus", name: "NEXUS", role: "Gatekeeper", affinity: "Identity & entry", protocol: "Anchor Protocol", description: "A luminous sentinel who aligns every run with a trusted route.", primary: "#4ce0c4", secondary: "#8de4ff", form: "guardian", unlock: "available" },
  { id: "pocket", name: "POCKET", role: "Living Console", affinity: "Hub & loadout", protocol: "Quick Stack", description: "A compact command deck that turns choices into a clear field plan.", primary: "#a994ff", secondary: "#de99ff", form: "console", unlock: "available" },
  { id: "tonbit", name: "TONBIT", role: "Web3 Conduit", affinity: "Vault & shop", protocol: "Pulse Ledger", description: "A crystal signal keeper for value systems that must remain verified.", primary: "#f5b942", secondary: "#ff9a6e", form: "orb", unlock: "available", economyFeature: "wallet" },
  { id: "crosslink", name: "CROSSLINK", role: "Cross-Realm Scout", affinity: "Genesis routes", protocol: "Route Shift", description: "A multi-device explorer who maps resilient paths through the unknown.", primary: "#50e3c2", secondary: "#4e9aff", form: "scout", unlock: "available" },
  { id: "neura", name: "NEURA", role: "Cognitive Guide", affinity: "Mind arena", protocol: "Mind Lattice", description: "A shifting intelligence that turns pattern recognition into tactical focus.", primary: "#efb1ff", secondary: "#a994ff", form: "mist", unlock: "available" },
  { id: "sosialis", name: "SOSIALIS", role: "Signal Weaver", affinity: "Groups & referral", protocol: "Echo Link", description: "A network of friendly signals designed for cooperative challenges.", primary: "#ff9a6e", secondary: "#ffd169", form: "link", unlock: "available", economyFeature: "referral" },
  { id: "shieldtma", name: "SHIELDTMA", role: "Account Warden", affinity: "Profile & security", protocol: "Guardian Seal", description: "A protective operator who represents the trust boundary around every player.", primary: "#8de4ff", secondary: "#94d8a6", form: "warden", unlock: "available" },
  { id: "pixelx", name: "PIXELX", role: "Achievement Architect", affinity: "Rank & visual growth", protocol: "Rank Bloom", description: "A prism-shaped evolution of every visible milestone and leaderboard climb.", primary: "#51d7ff", secondary: "#d7fb70", form: "prism", unlock: "available" },
  { id: "speedrun", name: "SPEEDRUN", role: "Momentum Runner", affinity: "Daily quest", protocol: "Tempo Burst", description: "A fast route specialist built for decisive daily operations.", primary: "#ff745f", secondary: "#f5b942", form: "runner", unlock: "available" },
  { id: "legenda", name: "LEGENDA", role: "Season Beacon", affinity: "Season finale", protocol: "Crown Vector", description: "A floating standard for the achievements players choose to pursue.", primary: "#f7d774", secondary: "#fff0b2", form: "crown", unlock: "seasonal", economyFeature: "season" },
] as const;

export function isGuideId(value: string | null | undefined): value is GuideId {
  return Boolean(value && guideIds.includes(value as GuideId));
}

export function getGuide(id: GuideId | string | null | undefined): Guide {
  return guides.find((guide) => guide.id === id) ?? guides[0];
}
