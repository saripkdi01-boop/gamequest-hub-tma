# Quest Nexus Worldclass Upgrade v2

## Scope

This release implements a production-backed progression vertical slice based on the supplied `pasted_content.txt` recommendations. It focuses on features that can be activated safely today: a persistent ten-guide roster, server-verified guide ownership, Relics-based unlocks, active guide selection, daily login streaks, and energy recovery.

Telegram `initData` authentication remains mandatory for all mutations. Browser preview remains presentation-only and cannot create Relics, select a server guide, claim daily login rewards, or recover energy.

## Implemented features

| Surface | Behavior | Authority |
|---|---|---|
| Guide roster | NEXUS is granted as the initial guide. Other guides can be unlocked for 50 Relics when the player balance is sufficient. | Supabase RPC with row lock |
| Active guide | Only owned guides can be selected. The active guide is persisted on `gamequest_players.active_guide_id`. | Supabase RPC |
| Guide benefits | The active guide exposes a stable benefit contract. Pocket changes the server-derived energy cap to 12; other benefits are catalogued for later audited integrations. | Server catalog/RPC |
| Daily login | UTC-based seven-day streak with Relics track `[1,2,3,4,5,6,10]`. Same-day claims are idempotent. | Supabase RPC plus unique daily claim key |
| Energy recovery | One energy tick is recovered per 30 minutes, capped by the active guide benefit. | Supabase RPC with row lock |
| Home command deck | Active guide, benefit label, daily login CTA, streak, energy cap, and energy sync state are visible. | Dashboard API |
| Profile dossier | Profile shows active guide, guide benefit, daily streak, energy cap, and economy verification status. | Profile API + dashboard |
| Quick navigation | GuideQuickNav uses server active-guide state when inside Telegram and local selection only for preview. | Dashboard API with safe fallback |

## Safety boundaries

The release does not enable real-money redemption, token price promises, staking, vesting, VIP payment, ad reward bypasses, or wallet settlement. Telegram Stars remain limited to configured digital goods and server-side payment verification. Rewarded advertising remains provider-verification dependent. No client-provided balance, reward amount, or completion result is trusted.

The migration grants new RPC execution only to `service_role`, keeps new tables behind RLS, and uses row locks plus unique idempotency keys for unlock and daily login mutations.

## Database migration

Migration file: `supabase/migrations/20260825_economy_v2_guides_daily_login.sql`

Production project: `ibvcfdfsjpytwpnxgylm`

Validated production objects:

- `public.player_guides`
- `public.daily_login_claims`
- `public.get_guide_benefits(text)`
- `public.select_guide(uuid,text)`
- `public.unlock_guide_relics(uuid,text)`
- `public.claim_daily_login(uuid)`
- `public.regenerate_energy(uuid)`

## Verification

`pnpm check` passes. `pnpm test` passes with 33 tests passed and 2 intentionally skipped. `pnpm build` completes successfully. The Vite build reports existing large Babylon.js chunks for `/explore`; gameplay remains split into route chunks and the upgrade does not add Babylon dependencies to the dashboard path.

## Owner-side activation notes

The owner must open the Mini App from Telegram to exercise the authenticated mutations. A player needs at least 50 server-recorded Relics to unlock a non-NEXUS guide. If a provider or payment catalog is not configured, the UI must continue showing the existing locked/disabled state rather than inventing a reward or purchase result.

## Follow-up candidates

The next safe expansion is to apply guide multipliers to audited reward RPCs only after a fixture-backed balance and anti-replay test plan is approved. Separate production work is required for Adsgram/Monego provider credentials, Telegram Stars catalog activation, TON Connect proof binding, and any redemption or token settlement policy.
