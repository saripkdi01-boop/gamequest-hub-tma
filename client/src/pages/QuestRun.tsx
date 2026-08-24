import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Compass, Loader2, Sparkles } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { startGenesisRun, submitGenesisChoice, type Run } from "@/lib/game-api";

export default function QuestRun() {
  const [, setLocation] = useLocation();
  const { webApp, isTelegram } = useTelegramWebApp();
  const hasVerifiedTelegramContext = Boolean(webApp?.initData);
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hasVerifiedTelegramContext || !webApp?.initData) return;
    startGenesisRun(webApp.initData).then(({ run: nextRun }) => setRun(nextRun)).catch(error => setError(error.message));
  }, [hasVerifiedTelegramContext, webApp]);

  const choose = async (choiceId: string) => {
    if (!run || !webApp?.initData || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { run: nextRun } = await submitGenesisChoice(webApp.initData, run.runId, choiceId);
      webApp.HapticFeedback?.impactOccurred("medium");
      if (nextRun.status === "completed" && nextRun.result) {
        sessionStorage.setItem("gamequest:last-result", JSON.stringify(nextRun.result));
        setLocation("/result");
        return;
      }
      setRun(nextRun);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Pilihan tidak dapat diproses.");
    } finally {
      setBusy(false);
    }
  };

  if (!hasVerifiedTelegramContext) return <PreviewNotice onBack={() => setLocation("/")} />;
  if (error && !run) return <ErrorState error={error} onBack={() => setLocation("/")} />;
  if (!run || !run.checkpoint) return <LoadingScreen />;

  return (
    <div className="game-shell min-h-[100dvh] px-5 pb-8 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)] text-[#fbf8ed]">
      <main className="mx-auto w-full max-w-[520px]">
        <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#c9d3d9] transition hover:text-white"><ArrowLeft size={18} /> Quest board</button>
        <div className="mt-9 flex items-center justify-between"><span className="rounded-full border border-[#d7fb70]/20 bg-[#d7fb70]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#d7fb70]">Genesis Run</span><span className="font-mono text-[10px] text-[#9eabb5]">CHECKPOINT {run.checkpoint.index + 1}/3</span></div>
        <section className="mt-5 overflow-hidden rounded-[30px] border border-white/10 bg-[#1a2639]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,.25)]">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#d7fb70]/25 bg-[#d7fb70]/10 text-[#d7fb70]"><Compass size={28} /></div>
          <p className="mt-7 font-mono text-[10px] uppercase tracking-[.16em] text-[#a5b690]">Path decision</p>
          <h1 className="mt-2 font-display text-4xl tracking-[-.05em]">{run.checkpoint.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-[#aebac4]">{run.checkpoint.narrative}</p>
          <div className="mt-8 space-y-3">
            {run.checkpoint.choices.map(choice => <button key={choice.id} disabled={busy} onClick={() => choose(choice.id)} className="group w-full rounded-2xl border border-white/10 bg-white/[.035] p-4 text-left transition hover:border-[#d7fb70]/40 hover:bg-[#d7fb70]/[.07] disabled:opacity-50"><div className="flex items-center justify-between gap-4"><div><p className="font-medium text-[#f8f5e9]">{choice.title}</p><p className="mt-1 text-xs leading-relaxed text-[#98a8b5]">{choice.description}</p></div><span className="shrink-0 font-mono text-xs text-[#d7fb70]">+{choice.momentum}</span></div></button>)}
          </div>
        </section>
        {error && <p className="mt-4 rounded-xl border border-[#ff9a6e]/30 bg-[#ff9a6e]/10 p-3 text-sm text-[#ffd5c2]">{error}</p>}
        <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[.13em] text-[#8794a1]">Route momentum: {run.momentum}</p>
      </main>
    </div>
  );
}

function LoadingScreen() { return <div className="game-shell grid min-h-[100dvh] place-items-center text-[#d7fb70]"><div className="text-center"><Loader2 className="mx-auto animate-spin" /><p className="mt-4 font-mono text-xs uppercase tracking-widest">Preparing the route</p></div></div>; }
function ErrorState({ error, onBack }: { error: string; onBack: () => void }) { return <div className="game-shell grid min-h-[100dvh] place-items-center p-6 text-center text-[#f8f5e9]"><div><Sparkles className="mx-auto text-[#ff9a6e]" /><h1 className="mt-4 font-display text-3xl">Quest unavailable</h1><p className="mt-3 text-sm text-[#aebac4]">{error}</p><button onClick={onBack} className="mt-6 rounded-full bg-[#d7fb70] px-5 py-3 text-sm font-semibold text-[#16200f]">Back to hub</button></div></div>; }
function PreviewNotice({ onBack }: { onBack: () => void }) { return <div className="game-shell grid min-h-[100dvh] place-items-center p-6 text-center text-[#f8f5e9]"><div><Sparkles className="mx-auto text-[#d7fb70]" /><h1 className="mt-4 font-display text-3xl">Open in Telegram</h1><p className="mt-3 text-sm text-[#aebac4]">Genesis Run needs your verified Telegram identity to save progress securely.</p><button onClick={onBack} className="mt-6 rounded-full bg-[#d7fb70] px-5 py-3 text-sm font-semibold text-[#16200f]">Back to hub</button></div></div>; }
