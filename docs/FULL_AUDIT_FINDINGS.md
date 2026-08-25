# Full TMA audit findings — 2026-08-25

Baseline repository was clean and `pnpm check` plus `pnpm test` passed with 22 tests passing and 2 skipped. The production deployment under review is the current READY deployment of QUEST//MIND.

The first confirmed bug was the JSON crash shown in the supplied screenshots. The client response parser now handles JSON, plain text, HTML, and malformed success bodies without throwing an uncaught `Unexpected token` exception. The browser preview of Reward Vault showed a controlled provider-disabled state and no console output. Stars Store showed six item cards, no premature invoice, and no console output. The dashboard showed compact stats, item summary, Stars CTA, and no console output.

The `/mind` arena route loaded successfully in browser preview. KNOW and CHAIN were selectable, locked modes remained visually disabled, the Telegram verification notice was clear, and the route produced no console output. Reward creation remains disabled in browser preview by design.

Remaining audit targets are profile, leaderboard, Genesis Run, result recovery, wallet, and the actual Telegram-session API path. Payment and rewarded-ad completion cannot be fully exercised without approved provider credentials and a real Telegram session.

Profile route loaded successfully in browser preview. It displayed profile identity, month, language, leaderboard link, dashboard statistics, and XP progress without a runtime error. The Profile route console was empty. The visible preview is intentionally non-authenticated, so live Telegram persistence was not exercised in this browser session.

Leaderboard route loaded in browser preview with season label and localized empty/loading presentation; console remained empty. The screenshot showed a loading spinner at the time of capture, so the next verification should confirm that the asynchronous request resolves or presents a bounded timeout/error state rather than spinning indefinitely.

Direct endpoint audit found a production regression requiring immediate repair: `GET /api/telegram/health` returned JSON 200 and `GET /api/game/leaderboard` returned JSON 200, but `POST /api/game/dashboard` with an empty JSON body returned HTTP 500 `FUNCTION_INVOCATION_FAILED` as Vercel plain text instead of the expected structured 401 JSON. This is a real serverless failure, not a client-only parsing issue, and must be fixed before the next deployment.

The final production endpoint regression after the module import patch returned JSON 401 for an empty authenticated request, JSON 400 for malformed JSON, and JSON 200 for leaderboard. The previous Vercel 500 was traced to `api/game/dashboard.ts` and `api/telegram/webhook.ts` importing `../_lib/game/stars-service` without the runtime `.js` bundle; both now import `../_runtime/game-stars-service.js`.

The first Result browser visit showed a blank screen because the newly localized ErrorBoundary called `useI18n` outside `I18nProvider`. App provider order was corrected. On the next READY deployment, `/result?audit=1` displayed the localized safe recovery panel and a working return button; console was empty. Direct Result access no longer displays fallback XP/relic rewards.

Genesis Run direct browser preview correctly showed the localized verified-session notice and return CTA; no reward or route crash was exposed. Its production console was empty. The route is not fully playable in this sandbox because Telegram initData is intentionally absent.

Explore demo loaded the Babylon canvas, remote visual target, companion, checkpoint 1/3, and three path choices. The visual asset and HUD were visible at the same time and the console was empty. The visual demo is therefore stable in the tested browser path; real reward persistence remains gated behind Telegram initData.

Vercel runtime error clustering for the last 30 minutes reported no runtime error clusters after the final deployment. The tested production API responses and browser routes are now stable for the unauthenticated preview path.

Known test boundary: a real Telegram account session, approved AdsGram callback, and live Stars payment cannot be simulated from this browser session. Those flows remain protected by server validation and feature flags rather than being falsely marked as passed.
