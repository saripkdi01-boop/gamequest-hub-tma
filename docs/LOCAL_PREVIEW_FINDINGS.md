# Local preview findings — worldclass v2

Captured from the production bundle preview at `http://127.0.0.1:4173/`.

## Home

The command deck renders the language switcher, Profile, Guide Roster, daily relic claim CTA, energy sync CTA, Quest//Mind play CTA, Stars store CTA, rank link, Genesis Run board, Reward Vault, and server-backed active guide summary. Preview mode shows safe zero-value/fallback state and does not attempt authenticated mutations.

## Profile

The dossier renders Profile, language switcher, active NEXUS guide with benefit copy, Guide Roster navigation, daily login streak card, leaderboard summary, six-stat dashboard including energy as `10/10`, level progress, and “Server-verified economy”. No rendering exception or missing contract appeared.

The red/yellow boxes in the browser output are automation annotations, not UI elements in the app.

## Guide roster

The roster renders all ten canonical characters with iconography, role, protocol, affinity, ownership state, and a single active/choose CTA per card. Preview mode clearly labels the visual-only boundary and keeps non-owned guides in choose mode without attempting server mutations.
