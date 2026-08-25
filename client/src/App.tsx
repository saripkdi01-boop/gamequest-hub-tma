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
import { I18nProvider } from "./i18n";

const ExploreRoute = lazy(() => import("./pages/ExploreRoute"));
const QuizArena = lazy(() => import("./pages/QuizArena"));

function ExploreRouteRoute() {
  return <Suspense fallback={<div className="game-shell grid min-h-[100dvh] place-items-center font-mono text-xs uppercase tracking-[.16em] text-[#d7fb70]">Loading exploration route…</div>}><ExploreRoute /></Suspense>;
}

function QuizArenaRoute() {
  return <Suspense fallback={<div className="game-shell grid min-h-[100dvh] place-items-center font-mono text-xs uppercase tracking-[.16em] text-[#d7fb70]">Loading quiz arena…</div>}><QuizArena /></Suspense>;
}

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
