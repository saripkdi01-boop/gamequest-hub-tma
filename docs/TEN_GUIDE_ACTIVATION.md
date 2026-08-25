# Ten Guide Economy and Activation Boundary

The ten-guide release is intentionally **presentation-first**. A player can select NEXUS, POCKET, TONBIT, CROSSLINK, NEURA, SOSIALIS, SHIELDTMA, PIXELX, SPEEDRUN, or LEGENDA as a visual guide. This selection changes the roster UI and the procedural companion palette; it does not create value, alter quest scoring, issue an item, open a payment flow, or bind a wallet.

| Capability | Current implementation | Required production evidence before activation |
|---|---|---|
| Guide selection | Local visual preference with safe fallback | Optional authenticated server preference RPC and RLS review |
| Guide-specific reward | Disabled | Quest rules, anti-cheat review, daily cap, authoritative API mutation, idempotent ledger test |
| Referral | Disabled contract proposal only | Campaign rules, fraud controls, verified first-action rule, idempotent claim writer |
| VIP and Season Pass | Disabled contract proposal only | Final catalog, Stars price/SKU, terms, support contact, verified Stars payment webhook |
| Relic staking and vesting | Disabled | Token/entitlement model, lock and claim rules, audit, legal approval, atomic server RPC |
| TON wallet proof | Connection-only elsewhere in the app | Signed proof policy, treasury/legal approval, abuse controls, independent security review |
| TON redemption or conversion | Not implemented | Separate audited launch decision; no fixed conversion or private key may exist in client code |

The SQL under `supabase/proposals/` is intentionally outside the migration path. It has not been executed and starts every sensitive feature flag as `false`. It must be reviewed against the production schema, applied in a controlled migration, and paired with server-only APIs before any UI changes from “unavailable” to “active.”
