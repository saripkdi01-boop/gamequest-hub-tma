import { ArrowLeft, CheckCircle2, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import Character3D from "@/components/Character3D";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { guideCopy } from "@/game/guide-copy";
import { guides, type GuideId } from "@/game/guides";
import { readActiveGuide, writeActiveGuide } from "@/lib/guide-selection";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useI18n } from "@/i18n";

export default function GuideRoster() {
  const [, setLocation] = useLocation();
  const { language, t } = useI18n();
  const { webApp } = useTelegramWebApp();
  const copy = useMemo(() => guideCopy(language), [language]);
  const [activeId, setActiveId] = useState<GuideId>(() => readActiveGuide().id);

  const choose = (id: GuideId) => {
    writeActiveGuide(id);
    setActiveId(id);
    webApp?.HapticFeedback?.notificationOccurred?.("success");
  };

  return <div className="game-shell min-h-[100dvh] pb-[calc(var(--tg-safe-area-inset-bottom)+18px)] text-[#fbf8ed]"><main className="mx-auto w-full max-w-[620px] px-3 pt-[calc(var(--tg-content-safe-area-inset-top)+12px)]"><header className="flex items-center justify-between gap-3"><button onClick={() => setLocation("/")} className="flex items-center gap-2 text-xs text-[#c5d0da]"><ArrowLeft size={16} />{t("hub")}</button><LanguageSwitcher compact /></header><section className="mt-5 rounded-2xl border border-[#4ce0c4]/25 bg-[#17243a]/85 p-4"><div className="flex items-start gap-3"><Character3D guideId={activeId} size="lg" autoRotate /><div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[.13em] text-[#4ce0c4]"><Sparkles size={12} />QUEST NEXUS</p><h1 className="mt-1 font-display text-[28px] leading-none tracking-[-.055em]">{copy.roster}</h1><p className="mt-2 text-[12px] leading-relaxed text-[#aebac4]">{copy.safety}</p></div></div></section><section className="mt-4 grid gap-2">{guides.map(guide => { const active = guide.id === activeId; return <article key={guide.id} className={`rounded-2xl border p-3 transition ${active ? "border-[#4ce0c4]/60 bg-[#4ce0c4]/[.08]" : "border-white/10 bg-white/[.035]"}`}><div className="flex items-center gap-3"><Character3D guideId={guide.id} size="md" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 style={{ color: guide.primary }} className="font-display text-[18px] leading-none tracking-[.06em]">{guide.name}</h2>{guide.unlock === "seasonal" && <span className="rounded-full border border-[#f5b942]/30 bg-[#f5b942]/10 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[.09em] text-[#f7d774]">{copy.seasonal}</span>}</div><p className="mt-1 text-[10px] font-medium text-[#dfe6de]">{copy.role[guide.id]}</p><p className="mt-1 text-[10px] leading-relaxed text-[#93a2b1]">{copy.description[guide.id]}</p></div></div><div className="mt-3 grid grid-cols-2 gap-1.5"><div className="rounded-lg bg-black/15 px-2 py-1.5"><p className="font-mono text-[7px] uppercase tracking-[.1em] text-[#8490a0]">{copy.protocol}</p><p className="mt-0.5 text-[10px] text-[#dce8d2]">{copy.protocolValue[guide.id]}</p></div><div className="rounded-lg bg-black/15 px-2 py-1.5"><p className="font-mono text-[7px] uppercase tracking-[.1em] text-[#8490a0]">{copy.affinity}</p><p className="mt-0.5 text-[10px] text-[#dce8d2]">{copy.affinityValue[guide.id]}</p></div></div><button onClick={() => choose(guide.id)} className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[.1em] ${active ? "bg-[#4ce0c4] text-[#10201b]" : "border border-white/12 bg-white/[.05] text-[#e7efe9]"}`}>{active ? <><CheckCircle2 size={13} />{copy.active}</> : <><Sparkles size={13} />{copy.choose}</>}</button></article>; })}</section><section className="mt-4 rounded-xl border border-white/[.1] bg-white/[.025] p-3"><p className="flex items-start gap-2 text-[10px] leading-relaxed text-[#aebac4]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#4ce0c4]" />{copy.safety}</p><button onClick={() => setLocation("/explore")} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#d7fb70] px-3 py-2.5 font-mono text-[9px] font-semibold uppercase tracking-[.1em] text-[#18210f]">{copy.explore}<ChevronRight size={14} /></button></section></main></div>;
}
