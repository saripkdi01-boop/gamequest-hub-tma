import { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import { useLocation } from "wouter";
import Character3D from "@/components/Character3D";
import { guideCopy } from "@/game/guide-copy";
import { getGuide, type GuideId } from "@/game/guides";
import { getDashboard } from "@/lib/game-api";
import { readActiveGuide } from "@/lib/guide-selection";
import { useI18n } from "@/i18n";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

export default function GuideQuickNav() {
  const [location, setLocation] = useLocation();
  const { language, t } = useI18n();
  const { webApp } = useTelegramWebApp();
  const [serverGuideId, setServerGuideId] = useState<GuideId | null>(null);
  const localGuide = readActiveGuide();
  const guide = getGuide(serverGuideId ?? localGuide.id);
  const copy = guideCopy(language);

  useEffect(() => {
    if (!webApp?.initData) return;
    getDashboard(webApp.initData).then(({ dashboard }) => setServerGuideId(dashboard.guideState.activeGuideId)).catch(() => undefined);
  }, [webApp?.initData]);

  if (location !== "/") return null;

  return <button onClick={() => setLocation("/guides")} className="fixed bottom-[calc(var(--tg-safe-area-inset-bottom)+14px)] right-4 z-30 flex items-center gap-2 rounded-full border border-[#4ce0c4]/35 bg-[#121d31]/95 py-1.5 pl-1.5 pr-3 shadow-[0_10px_24px_rgba(0,0,0,.32)] backdrop-blur"><Character3D guideId={guide.id} size="sm" /><span className="flex flex-col items-start"><span className="font-mono text-[7px] uppercase tracking-[.1em] text-[#9fae9d]">{copy.active || t("activeGuide")}</span><span className="flex items-center gap-1 text-[10px] font-semibold text-[#e6f9ff]"><UsersRound size={11} />{guide.name}</span></span></button>;
}
