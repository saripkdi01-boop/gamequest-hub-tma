import { Globe2, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n";
import type { LanguageCode } from "../../../shared/languages";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, languages, setLanguage, saving, t } = useI18n();
  return (
    <label className={`flex items-center gap-2 rounded-full border border-white/10 bg-white/[.045] ${compact ? "px-2.5 py-2" : "px-3 py-2"}`}>
      {saving ? <Loader2 size={14} className="animate-spin text-[#d7fb70]" /> : <Globe2 size={14} className="text-[#d7fb70]" />}
      <span className="sr-only">{t("language")}</span>
      <select aria-label={t("language")} value={language} onChange={event => void setLanguage(event.target.value as LanguageCode)} className="max-w-[160px] bg-transparent font-mono text-[10px] uppercase tracking-[.1em] text-[#e8f5c6] outline-none">
        {languages.map(option => <option key={option.code} value={option.code} className="bg-[#162235] text-[#fbf8ed]">{option.flag} · {option.nativeName}</option>)}
      </select>
    </label>
  );
}
