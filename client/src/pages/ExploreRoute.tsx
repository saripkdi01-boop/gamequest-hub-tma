import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Crosshair, Loader2, Map, ShieldCheck, Sparkles } from "lucide-react";
import { GameCanvas } from "@/components/GameCanvas";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { startGenesisRun, submitGenesisChoice, type Run } from "@/lib/game-api";

const demoRun: Run = { runId: "demo-genesis", status: "active", momentum: 0, checkpoint: { index: 0, title: "The Signal Ridge", narrative: "Tap the luminous route gate, then choose a path through the beacon signal.", choices: [{ id: "scan", title: "Scan the beacon", description: "Map the safe route before moving.", momentum: 2 }, { id: "rush", title: "Rush the ridge", description: "Move fast and claim the high ground.", momentum: 1 }, { id: "salvage", title: "Salvage nearby parts", description: "Trade speed for a sturdier path.", momentum: 0 }] } };

export default function ExploreRoute() {
  const [, setLocation] = useLocation();
  const { webApp, isTelegram } = useTelegramWebApp();
  const demoMode = useMemo(() => new URLSearchParams(window.location.search).has("demo"), []);
  const [run, setRun] = useState<Run | null>(demoMode ? demoRun : null);
  const [focusedGate, setFocusedGate] = useState<number | null>(demoMode ? 0 : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demoMode || !isTelegram || !webApp?.initData) return;
    startGenesisRun(webApp.initData).then(({ run: next }) => { setRun(next); setFocusedGate(next.checkpoint?.index ?? null); }).catch(caught => setError(caught instanceof Error ? caught.message : "Route unavailable"));
  }, [demoMode, isTelegram, webApp]);

  useEffect(() => {
    const backButton = webApp?.BackButton;
    const returnToHub = () => setLocation("/");
    if (!backButton) return;
    backButton.show();
    backButton.onClick(returnToHub);
    return () => { backButton.offClick(returnToHub); backButton.hide(); };
  }, [setLocation, webApp]);

  useEffect(() => {
    if (!demoMode) return;
    const timer = window.setInterval(() => {
      setRun(current => {
        if (!current?.checkpoint || current.checkpoint.index >= 2) return current;
        const nextIndex = current.checkpoint.index + 1;
        const nextTitle = ["The Signal Ridge", "The Glass Crossing", "The Relic Gate"][nextIndex];
        setFocusedGate(nextIndex);
        return { ...current, checkpoint: { ...current.checkpoint, index: nextIndex, title: nextTitle, narrative: "AutoPilot advances through the luminous route. Tap a gate to focus it, then choose your path." }, momentum: current.momentum + 1 };
      });
    }, 1800);
    return () => window.clearInterval(timer);
  }, [demoMode]);

  const choose = async (choiceId: string) => {
    if (!run || !run.checkpoint || busy) return;
    setBusy(true); setError(null);
    try {
      if (demoMode) {
        const nextIndex = run.checkpoint.index + 1;
        if (nextIndex === 3) { setLocation("/result"); return; }
        const next = { ...demoRun, checkpoint: { ...demoRun.checkpoint!, index: nextIndex, title: ["The Signal Ridge", "The Glass Crossing", "The Relic Gate"][nextIndex], narrative: "Demo route confirmed. Continue through the next luminous gate." }, momentum: run.momentum + 1 };
        setRun(next); setFocusedGate(nextIndex); return;
      }
      const { run: next } = await submitGenesisChoice(webApp?.initData, run.runId, choiceId);
      webApp?.HapticFeedback?.impactOccurred("medium");
      if (next.status === "completed" && next.result) { sessionStorage.setItem("gamequest:last-result", JSON.stringify(next.result)); setLocation("/result"); return; }
      setRun(next); setFocusedGate(next.checkpoint?.index ?? null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Choice could not be submitted."); }
    finally { setBusy(false); }
  };

  const focusGate = (index: number) => { setFocusedGate(index); webApp?.HapticFeedback?.impactOccurred("light"); };
  const checkpoint = run?.checkpoint;
  return <div className="game-shell min-h-[100dvh] pb-[calc(var(--tg-safe-area-inset-bottom)+20px)] text-[#fbf8ed]"><main className="mx-auto w-full max-w-[620px] px-4 pt-[calc(var(--tg-content-safe-area-inset-top)+14px)]"><header className="mb-4 flex items-center justify-between"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#c5d0da]"><ArrowLeft size={18} /> Hub</button><span className="rounded-full border border-[#d7fb70]/25 bg-[#d7fb70]/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[.13em] text-[#d7fb70]">{demoMode ? "Visual demo" : "Explore route"}</span></header><div className="relative"><GameCanvas checkpointIndex={checkpoint?.index ?? 0} focusedGate={focusedGate} onGateFocus={focusGate} /><img src="/manus-storage/genesis-run-visual-target_1612aac3.png" alt="Genesis Run route atlas" className="pointer-events-none absolute right-3 top-3 h-20 w-11 rounded-lg border border-[#d7fb70]/25 object-cover opacity-70 shadow-lg" /></div>
    <section className="relative -mt-8 mx-2 rounded-[26px] border border-white/10 bg-[#17243a]/95 p-5 shadow-[0_18px_45px_rgba(0,0,0,.3)] backdrop-blur"><div className="flex items-start justify-between gap-4"><div><p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-[#d7fb70]"><Crosshair size={13} /> {checkpoint ? `Checkpoint ${checkpoint.index + 1}/3` : "Route complete"}</p><h1 className="mt-2 font-display text-[28px] tracking-[-.05em]">{checkpoint?.title ?? "Syncing the route"}</h1></div><Map className="shrink-0 text-[#8de4ff]" /></div><p className="mt-3 text-sm leading-relaxed text-[#aebac4]">{checkpoint?.narrative ?? "Your verified quest state is loading."}</p>{checkpoint && <div className="mt-5 grid gap-2">{checkpoint.choices.map(choice => <button key={choice.id} disabled={busy} onClick={() => choose(choice.id)} className="group rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-left transition hover:border-[#d7fb70]/45 hover:bg-[#d7fb70]/[.06] disabled:opacity-60"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium">{choice.title}</p><p className="mt-1 text-xs text-[#98a7b5]">{choice.description}</p></div><span className="font-mono text-xs text-[#d7fb70]">+{choice.momentum}</span></div></button>)}</div>}{busy && <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#d7fb70]"><Loader2 size={14} className="animate-spin" />Verifying route</div>}{error && <p className="mt-4 rounded-xl border border-[#ff9a6e]/30 bg-[#ff9a6e]/10 p-3 text-xs text-[#ffd5c2]">{error}</p>}{!isTelegram && !demoMode && <p className="mt-4 flex gap-2 text-xs leading-relaxed text-[#b6c0c9]"><ShieldCheck size={17} className="shrink-0 text-[#d7fb70]" />Open this route from Telegram to synchronize real progress and rewards.</p>}<p className="mt-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.13em] text-[#91a19d]"><Sparkles size={13} className="text-[#d7fb70]" />Tap the luminous gate to focus the active checkpoint</p></section></main></div>;
}
