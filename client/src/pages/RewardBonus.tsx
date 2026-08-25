import { useLocation } from "wouter";
import { ArrowLeft, Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useMonetagAd } from "@/hooks/useMonetagAd";
import { useI18n } from "@/i18n";

export default function RewardBonus() {
  const [, setLocation] = useLocation();
  const { webApp } = useTelegramWebApp();
  const { t } = useI18n();
  const { enabled, status, watchDailyBonus, showRevenueAd, supportsInterstitial, supportsTasks } = useMonetagAd(webApp?.initData);
  const start = () => watchDailyBonus().catch(error => { const code = error instanceof Error ? error.message : ""; window.alert(code === "adsNotConfigured" ? t("adsNotConfigured") : code === "rewardPrepareFailed" ? t("rewardPrepareFailed") : code || t("providerNotConfigured")); });
  const startRevenue = (format: "interstitial" | "task") => showRevenueAd(format).catch(error => { const code = error instanceof Error ? error.message : ""; window.alert(code === "adsNotConfigured" ? t("adsNotConfigured") : code || t("providerNotConfigured")); });
  const waiting = status === "opening" || status === "verifying" || status === "pending";
  return <div className="game-shell min-h-[100dvh] px-4 pb-6 pt-[calc(var(--tg-content-safe-area-inset-top)+14px)] text-[#fbf8ed]"><main className="mx-auto w-full max-w-[520px]"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-xs text-[#c9d3d9]"><ArrowLeft size={16} /> {t("hub")}</button><section className="quest-nexus-panel mt-6 p-5"><div className="relative z-[1]"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#4ce0c4]/10 text-[#4ce0c4]"><Sparkles size={22} /></div><p className="mt-4 font-mono text-[9px] uppercase tracking-[.15em] text-[#4ce0c4]">{t("rewardVault")}</p><h1 className="mt-1.5 font-display text-[30px] leading-none tracking-[-.05em]">{t("bonusProtected")}</h1><p className="mt-3 text-[13px] leading-relaxed text-[#aebac4]">{t("rewardedAdsDescription")}</p>{enabled ? <><button disabled={waiting} onClick={start} className="btn-3d btn-quest mt-5 flex w-full items-center justify-center gap-2 py-3 text-sm">{waiting && <Loader2 size={16} className="animate-spin" />}{status === "verifying" ? t("verifyingReward") : status === "pending" ? t("rewardPending") : t("watchRelics")}</button>{(supportsInterstitial || supportsTasks) && <div className="mt-3 grid grid-cols-2 gap-2">{supportsInterstitial && <button disabled={waiting} onClick={() => startRevenue("interstitial")} className="btn-3d btn-ghost px-2 py-2 text-[10px]">{t("watchInterstitial")}</button>}{supportsTasks && <button disabled={waiting} onClick={() => startRevenue("task")} className="btn-3d btn-ghost px-2 py-2 text-[10px]">{t("openTask")}</button>}</div>}</> : <div className="mt-5 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[.035] p-3 text-[12px] leading-relaxed text-[#aebac4]"><LockKeyhole size={17} className="mt-0.5 shrink-0 text-[#4ce0c4]" />{t("adsDisabled")}</div>}</div></section></main></div>;
}
