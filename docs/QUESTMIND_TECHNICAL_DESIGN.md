# QUEST//MIND — Technical Design

**Status:** Fase 2 — desain sebelum implementasi  
**Tanggal:** 25 Agustus 2026  
**Author:** Manus AI

## Keputusan arsitektur

QUEST//MIND akan dibangun sebagai perluasan repository existing. Supabase menjadi sumber kebenaran untuk player state, session, questions, ledger, caps, dan redemption. Vercel functions/Express tetap menjadi HTTP adapter. React/Vite tetap menjadi Mini App client. Babylon tetap dipisahkan sebagai optional exploration layer.

Telegram `initData` tetap divalidasi di server; dokumentasi resmi Telegram juga menekankan bahwa data initialization hanya boleh dipercaya setelah divalidasi di server [1]. TON Connect hanya menjadi lapisan koneksi wallet non-custodial untuk fase redemption; protokol tersebut memungkinkan dApp membaca address dan meminta transaksi tanpa menyentuh private key pengguna [2].

## Prioritas delivery

| Fase | Cakupan | Tidak termasuk |
| --- | --- | --- |
| MVP-1 | Dashboard, KNOW, CHAIN, XP, Mind Score, QC internal ledger, daily quest, leaderboard, energy, power-up | Payout, TON transaction, admin lengkap |
| MVP-2 | BLUFF, BOSS, WORLD, achievements, season | Redemption aktif |
| MVP-3 | Treasury dashboard, redemption status/review, `RedemptionProvider`, TON Connect UI | Custodial wallet/private key |
| Hardening | Replay/race/rate tests, RLS/migration checks, performance profiling, deployment verification | Unlimited fixed payout |

## Bounded contexts

| Context | Tanggung jawab | Source of truth |
| --- | --- | --- |
| Identity | Telegram validation, player upsert, session binding | Telegram signed initData + `gamequest_players` |
| Question | Question pool, difficulty, schedule, public DTO, answer key | Supabase `questions` |
| Session | Start, sequence, nonce, expiration, answer submissions | Supabase `question_sessions` + `question_answers` |
| Progression | XP, Mind Score, streak, level, daily score | Ledger/events + player projection |
| Economy | QC emission, burn, caps, circulating accounting | `coin_ledger` + `economy_config` |
| Competition | Daily/weekly/season leaderboard | Score projection/snapshot |
| Fraud | Replay, timing, rate, risk signals | `fraud_events` + session metadata |
| Settlement | Redemption eligibility/review/provider abstraction | `redemptions` + `redemption_ledger` |
| Exploration | Genesis Run/Babylon visuals | Existing `player_quests`; tidak memutuskan reward client-side |

## Session state machine

```text
CREATED → ACTIVE → COMPLETED
             ├── EXPIRED
             ├── ABANDONED
             └── REVIEW
```

A session membawa `mode`, `question_ids`, `current_index`, `nonce`, `issued_at`, `expires_at`, `client_capabilities`, dan `risk_state`. Satu player tidak boleh memiliki sesi aktif yang konflik untuk mode yang sama. Setiap answer memiliki unique constraint pada `(session_id, question_id)` atau `(session_id, sequence_no)` sesuai pilihan implementasi.

## Public question DTO

```ts
{
  id: string;
  category: string;
  difficulty: "easy" | "medium" | "hard" | "boss";
  question: string;
  answers: Array<{ id: string; text: string }>;
  timeLimitMs: number;
  sequence: number;
  sessionId: string;
  expiresAt: string;
}
```

`correct_answer`, explanation privat, seed scoring, dan rule multiplier tidak boleh berada dalam DTO atau initial client bundle. Server mengembalikan explanation setelah submission sebagai bagian result.

## Scoring pipeline

```text
validate Telegram identity
  → validate session + nonce + sequence + expiry
  → load question server-side
  → resolve correctness
  → compute speed/mode/combo multiplier
  → clamp by per-answer and daily cap
  → compute XP + Mind Score independently
  → insert ledger entries with idempotency keys
  → update projections and leaderboard atomically
  → return result + safe explanation
```

Semua langkah yang memengaruhi reward harus berada di satu transaction boundary. Bila adapter HTTP mengalami retry setelah commit, idempotency key mengembalikan result yang sama tanpa emission kedua.

## API boundary target

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| POST | `/api/game/dashboard` | Read model dashboard QUEST//MIND |
| POST | `/api/game/quiz/start` | Membuat/melanjutkan session mode |
| POST | `/api/game/quiz/answer` | Server resolve jawaban + reward |
| POST | `/api/game/quiz/finish` | Menutup session bila mode memerlukannya |
| GET | `/api/game/leaderboard?scope=daily` | Leaderboard paginated |
| POST | `/api/game/powerups/use` | Burn QC/energy dan grant utility |
| POST | `/api/game/redemptions/eligibility` | Mengembalikan status eligible secara server-side |
| POST | `/api/game/redemptions` | Membuat request pending/review; belum payout |
| POST | `/api/game/wallet/connect-intent` | Mengikat wallet address ke player setelah TON Connect |
| GET | `/api/admin/economy` | Dashboard protected |
| POST | `/api/admin/economy/config` | Update config protected + audited |

Genesis endpoints existing tetap aktif selama migrasi untuk backward compatibility.

## Admin boundary

Admin UI dan endpoints tidak boleh memakai hanya field yang berasal dari browser. Role harus berasal dari server-side authorization/allowlist. Setiap update question/config/fraud/redemption memiliki audit event, actor, old value summary, new value summary, dan timestamp. Secret treasury tidak pernah dikirim ke client.

## Observability minimum

Gunakan structured event identifiers tanpa token atau payload privat: `quiz_session_started`, `answer_resolved`, `reward_ledger_committed`, `duplicate_request`, `fraud_signal_recorded`, `redemption_requested`, `redemption_status_changed`, dan `wallet_connect_intent_created`. Logging harus meredaksi `initData`, bot token, Supabase key, wallet secret, dan correct answer.

## Referensi

[1]: https://core.telegram.org/bots/webapps "Telegram Mini Apps — official documentation"
[2]: https://docs.ton.org/applications/ton-connect/overview "TON Connect overview — TON Docs"
[3]: https://supabase.com/docs/guides/database/postgres/row-level-security "Row Level Security — Supabase Docs"

Supabase menyarankan RLS diaktifkan pada setiap tabel schema exposed, grants dibatasi, serta tabel diuji dengan policy tests [3]. Karena game mutasi dilakukan server-side, tabel baru akan mengikuti pola `enable row level security`, revoke dari `anon/authenticated`, grant terbatas ke `service_role`, dan RPC `security definer` yang search path-nya ditetapkan.
