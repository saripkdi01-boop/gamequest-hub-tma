# Security Audit — GameQuest Hub

**Status:** Fase 1 — audit non-destruktif  
**Tanggal:** 25 Agustus 2026  
**Author:** Manus AI

## Temuan positif yang harus dipertahankan

Helper Telegram memvalidasi `initData` dengan HMAC-SHA-256 menggunakan bot token server-side, memeriksa `auth_date`, dan menggunakan timing-safe comparison. Webhook memeriksa secret header dengan timing-safe comparison. Token tidak memakai prefix `VITE_` dan tidak dikirim ke client.

Batas API game memaksa setiap request melewati validasi Telegram dan upsert pemain server-side. Genesis Run menyimpan seed/progress server dan melakukan completion melalui PostgreSQL RPC. Rewarded-ad menggunakan intent berumur terbatas, verifikasi zone/event/Telegram ID, unique postback, dan RPC atomik dengan idempotency key.

## Temuan risiko dan rekomendasi

| ID | Area | Temuan | Severity | Tindakan |
| --- | --- | --- | --- | --- |
| SEC-01 | Telegram auth | Baseline signature/expiry baik, tetapi action game belum memiliki nonce/session binding khusus | Medium | Tambahkan `game_sessions` atau request nonce yang dibuat server dan dikonsumsi satu kali |
| SEC-02 | Replay | Genesis completion terlindungi oleh status/idempotency, tetapi pola ini belum tersedia untuk setiap answer submission | High | Gunakan `answer_id`/`submission_nonce` unique dan atomic insert sebelum reward |
| SEC-03 | Concurrency | Update `player_quests` progress dilakukan sebelum RPC completion dan tidak menggunakan compare-and-swap pada progress version | High | Tambahkan `version`/row lock atau atomic RPC untuk answer resolution |
| SEC-04 | Economy | Reward existing hanya XP/relic; belum ada QC ledger signed/cached balance/reconciliation | Critical | Buat `coin_ledger`, projection, atomic reward/burn RPC, dan audit log |
| SEC-05 | Answer key | Belum ada question engine; risiko future endpoint mengirim `correct_answer` | Critical | DTO public harus whitelist field; correct answer hanya di server |
| SEC-06 | Rate limiting | Belum terlihat rate limiter per player/IP/action | High | Tambahkan bounded rate limits di API layer dan event audit ketika exceeded |
| SEC-07 | Timing | Belum ada validasi timing answer/impossible speed | High | Server menyimpan issued/submitted timestamps, minimum latency, dan risk score |
| SEC-08 | Redemption | Belum ada queue/review/status machine | Critical | Implementasikan request re-derivation dari ledger, daily cap, cooldown, fraud review, idempotent provider |
| SEC-09 | Admin | Belum ada admin capability game yang terverifikasi | High | Role + allowlist + protected endpoints + audit events |
| SEC-10 | Secrets | README menempatkan `SUPABASE_KEY` sebagai secret/service role; perlu pemeriksaan deployment | High | Pastikan key tidak pernah berada di `VITE_*`, logs, client bundle, atau error payload |
| SEC-11 | Legacy DB | Drizzle/MySQL scaffold masih ada bersamaan dengan Supabase game state | Medium | Jangan mencampur sumber kebenaran; dokumentasikan boundary dan hapus hanya lewat migration terencana |
| SEC-12 | Tests | Baseline test gagal karena env Telegram tidak ada dan service key mendapat permission denied pada `gamequest_players` | High | Pisahkan integration secrets test dari unit suite atau sediakan env test khusus; perbaiki policy/key deployment |

## Model anti-cheat target

Server membuat `question_session` dengan player, mode, question set, seed, issued time, expiration, dan nonce. Client menerima hanya public question DTO: ID, category, difficulty, text, answer options, time limit, dan session context yang tidak membocorkan key.

Pada submission, client hanya mengirim session ID, question ID, answer ID, nonce, dan timing metadata minimum. Server memeriksa kepemilikan session, status, expiry, sequence, nonce, duplicate submission, rate limit, dan answer ID yang valid. Server kemudian mengambil correct answer, menghitung correctness, reward, combo, XP, Mind Score, daily cap, dan fraud score dalam transaksi.

Fraud score adalah sinyal operasional, bukan vonis otomatis. Sinyal meliputi banyak jawaban di bawah minimum latency, pola jawaban identik, sesi paralel, replay nonce, perubahan Telegram identity, volume harian tidak wajar, dan redemption behavior. Sinyal disimpan sebagai `fraud_events` dengan metadata aman dan dapat memicu `REVIEW`.

## Aturan endpoint

Endpoint dilarang menerima operasi berbasis saldo client, termasuk `set balance`, `give coins`, atau payout dengan nominal yang tidak dihitung ulang server. Setiap action harus mengikat player dari Telegram `initData`, bukan dari `player_id` yang dipercaya client. Semua error publik harus generik dan tidak membocorkan secret, answer key, query, atau treasury detail.

## Rencana pengujian keamanan

| Skenario | Hasil yang diharapkan |
| --- | --- |
| Replay submission nonce | Request kedua ditolak atau dikembalikan sebagai duplicate tanpa reward |
| Duplicate HTTP request bersamaan | Hanya satu ledger entry dan satu projection update |
| Answer terlalu cepat | Jawaban dapat dinilai, tetapi risk score/guardrail aktif sesuai policy; tidak ada multiplier palsu |
| Fake Telegram identity | HMAC validation gagal dengan 401 |
| Modified question/answer payload | Server mengabaikan field client yang tidak diizinkan |
| Balance manipulation | Tidak ada endpoint yang menerima saldo client sebagai source of truth |
| Concurrent redemption | Unique pending lock dan row lock mencegah payout ganda |
| Expired session | Submission ditolak tanpa emission |
| Admin endpoint tanpa role | 403 dan audit event |
| Treasury secret probing | Response tidak menyertakan secret atau raw wallet data |

## Kesimpulan

Security baseline existing cukup kuat untuk dijadikan fondasi, tetapi belum cukup untuk ekonomi QC kompetitif. Pekerjaan P0 adalah memperkenalkan session nonce, atomic answer resolution, ledger idempotency, rate limiting, dan redaction DTO sebelum menambahkan redemption atau TON settlement.

## Referensi repository

- [`server/telegram.ts`](../server/telegram.ts)
- [`server/game/http.ts`](../server/game/http.ts)
- [`server/game/service.ts`](../server/game/service.ts)
- [`supabase/migrations/20260824_gamequest_completion_idempotency.sql`](../supabase/migrations/20260824_gamequest_completion_idempotency.sql)
- [`supabase/migrations/20260824_gamequest_ad_reward_atomic.sql`](../supabase/migrations/20260824_gamequest_ad_reward_atomic.sql)
- [`server/telegram.secrets.test.ts`](../server/telegram.secrets.test.ts)
- [`server/supabase.secrets.test.ts`](../server/supabase.secrets.test.ts)
