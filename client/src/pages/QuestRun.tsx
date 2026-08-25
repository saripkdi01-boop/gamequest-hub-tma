import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Compass, Loader2, Sparkles } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { startGenesisRun, submitGenesisChoice, type Run } from "@/lib/game-api";
import { useI18n } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function QuestRun() {
  const [, setLocation] = useLocation();
  const { webApp } = useTelegramWebApp();
  const { t } = useI18n();
  const verified = Boolean(webApp?.initData);
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!verified || !webApp?.initData) return;
    startGenesisRun(webApp.initData).then(({ run: nextRun }) => setRun(nextRun)).catch(caught => setError(caught instanceof Error ? caught.message : t("routeUnavailable")));
  }, [verified, webApp, t]);

  async function choose(choiceId: string) {
    if (!run || !webApp?.initData || busy) return;
    setBusy(true); setError(null);
    try {
      const { run: nextRun } = await submitGenesisChoice(webApp.initData, run.runId, choiceId);
      webApp.HapticFeedback?.impactOccurred("medium");
      if (nextRun.status === "completed" && nextRun.result) { sessionStorage.setItem("gamequest:last-result", JSON.stringify(nextRun.result)); setLocation("/result"); return; }
      setRun(nextRun);
    } catch (caught) { setError(caught instanceof Error ? caught.message : t("unableAnswer")); }
    finally { setBusy(false); }
  }

  if (!verified) return <Notice icon={<Sparkles />} title={t("openTelegram")} body={t("verifiedIdentity")} button={t("backToHub")} onBack={() => setLocation("/")} />;
  if (error && !run) return <Notice icon={<Sparkles className="text-[#ff9a6e]" />} title={t("questUnavailable")} body={error} button={t("backToHub")} onBack={() => setLocation("/")} />;
  if (!run?.checkpoint) return <div className="game-shell grid min-h-[100dvh] place-items-center text-[#d7fb70]"><div className="text-center"><Loader2 className="mx-auto animate-spin" /><p className="mt-3 font-mono text-[10px] uppercase tracking-[.15em]">{t("preparingRoute")}</p></div></div>;

  const checkpoint = run.checkpoint;
  return <div className="game-shell min-h-[100dvh] px-4 pb-6 pt-[calc(var(--tg-content-safe-area-inset-top)+14px)] text-[#fbf8ed]"><main className="mx-auto w-full max-w-[520px]"><div className="flex items-center justify-between gap-3"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-xs text-[#c9d3d9]"><ArrowLeft size={16} /> {t("questBoard")}</button><LanguageSwitcher compact /></div><div className="mt-5 flex items-center justify-between gap-3"><span className="rounded-full border border-[#d7fb70]/20 bg-[#d7fb70]/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.13em] text-[#d7fb70]">{t("genesisRun")}</span><span className="font-mono text-[9px] uppercase tracking-[.1em] text-[#9eabb5]">{t("checkpoint")} {checkpoint.index + 1}/3</span></div><section className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#1a2639]/90 p-4 shadow-[0_18px_44px_rgba(0,0,0,.23)]"><div className="flex items-start justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl border border-[#d7fb70]/25 bg-[#d7fb70]/10 text-[#d7fb70]"><Compass size={22} /></div><span className="font-mono text-[9px] uppercase tracking-[.1em] text-[#94a2ae]">{t("pathDecision")}</span></div><h1 className="mt-4 font-display text-[30px] leading-none tracking-[-.05em]">{checkpoint.title}</h1><p className="mt-3 text-[13px] leading-relaxed text-[#aebac4]">{checkpoint.narrative}</p><div className="mt-5 grid gap-2">{checkpoint.choices.map(choice => <button key={choice.id} disabled={busy} onClick={() => choose(choice.id)} className="group w-full rounded-xl border border-white/10 bg-white/[.035] px-3 py-2.5 text-left transition active:scale-[.99] hover:border-[#d7fb70]/40 disabled:opacity-50"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-[13px] font-medium text-[#f8f5e9]">{choice.title}</p><p className="mt-0.5 text-[11px] leading-snug text-[#98a8b5]">{choice.description}</p></div><span className="shrink-0 font-mono text-[11px] text-[#d7fb70]">+{choice.momentum}</span></div></button>)}</div></section>{error && <p className="mt-3 rounded-xl border border-[#ff9a6e]/30 bg-[#ff9a6e]/10 p-3 text-xs text-[#ffd5c2]">{error}</p>}<p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[.12em] text-[#8794a1]">{t("routeMomentum")}: {run.momentum}</p></main></div>;
}

function Notice({ icon, title, body, button, onBack }: { icon: React.ReactNode; title: string; body: string; button: string; onBack: () => void }) { return <div className="game-shell relative grid min-h-[100dvh] place-items-center p-5 text-center text-[#f8f5e9]"><div className="absolute right-4 top-[calc(var(--tg-content-safe-area-inset-top)+14px)]"><LanguageSwitcher compact /></div><div className="max-w-sm"><div className="mx-auto w-fit text-[#d7fb70]">{icon}</div><h1 className="mt-3 font-display text-[28px] tracking-[-.04em]">{title}</h1><p className="mt-2 text-[13px] leading-relaxed text-[#aebac4]">{body}</p><button onClick={onBack} className="mt-5 rounded-xl bg-[#d7fb70] px-4 py-2.5 text-sm font-semibold text-[#16200f]">{button}</button></div></div>; }
