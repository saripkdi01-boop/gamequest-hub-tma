import { ArrowLeft, CheckCircle2, ChevronRight, LockKeyhole, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import Character3D from "@/components/Character3D";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { guideCopy } from "@/game/guide-copy";
import { guides, type GuideId } from "@/game/guides";
import { getGuideState, selectGuide, unlockGuideWithRelics, type GuideState } from "@/lib/game-api";
import { readActiveGuide, writeActiveGuide } from "@/lib/guide-selection";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useI18n } from "@/i18n";

export default function GuideRoster() {
  const [, setLocation] = useLocation();
  const { language, t } = useI18n();
  const { webApp } = useTelegramWebApp();
  const copy = useMemo(() => guideCopy(language), [language]);
  const verified = Boolean(webApp?.initData);
  const [activeId, setActiveId] = useState<GuideId>(() => readActiveGuide().id);
  const [serverState, setServerState] = useState<GuideState | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<GuideId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!verified || !webApp?.initData) return;
    setLoading(true);
    getGuideState(webApp.initData)
      .then(({ guideState }) => {
        setServerState(guideState);
        setActiveId(guideState.activeGuideId);
      })
      .catch(caught => setError(caught instanceof Error ? caught.message : t("unableArena")))
      .finally(() => setLoading(false));
  }, [t, verified, webApp]);

  const effectiveActiveId = serverState?.activeGuideId ?? activeId;

  const choose = async (id: GuideId) => {
    setError(null);
    if (!verified || !webApp?.initData || !serverState) {
      writeActiveGuide(id);
      setActiveId(id);
      webApp?.HapticFeedback?.notificationOccurred?.("success");
      return;
    }
    const record = serverState.guides.find(guide => guide.id === id);
    if (!record) return;
    setBusyId(id);
    try {
      if (!record.owned) {
        await unlockGuideWithRelics(webApp.initData, id);
      }
      const { selection } = await selectGuide(webApp.initData, id);
      setActiveId(id);
      setServerState(previous => previous ? {
        ...previous,
        activeGuideId: id,
        benefits: selection.benefits,
        guides: previous.guides.map(guide => guide.id === id ? { ...guide, owned: true, level: Math.max(1, guide.level) } : guide),
      } : previous);
      webApp.HapticFeedback?.notificationOccurred?.("success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("unableArena"));
    } finally {
      setBusyId(null);
    }
  };

  const activeServerGuide = serverState?.guides.find(guide => guide.id === effectiveActiveId);

  return (
    <div className="game-shell min-h-[100dvh] pb-[calc(var(--tg-safe-area-inset-bottom)+18px)] text-[#fbf8ed]">
      <main className="mx-auto w-full max-w-[620px] px-3 pt-[calc(var(--tg-content-safe-area-inset-top)+12px)]">
        <header className="flex items-center justify-between gap-3">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-xs text-[#c5d0da]"><ArrowLeft size={16} />{t("hub")}</button>
          <LanguageSwitcher compact />
        </header>

        <section className="mt-5 rounded-2xl border border-[#4ce0c4]/25 bg-[#17243a]/85 p-4">
          <div className="flex items-start gap-3">
            <Character3D guideId={effectiveActiveId} size="lg" autoRotate />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[.13em] text-[#4ce0c4]"><Sparkles size={12} />QUEST NEXUS</p>
              <h1 className="mt-1 font-display text-[28px] leading-none tracking-[-.055em]">{copy.roster}</h1>
              <p className="mt-2 text-[12px] leading-relaxed text-[#aebac4]">{copy.safety}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[8px] uppercase tracking-[.1em]">
                <span className={`rounded-full border px-2 py-1 ${verified ? "border-[#4ce0c4]/30 bg-[#4ce0c4]/10 text-[#4ce0c4]" : "border-white/10 bg-white/[.04] text-[#94a2af]"}`}>{verified ? t("verified") : t("visualDemo")}</span>
                {loading && <span className="text-[#f7d774]">{t("syncing")}</span>}
                {activeServerGuide && <span className="text-[#d7fb70]">{activeServerGuide.name} · {activeServerGuide.benefit.label}</span>}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-2">
          {guides.map(guide => {
            const active = guide.id === effectiveActiveId;
            const record = serverState?.guides.find(item => item.id === guide.id);
            const owned = verified ? Boolean(record?.owned) : guide.id === "nexus" || guide.id === activeId;
            const busy = busyId === guide.id;
            return (
              <article key={guide.id} className={`rounded-2xl border p-3 transition ${active ? "border-[#4ce0c4]/60 bg-[#4ce0c4]/[.08]" : "border-white/10 bg-white/[.035]"}`}>
                <div className="flex items-center gap-3">
                  <Character3D guideId={guide.id} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 style={{ color: guide.primary }} className="font-display text-[18px] leading-none tracking-[.06em]">{guide.name}</h2>
                      {guide.unlock === "seasonal" && <span className="rounded-full border border-[#f5b942]/30 bg-[#f5b942]/10 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[.09em] text-[#f7d774]">{copy.seasonal}</span>}
                      {owned && <span className="rounded-full border border-[#4ce0c4]/25 bg-[#4ce0c4]/10 px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[.08em] text-[#4ce0c4]">{t("owned")}</span>}
                    </div>
                    <p className="mt-1 text-[10px] font-medium text-[#dfe6de]">{copy.role[guide.id]}</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-[#93a2b1]">{copy.description[guide.id]}</p>
                    {record && <p className="mt-1 flex items-center gap-1 font-mono text-[8px] uppercase tracking-[.08em] text-[#f7d774]"><Zap size={10} />{record.benefit.label}</p>}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  <div className="rounded-lg bg-black/15 px-2 py-1.5"><p className="font-mono text-[7px] uppercase tracking-[.1em] text-[#8490a0]">{copy.protocol}</p><p className="mt-0.5 text-[10px] text-[#dce8d2]">{copy.protocolValue[guide.id]}</p></div>
                  <div className="rounded-lg bg-black/15 px-2 py-1.5"><p className="font-mono text-[7px] uppercase tracking-[.1em] text-[#8490a0]">{copy.affinity}</p><p className="mt-0.5 text-[10px] text-[#dce8d2]">{copy.affinityValue[guide.id]}</p></div>
                </div>
                <button disabled={busy || (verified && !serverState)} onClick={() => choose(guide.id)} className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[.1em] disabled:cursor-wait disabled:opacity-60 ${active ? "bg-[#4ce0c4] text-[#10201b]" : owned || !verified ? "border border-white/12 bg-white/[.05] text-[#e7efe9]" : "border border-[#f7d774]/30 bg-[#f7d774]/[.08] text-[#f7d774]"}`}>
                  {busy ? t("loading") : active ? <><CheckCircle2 size={13} />{copy.active}</> : owned || !verified ? <><Sparkles size={13} />{copy.choose}</> : <><LockKeyhole size={13} />{t("unlockGuide")} · {serverState?.unlockCostRelics ?? 50} {t("relicCost")}</>}
                </button>
              </article>
            );
          })}
        </section>

        <section className="mt-4 rounded-xl border border-white/[.1] bg-white/[.025] p-3">
          <p className="flex items-start gap-2 text-[10px] leading-relaxed text-[#aebac4]"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#4ce0c4]" />{copy.safety}</p>
          <p className="mt-2 font-mono text-[8px] uppercase tracking-[.1em] text-[#8290a0]">{verified ? t("verifiedEconomy") : t("browserPreview")}</p>
          {error && <p className="mt-2 text-[10px] leading-relaxed text-[#ffb28f]">{error}</p>}
          <button onClick={() => setLocation("/explore")} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#d7fb70] px-3 py-2.5 font-mono text-[9px] font-semibold uppercase tracking-[.1em] text-[#18210f]">{copy.explore}<ChevronRight size={14} /></button>
        </section>
      </main>
    </div>
  );
}
