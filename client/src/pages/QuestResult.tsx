import { useLocation } from "wouter";
import { Award, Gem, Sparkles, Trophy } from "lucide-react";

type Result = { xpAwarded: number; relicsAwarded: number; level: number; experience: number; relics: number };

export default function QuestResult() {
  const [, setLocation] = useLocation();
  const result = safeResult();
  return <div className="game-shell grid min-h-[100dvh] place-items-center p-5 text-[#fbf8ed]"><main className="w-full max-w-[520px] overflow-hidden rounded-[30px] border border-[#d7fb70]/20 bg-[#1a2639]/90 p-7 text-center shadow-[0_24px_60px_rgba(0,0,0,.3)]"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#d7fb70]/15 text-[#d7fb70]"><Trophy size={32} /></div><p className="mt-7 font-mono text-[10px] uppercase tracking-[.16em] text-[#d7fb70]">Route complete</p><h1 className="mt-2 font-display text-4xl tracking-[-.05em]">Genesis Run cleared.</h1><p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[#aebac4]">The relic gate recognizes your path. Your verified rewards have been added to the ledger.</p><div className="mt-8 grid grid-cols-2 gap-3"><Reward icon={<Sparkles size={20} />} value={`+${result?.xpAwarded ?? 25} XP`} label={`Level ${result?.level ?? 1}`} /><Reward icon={<Gem size={20} />} value={`+${result?.relicsAwarded ?? 3} Relics`} label={`${result?.relics ?? 0} total`} /></div><button onClick={() => setLocation("/")} className="mt-8 w-full rounded-2xl bg-[#d7fb70] py-4 font-semibold text-[#16200f] transition active:scale-[.98]">Return to GameQuest Hub</button></main></div>;
}
function Reward({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4 text-left"><span className="text-[#d7fb70]">{icon}</span><p className="mt-4 font-display text-2xl">{value}</p><p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#97a6b2]">{label}</p></div>; }
function safeResult(): Result | null { try { const raw = sessionStorage.getItem("gamequest:last-result"); return raw ? JSON.parse(raw) as Result : null; } catch { return null; } }
