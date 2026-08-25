import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Brain, Check, Flame, Gauge, LockKeyhole, ShieldCheck, Sparkles, Timer, Trophy, X } from "lucide-react";
import { useLocation } from "wouter";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { startQuiz, submitQuizAnswer, type PublicQuestion, type QuizMode, type QuizStart } from "@/lib/game-api";

const modes: Array<{ id: QuizMode; label: string; kicker: string; description: string; accent: string; enabled: boolean }> = [
  { id: "know", label: "KNOW", kicker: "Precision round", description: "Five questions. Make every choice count.", accent: "#d7fb70", enabled: true },
  { id: "chain", label: "CHAIN", kicker: "Combo pressure", description: "Build a streak before the chain breaks.", accent: "#8de4ff", enabled: true },
  { id: "bluff", label: "BLUFF", kicker: "Risk / reward", description: "Choose safe or risk. Skill stays in control.", accent: "#f7d774", enabled: false },
  { id: "boss", label: "BOSS", kicker: "10 second strike", description: "A limited daily challenge is coming next.", accent: "#ff9a6e", enabled: false },
];

function ModeSelect({ selected, onSelect, onStart, busy, isTelegram }: { selected: QuizMode; onSelect: (mode: QuizMode) => void; onStart: () => void; busy: boolean; isTelegram: boolean }) {
  return (
    <>
      <section className="mt-8 rounded-[28px] border border-white/10 bg-[#17243a]/85 p-5 shadow-[0_22px_60px_rgba(0,0,0,.22)]">
        <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[#d7fb70]">Choose your arena</p><h1 className="mt-2 font-display text-[34px] leading-none tracking-[-.055em] text-[#fbf8ed]">Think fast<span className="text-[#d7fb70]">.</span></h1></div><div className="brand-mark"><Brain size={19} /></div></div>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#aebac4]">Your mind is your weapon. Correctness, speed, and consistency shape the run.</p>
        <div className="mt-6 grid gap-3">
          {modes.map(mode => <button key={mode.id} disabled={!mode.enabled} onClick={() => onSelect(mode.id)} className={`rounded-2xl border px-4 py-4 text-left transition ${selected === mode.id ? "border-[#d7fb70]/60 bg-[#d7fb70]/[.08]" : "border-white/10 bg-white/[.025]"} ${!mode.enabled ? "cursor-not-allowed opacity-45" : "hover:border-white/25 active:scale-[.99]"}`}><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border" style={{ borderColor: `${mode.accent}55`, color: mode.accent }}><Gauge size={18} /></span><span className="min-w-0 flex-1"><span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em]" style={{ color: mode.accent }}>{mode.label}{!mode.enabled && <LockKeyhole size={12} />}</span><span className="mt-1 block text-sm font-medium text-[#f5f3e9]">{mode.kicker}</span><span className="mt-1 block text-xs text-[#8f9eac]">{mode.description}</span></span>{selected === mode.id && mode.enabled && <Check size={18} className="text-[#d7fb70]" />}</div></button>)}
        </div>
        {!isTelegram && <div className="mt-5 flex gap-2 rounded-xl border border-[#f7d774]/20 bg-[#f7d774]/[.05] p-3 text-xs leading-relaxed text-[#d7cfa9]"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#f7d774]" />Open the app inside Telegram to start a verified session. Browser preview never creates rewards.</div>}
        <button disabled={busy || !isTelegram} onClick={onStart} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d7fb70] py-4 font-semibold text-[#16200f] transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45">{busy ? "Preparing arena…" : "ENTER ARENA"}<Sparkles size={17} /></button>
      </section>
    </>
  );
}

function QuizSession({ quiz, initData, onExit }: { quiz: QuizStart; initData?: string; onExit: () => void }) {
  const [question, setQuestion] = useState<PublicQuestion | null>(quiz.question);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { correct: boolean; qc: number; xp: number; mind: number; combo: number; explanation: string; done: boolean }>(null);
  const [startedAt, setStartedAt] = useState(() => performance.now());
  const [remaining, setRemaining] = useState(() => Math.max(0, quiz.question ? quiz.question.timeLimitMs : 0));
  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);
  useEffect(() => {
    if (!question || feedback) return;
    setStartedAt(performance.now());
    setRemaining(question.timeLimitMs);
    const timer = window.setInterval(() => setRemaining(Math.max(0, question.timeLimitMs - Math.round(performance.now() - startedAt))), 250);
    return () => window.clearInterval(timer);
  }, [question, feedback, startedAt]);

  const progress = useMemo(() => question ? `${question.sequence + 1} / ${quiz.session.questionCount}` : "Complete", [question, quiz.session.questionCount]);

  async function choose(answerId: string) {
    if (!question || busy || feedback) return;
    setBusy(true); setError(null);
    try {
      const { quiz: result } = await submitQuizAnswer(initData, quiz.session.id, answerId, Math.round(performance.now() - startedAt));
      if (!mounted.current) return;
      setFeedback({ correct: result.result.correct, qc: result.result.qcAwarded, xp: result.result.xpAwarded, mind: result.result.mindScoreAwarded, combo: result.result.combo, explanation: result.result.explanation, done: result.result.sessionCompleted });
      if (result.result.sessionCompleted) return;
      window.setTimeout(() => { if (!mounted.current) return; setQuestion(result.question); setFeedback(null); setStartedAt(performance.now()); }, 1100);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to verify answer.");
    } finally { if (mounted.current) setBusy(false); }
  }

  return <div className="game-shell min-h-[100dvh] pb-[calc(var(--tg-safe-area-inset-bottom)+28px)]"><main className="mx-auto w-full max-w-[520px] px-5 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)]"><button onClick={onExit} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.15em] text-[#9daab5]"><ArrowLeft size={15} /> Exit arena</button><header className="mt-8 flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.17em] text-[#d7fb70]">{quiz.session.mode} mode · {progress}</p><h1 className="mt-2 font-display text-[31px] leading-none tracking-[-.05em]">Make the call<span className="text-[#d7fb70]">.</span></h1></div><div className="text-right"><div className="flex items-center justify-end gap-1 font-mono text-[18px] text-[#f7d774]"><Timer size={16} />{Math.ceil(remaining / 1000)}s</div><p className="mt-1 font-mono text-[9px] uppercase tracking-[.12em] text-[#7d8b98]">energy {quiz.session.energy}</p></div></header><div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#d7fb70] transition-all" style={{ width: `${question ? Math.max(0, Math.min(100, remaining / question.timeLimitMs * 100)) : 0}%` }} /></div>{question && <section className="mt-7 rounded-[28px] border border-white/10 bg-[#17243a]/90 p-5 shadow-[0_22px_60px_rgba(0,0,0,.25)]"><div className="flex items-center justify-between"><span className="rounded-full bg-[#d7fb70]/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.14em] text-[#d7fb70]">{question.category}</span><span className="font-mono text-[9px] uppercase tracking-[.13em] text-[#8291a0]">{question.difficulty}</span></div><h2 className="mt-7 font-display text-[27px] leading-[1.05] tracking-[-.04em] text-[#fbf8ed]">{question.question}</h2><div className="mt-7 grid gap-2.5">{question.answers.map((answer, index) => <button key={answer.id} disabled={busy || Boolean(feedback)} onClick={() => choose(answer.id)} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-3 text-left transition hover:border-[#d7fb70]/45 hover:bg-[#d7fb70]/[.06] disabled:opacity-65"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 font-mono text-xs text-[#94a2af] group-hover:border-[#d7fb70]/40 group-hover:text-[#d7fb70]">{String.fromCharCode(65 + index)}</span><span className="text-sm text-[#edf0e8]">{answer.text}</span></button>)}</div></section>}{feedback && <section className={`mt-4 rounded-2xl border p-4 ${feedback.correct ? "border-[#d7fb70]/35 bg-[#d7fb70]/[.08]" : "border-[#ff9a6e]/35 bg-[#ff9a6e]/[.08]"}`}><div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em]">{feedback.correct ? <Check size={16} className="text-[#d7fb70]" /> : <X size={16} className="text-[#ff9a6e]" />}{feedback.correct ? "Correct signal" : "Wrong signal"}<span className="ml-auto text-[#d7fb70]">{feedback.done ? "Run complete" : `Combo ×${feedback.combo}`}</span></div><p className="mt-3 text-sm leading-relaxed text-[#bec8ce]">{feedback.explanation}</p><div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[.1em] text-[#d7fb70]"><span>+{feedback.qc} QC</span><span>+{feedback.xp} XP</span><span>+{feedback.mind} Mind</span></div>{feedback.done && <button onClick={onExit} className="mt-4 w-full rounded-xl bg-[#d7fb70] py-3 font-semibold text-[#16200f]">RETURN TO HUB</button>}</section>}{error && <p className="mt-4 rounded-xl border border-[#ff9a6e]/25 bg-[#ff9a6e]/10 p-3 text-xs text-[#ffd5c2]">{error}</p>}<p className="mt-5 flex items-center justify-center gap-2 text-center font-mono text-[9px] uppercase tracking-[.12em] text-[#7f8d9b]"><ShieldCheck size={13} className="text-[#d7fb70]" /> Server-verified answer scoring</p></main></div>;
}

export default function QuizArena() {
  const [, setLocation] = useLocation();
  const { webApp, isTelegram } = useTelegramWebApp();
  const initData = webApp?.initData;
  const [selected, setSelected] = useState<QuizMode>("know");
  const [quiz, setQuiz] = useState<QuizStart | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enterArena() {
    if (!initData) return;
    setBusy(true); setError(null);
    try { const { quiz: nextQuiz } = await startQuiz(initData, selected); setQuiz(nextQuiz); webApp?.HapticFeedback?.impactOccurred?.("light"); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to open arena."); }
    finally { setBusy(false); }
  }

  if (quiz) return <QuizSession quiz={quiz} initData={initData} onExit={() => { setQuiz(null); setLocation("/"); }} />;
  return <div className="game-shell min-h-[100dvh] pb-[calc(var(--tg-safe-area-inset-bottom)+28px)]"><main className="mx-auto w-full max-w-[520px] px-5 pt-[calc(var(--tg-content-safe-area-inset-top)+18px)]"><header className="flex items-center justify-between"><button onClick={() => setLocation("/")} className="text-left"><p className="font-display text-[21px] leading-none tracking-[-.04em]">QUEST<span className="text-[#d7fb70]">//</span>MIND</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[.17em] text-[#9fae9d]">Think fast · choose smart</p></button><span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2 font-mono text-[9px] uppercase tracking-[.13em] text-[#d7fb70]">{isTelegram ? "Verified" : "Preview"}</span></header><ModeSelect selected={selected} onSelect={setSelected} onStart={enterArena} busy={busy} isTelegram={isTelegram && Boolean(initData)} />{error && <p className="mt-4 rounded-xl border border-[#ff9a6e]/25 bg-[#ff9a6e]/10 p-3 text-xs text-[#ffd5c2]">{error}</p>}<div className="mt-6 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl border border-white/10 bg-white/[.025] p-3"><Flame size={16} className="mx-auto text-[#ff9a6e]" /><p className="mt-2 font-mono text-[9px] uppercase tracking-[.1em] text-[#8291a0]">Combo</p></div><div className="rounded-xl border border-white/10 bg-white/[.025] p-3"><Trophy size={16} className="mx-auto text-[#f7d774]" /><p className="mt-2 font-mono text-[9px] uppercase tracking-[.1em] text-[#8291a0]">Rank</p></div><div className="rounded-xl border border-white/10 bg-white/[.025] p-3"><Sparkles size={16} className="mx-auto text-[#8de4ff]" /><p className="mt-2 font-mono text-[9px] uppercase tracking-[.1em] text-[#8291a0]">Mind</p></div></div></main></div>;
}
