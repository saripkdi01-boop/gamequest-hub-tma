export type TelegramThemeParams = Record<string, string | undefined>;

export type TelegramWebAppUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
};

export type TelegramWebApp = {
  initData: string;
  initDataUnsafe?: { user?: TelegramWebAppUser };
  colorScheme?: "light" | "dark";
  themeParams: TelegramThemeParams;
  safeAreaInset?: { top: number; bottom: number; left: number; right: number };
  contentSafeAreaInset?: { top: number; bottom: number; left: number; right: number };
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  onEvent?: (eventType: string, callback: () => void) => void;
  offEvent?: (eventType: string, callback: () => void) => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred?: (type: "error" | "success" | "warning") => void;
  };
  MainButton?: {
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  openInvoice?: (url: string, callback?: (status: string) => void) => void;
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getTelegramWebApp(): TelegramWebApp | undefined {
  return typeof window === "undefined" ? undefined : window.Telegram?.WebApp;
}

function setInsetVariable(name: string, value = 0) {
  document.documentElement.style.setProperty(name, `${value}px`);
}

export function applyTelegramAppearance(webApp: TelegramWebApp) {
  const theme = webApp.themeParams ?? {};
  const root = document.documentElement;

  root.dataset.telegramTheme = webApp.colorScheme ?? "dark";
  root.style.setProperty("--tg-bg-color", theme.bg_color ?? "#10192a");
  root.style.setProperty("--tg-secondary-bg-color", theme.secondary_bg_color ?? "#172236");
  root.style.setProperty("--tg-text-color", theme.text_color ?? "#f6f3ea");
  root.style.setProperty("--tg-hint-color", theme.hint_color ?? "#9aa8bb");
  root.style.setProperty("--tg-button-color", theme.button_color ?? "#d7fb70");
  root.style.setProperty("--tg-button-text-color", theme.button_text_color ?? "#15200c");

  setInsetVariable("--tg-safe-area-inset-top", webApp.safeAreaInset?.top);
  setInsetVariable("--tg-safe-area-inset-bottom", webApp.safeAreaInset?.bottom);
  setInsetVariable("--tg-content-safe-area-inset-top", webApp.contentSafeAreaInset?.top);
  setInsetVariable("--tg-content-safe-area-inset-bottom", webApp.contentSafeAreaInset?.bottom);
}

export function initializeTelegramWebApp(): TelegramWebApp | undefined {
  const webApp = getTelegramWebApp();
  if (!webApp) return undefined;

  webApp.ready();
  webApp.expand();
  webApp.setHeaderColor?.("#10192a");
  webApp.setBackgroundColor?.("#10192a");
  applyTelegramAppearance(webApp);
  return webApp;
}
