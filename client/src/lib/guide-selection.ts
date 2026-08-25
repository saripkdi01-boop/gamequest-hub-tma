import { getGuide, isGuideId, type Guide, type GuideId } from "@/game/guides";

const storageKey = "gamequest-active-guide";

export function readActiveGuide(): Guide {
  if (typeof window === "undefined") return getGuide("nexus");
  const stored = window.localStorage.getItem(storageKey);
  return getGuide(isGuideId(stored) ? stored : "nexus");
}

export function writeActiveGuide(id: GuideId): Guide {
  const guide = getGuide(id);
  if (typeof window !== "undefined") window.localStorage.setItem(storageKey, guide.id);
  return guide;
}

export function subscribeActiveGuide(onChange: (guide: Guide) => void) {
  if (typeof window === "undefined") return () => undefined;
  const listener = (event: StorageEvent) => {
    if (event.key === storageKey) onChange(readActiveGuide());
  };
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}
