import { useEffect } from "react";
import { useLocation } from "wouter";
import { Gem, Sparkles, Trophy } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useI18n } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type Result = { xpAwarded: number; relicsAwarded: number; level: number; experience: number; relics: number };

export default function QuestResult() {
  const [, setLocation] = useLocation();
  const { webApp } = useTelegramWebApp();
  const { t } = useI18n();
  const result = safeResult();
  useEffect(() => { const button = webApp?.MainButton; const returnToHub = () => setLocation("/"); webApp?.HapticFeedback?.notificationOccurred?.("success"); if (!button) return; button.setText(t("returnHub")); button.show(); button.onClick(returnToHub); return () => { button.offClick(returnToHub); button.hide(); }; }, [setLocation, t, webApp]);
  return <div className="game-shell relative grid min-h-[100dvh] place-items-center p-4 text-[#fbf8ed]"><div className="absolute right-4 top-[calc(var(--tg-content-safe-area-inset-top)+14px)]"><LanguageSwitcher compact /></div><main className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-[#d7fb70]/20 bg-[#1a2639]/90 p-5 text-center shadow-[0_18px_48px_rgba(0,0,0,.28)]"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#d7fb70]/15 text-[#d7fb70]"><Trophy size={25} /></div><p className="mt-4 font-mono text-[9px] uppercase tracking-[.15em] text-[#d7fb70]">{t("routeComplete")}</p><h1 className="mt-1.5 font-display text-[30px] leading-none tracking-[-.05em]">{t("genesisCleared")}</h1><p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-[#aebac4]">{t("relicGate")} {t("rewardsAdded")}</p><div className="mt-5 grid grid-cols-2 gap-2.5"><Reward icon={<Sparkles size={18} />} value={`+${result?.xpAwarded ?? 25} ${t("xp")}`} label={`${t("level")} ${result?.level ?? 1}`} /><Reward icon={<Gem size={18} />} value={`+${result?.relicsAwarded ?? 3} ${t("relics")}`} label={`${result?.relics ?? 0} ${t("total")}`} /></div><button onClick={() => setLocation("/")} className="mt-5 w-full rounded-xl bg-[#d7fb70] py-3 text-sm font-semibold text-[#16200f] transition active:scale-[.98]">{t("returnHub")}</button></main></div>;
}
function Reward({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) { return <div className="rounded-xl border border-white/10 bg-white/[.035] p-3 text-left"><span className="text-[#d7fb70]">{icon}</span><p className="mt-3 font-display text-xl leading-none">{value}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-[#97a6b2]">{label}</p></div>; }
function safeResult(): Result | null { try { const raw = sessionStorage.getItem("gamequest:last-result"); return raw ? JSON.parse(raw) as Result : null; } catch { return null; } }
