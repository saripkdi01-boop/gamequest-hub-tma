import { describe, expect, it } from "vitest";
import { isSupportedLanguage, languageFromTelegramCode, SUPPORTED_LANGUAGES } from "../../shared/languages";

describe("GameQuest language registry", () => {
  it("exposes 20+ unique locales", () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(SUPPORTED_LANGUAGES.map(language => language.code)).size).toBe(SUPPORTED_LANGUAGES.length);
    expect(isSupportedLanguage("id")).toBe(true);
    expect(isSupportedLanguage("xx")).toBe(false);
  });

  it("maps Telegram language codes to supported app locales", () => {
    expect(languageFromTelegramCode("id")).toBe("id");
    expect(languageFromTelegramCode("pt-br")).toBe("pt");
    expect(languageFromTelegramCode("unknown")).toBe("en");
  });
});
