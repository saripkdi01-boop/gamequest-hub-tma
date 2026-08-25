export const SUPPORTED_LANGUAGES = [
  { code: "en", telegramCodes: ["en"], name: "English", nativeName: "English", flag: "EN" },
  { code: "id", telegramCodes: ["id"], name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "ID" },
  { code: "es", telegramCodes: ["es"], name: "Spanish", nativeName: "Español", flag: "ES" },
  { code: "fr", telegramCodes: ["fr"], name: "French", nativeName: "Français", flag: "FR" },
  { code: "de", telegramCodes: ["de"], name: "German", nativeName: "Deutsch", flag: "DE" },
  { code: "pt", telegramCodes: ["pt", "pt-br"], name: "Portuguese", nativeName: "Português", flag: "PT" },
  { code: "ru", telegramCodes: ["ru"], name: "Russian", nativeName: "Русский", flag: "RU" },
  { code: "zh", telegramCodes: ["zh", "zh-hans", "zh-hant"], name: "Chinese", nativeName: "中文", flag: "ZH" },
  { code: "ja", telegramCodes: ["ja"], name: "Japanese", nativeName: "日本語", flag: "JA" },
  { code: "ko", telegramCodes: ["ko"], name: "Korean", nativeName: "한국어", flag: "KO" },
  { code: "ar", telegramCodes: ["ar"], name: "Arabic", nativeName: "العربية", flag: "AR" },
  { code: "hi", telegramCodes: ["hi"], name: "Hindi", nativeName: "हिन्दी", flag: "HI" },
  { code: "tr", telegramCodes: ["tr"], name: "Turkish", nativeName: "Türkçe", flag: "TR" },
  { code: "it", telegramCodes: ["it"], name: "Italian", nativeName: "Italiano", flag: "IT" },
  { code: "nl", telegramCodes: ["nl"], name: "Dutch", nativeName: "Nederlands", flag: "NL" },
  { code: "pl", telegramCodes: ["pl"], name: "Polish", nativeName: "Polski", flag: "PL" },
  { code: "uk", telegramCodes: ["uk"], name: "Ukrainian", nativeName: "Українська", flag: "UA" },
  { code: "vi", telegramCodes: ["vi"], name: "Vietnamese", nativeName: "Tiếng Việt", flag: "VI" },
  { code: "th", telegramCodes: ["th"], name: "Thai", nativeName: "ไทย", flag: "TH" },
  { code: "ms", telegramCodes: ["ms"], name: "Malay", nativeName: "Bahasa Melayu", flag: "MS" },
  { code: "fil", telegramCodes: ["fil"], name: "Filipino", nativeName: "Filipino", flag: "PH" },
  { code: "sw", telegramCodes: ["sw"], name: "Swahili", nativeName: "Kiswahili", flag: "SW" },
  { code: "fa", telegramCodes: ["fa"], name: "Persian", nativeName: "فارسی", flag: "FA" },
  { code: "bn", telegramCodes: ["bn"], name: "Bengali", nativeName: "বাংলা", flag: "BN" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export function isSupportedLanguage(value: unknown): value is LanguageCode {
  return typeof value === "string" && SUPPORTED_LANGUAGES.some(language => language.code === value);
}

export function languageFromTelegramCode(value: string | null | undefined): LanguageCode {
  const normalized = value?.toLowerCase();
  const match = SUPPORTED_LANGUAGES.find(language => language.telegramCodes.some(code => code === (normalized ?? "")));
  return match?.code ?? "en";
}
