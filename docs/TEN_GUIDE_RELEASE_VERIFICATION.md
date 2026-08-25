# Ten Guide Release Verification

## Release scope

The release adds a player-facing roster for NEXUS, POCKET, TONBIT, CROSSLINK, NEURA, SOSIALIS, SHIELDTMA, PIXELX, SPEEDRUN, and LEGENDA. Each guide has a role, affinity, protocol, mobile-safe procedural fallback, and a locally persisted visual selection. The selected guide is visible in the Hub control, roster, Explore HUD, and Babylon companion palette.

## Verification record

| Check | Result |
|---|---|
| Type check | `pnpm check` passed. |
| Test suite | `25 passed`, `2 skipped`; includes new ten-guide metadata safety tests. |
| Production build | Passed with constrained Node heap; the Explore route remains a lazy bundle. |
| Deployment | Vercel deployment for commit `2cfab15` is `READY`. |
| Production roster | `/guides` rendered all ten guide entries in Indonesian and exposed one clear selection action per guide. |
| Production handoff | Selecting TONBIT changed the active-card state, then `/explore?demo=1` showed `TONBIT`, `Ledger Denyut`, and `Vault & toko` in the running route HUD. |
| Browser console | No console output after roster-to-Explore demo handoff. |
| Runtime observability | No Vercel runtime error clusters in the checked 30-minute window. |

## Controlled states retained

The release does not activate client reward grants, guide bonuses, Stars checkout, ad reward validation, referral payouts, VIP/season entitlements, relic staking, wallet proof, redemption, fixed conversion, or token trading. The new Supabase SQL is stored in `supabase/proposals/` rather than the applied migration path and begins all sensitive feature flags as disabled.

The previous failed deployment for commit `562a7e4` was diagnosed as a missing tracked `GuideRoster.tsx` file. Commit `2cfab15` included the route, and its subsequent production deployment succeeded.
