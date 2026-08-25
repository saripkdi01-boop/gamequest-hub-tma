import { ArrowLeft, CircleDollarSign, Gem, Loader2, LockKeyhole, Play, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { type AdQuestPlacement, useMonetagAd } from "@/hooks/useMonetagAd";
import { useI18n, type TranslationKey } from "@/i18n";

const quests: Array<{ placement: AdQuestPlacement; title: TranslationKey; description: TranslationKey; amount: number; currency: TranslationKey; icon: typeof Gem; tone: string }> = [
  { placement: "signal_mining", title: "signalMining", description: "signalMiningDescription", amount: 60, currency: "questCoins", icon: CircleDollarSign, tone: "#4ce0c4" },
  { placement: "daily_bonus", title: "dailyRelic", description: "dailyRelicDescription", amount: 5, currency: "relics", icon: Gem, tone: "#d7fb70" },
  { placement: "relic_resonance", title: "relicResonance", description: "relicResonanceDescription", amount: 2, currency: "relics", icon: Zap, tone: "#f7d774" },
];

export default function RewardBonus() {
  const [, setLocation] = useLocation();
  const { webApp, isTelegram } = useTelegramWebApp();
  const { t } = useI18n();
  const { enabled, status, watchQuest, showRevenueAd, supportsInterstitial, supportsTasks } = useMonetagAd(webApp?.initData);
  const [active, setActive] = useState<AdQuestPlacement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const waiting = status === "opening" || status === "verifying" || status === "pending";

  async function start(placement: AdQuestPlacement) {
    setActive(placement); setError(null);
    try { await watchQuest(placement); } catch (caught) { const code = caught instanceof Error ? caught.message : ""; setError(code === "adsNotConfigured" ? t("adsNotConfigured") : code === "rewardPrepareFailed" ? t("rewardPrepareFailed") : code || t("providerNotConfigured")); }
  }
  async function openRevenue(format: "interstitial" | "task") {
    setError(null);
    try { await showRevenueAd(format); } catch (caught) { const code = caught instanceof Error ? caught.message : ""; setError(code === "adsNotConfigured" ? t("adsNotConfigured") : code || t("providerNotConfigured")); }
  }

  return <div className="game-shell min-h-[100dvh] px-4 pb-6 pt-[calc(var(--tg-content-safe-area-inset-top)+14px)] text-[#fbf8ed]"><main className="mx-auto w-full max-w-[520px]"><header className="flex items-center justify-between gap-3"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-xs text-[#c9d3d9]"><ArrowLeft size={16} /> {t("hub")}</button><span className="rounded-full border border-white/10 px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[.12em] text-[#d7fb70]">{isTelegram ? t("verified") : t("preview")}</span></header><section className="quest-nexus-panel mt-5 p-4"><div className="relative z-[1]"><div className="flex items-start justify-between gap-3"><div><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#4ce0c4]/10 text-[#4ce0c4]"><Sparkles size={20} /></div><p className="mt-3 font-mono text-[9px] uppercase tracking-[.15em] text-[#4ce0c4]">{t("rewardVault")}</p><h1 className="mt-1 font-display text-[28px] leading-none tracking-[-.05em]">{t("bonusProtected")}</h1></div><div className="rounded-lg border border-white/10 bg-black/10 px-2 py-1 font-mono text-[8px] uppercase tracking-[.08em] text-[#aebac4]">3 / day cap</div></div><p className="mt-3 text-[12px] leading-relaxed text-[#aebac4]">{t("rewardedAdsDescription")}</p>{!isTelegram && <p className="mt-3 rounded-lg border border-[#f7d774]/20 bg-[#f7d774]/[.06] p-2.5 text-[11px] text-[#e5d8a3]">{t("browserPreview")} {t("openVerifiedSession")}</p>}{enabled ? <div className="mt-4 grid gap-2">{quests.map(quest => { const Icon = quest.icon; const isActive = active === quest.placement; return <article key={quest.placement} className="rounded-xl border border-white/10 bg-white/[.035] p-3"><div className="flex items-center gap-2.5"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border" style={{ color: quest.tone, borderColor: `${quest.tone}55`, backgroundColor: `${quest.tone}0b` }}><Icon size={17} /></div><div className="min-w-0 flex-1"><h2 className="text-[12px] font-semibold text-[#f3f5eb]">{t(quest.title)}</h2><p className="mt-0.5 text-[10px] leading-snug text-[#8998a6]">{t(quest.description)}</p></div><span className="whitespace-nowrap font-mono text-[10px] font-semibold" style={{ color: quest.tone }}>+{quest.amount} {t(quest.currency)}</span></div><button disabled={waiting || !isTelegram} onClick={() => start(quest.placement)} className="btn-3d btn-ghost mt-2.5 flex w-full items-center justify-center gap-2 py-2 text-[10px]">{isActive && waiting ? <Loader2 size={14} className="animate-spin" /> : <Play size={13} />}{isActive && status === "pending" ? t("rewardPending") : t("watchQuest")}</button></article>; })}</div> : <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[.035] p-3 text-[12px] leading-relaxed text-[#aebac4]"><LockKeyhole size={17} className="mt-0.5 shrink-0 text-[#4ce0c4]" />{t("adsDisabled")}</div>}{(supportsInterstitial || supportsTasks) && <div className="mt-3 grid grid-cols-2 gap-2">{supportsInterstitial && <button disabled={waiting} onClick={() => openRevenue("interstitial")} className="btn-3d btn-ghost px-2 py-2 text-[10px]">{t("watchInterstitial")}</button>}{supportsTasks && <button disabled={waiting} onClick={() => openRevenue("task")} className="btn-3d btn-ghost px-2 py-2 text-[10px]">{t("openTask")}</button>}</div>}{error && <p className="mt-3 rounded-xl border border-[#ff9a6e]/25 bg-[#ff9a6e]/10 p-2.5 text-[11px] text-[#ffd5c2]">{error}</p>}</div></section></main></div>;
}
