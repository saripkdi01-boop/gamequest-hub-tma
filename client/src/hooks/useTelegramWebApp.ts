import { useEffect, useState } from "react";
import { applyTelegramAppearance, getTelegramWebApp, initializeTelegramWebApp, type TelegramWebApp } from "@/lib/telegram";

export function useTelegramWebApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | undefined>(() => getTelegramWebApp());

  useEffect(() => {
    const instance = initializeTelegramWebApp();
    setWebApp(instance);
    if (!instance?.onEvent || !instance.offEvent) return;

    const refreshAppearance = () => applyTelegramAppearance(instance);
    instance.onEvent("themeChanged", refreshAppearance);
    instance.onEvent("safeAreaChanged", refreshAppearance);
    instance.onEvent("contentSafeAreaChanged", refreshAppearance);

    return () => {
      instance.offEvent?.("themeChanged", refreshAppearance);
      instance.offEvent?.("safeAreaChanged", refreshAppearance);
      instance.offEvent?.("contentSafeAreaChanged", refreshAppearance);
    };
  }, []);

  return { webApp, isTelegram: Boolean(webApp) };
}
