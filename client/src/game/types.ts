import type { GuideId } from "./guides";

export type ExploreRouteState = {
  checkpointIndex: number;
  focusedGate: number | null;
};

export type GameHandle = {
  dispose: () => void;
  updateRoute: (state: ExploreRouteState) => void;
  updateGuide: (guideId: GuideId) => void;
};
