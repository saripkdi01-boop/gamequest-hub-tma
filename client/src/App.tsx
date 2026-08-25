import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import QuestRun from "./pages/QuestRun";
import QuestResult from "./pages/QuestResult";
import Leaderboard from "./pages/Leaderboard";
import RewardBonus from "./pages/RewardBonus";
import Profile from "./pages/Profile";
import { I18nProvider, useI18n } from "./i18n";

const ExploreRoute = lazy(() => import("./pages/ExploreRoute"));
const QuizArena = lazy(() => import("./pages/QuizArena"));
const WalletRoute = lazy(() => import("./pages/WalletRoute"));
const StarsStoreRoute = lazy(() => import("./pages/StarsStoreRoute"));

function RouteLoading({ label }: { label: "exploreRoute" | "chooseArena" }) { const { t } = useI18n(); return <div className="game-shell grid min-h-[100dvh] place-items-center font-mono text-[10px] uppercase tracking-[.14em] text-[#d7fb70]">{t("loading")} · {t(label)}…</div>; }
function ExploreRouteRoute() { return <Suspense fallback={<RouteLoading label="exploreRoute" />}><ExploreRoute /></Suspense>; }
function QuizArenaRoute() { return <Suspense fallback={<RouteLoading label="chooseArena" />}><QuizArena /></Suspense>; }
function WalletRouteRoute() { return <Suspense fallback={<RouteLoading label="exploreRoute" />}><WalletRoute /></Suspense>; }
function StarsStoreRouteRoute() { return <Suspense fallback={<RouteLoading label="exploreRoute" />}><StarsStoreRoute /></Suspense>; }

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/quest"} component={QuestRun} />
      <Route path={"/explore"} component={ExploreRouteRoute} />
      <Route path={"/mind"} component={QuizArenaRoute} />
      <Route path={"/result"} component={QuestResult} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/bonus"} component={RewardBonus} />
      <Route path={"/wallet"} component={WalletRouteRoute} />
      <Route path={"/stars"} component={StarsStoreRouteRoute} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
