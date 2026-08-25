# Architecture Audit — GameQuest Hub → QUEST//MIND

**Status:** Fase 1 — audit non-destruktif  
**Tanggal:** 25 Agustus 2026  
**Author:** Manus AI

## Ringkasan eksekutif

Repository existing adalah fondasi yang layak dipertahankan untuk upgrade QUEST//MIND. Jalur autentikasi Telegram, webhook, Vercel entrypoint, Supabase server client, server-authoritative Genesis Run, leaderboard, serta rewarded-ad intent/postback sudah tersedia. Namun, produk saat ini masih berupa vertical slice eksplorasi berbasis XP dan relics. Belum terdapat question engine, mode kuis kompetitif, QC ledger, treasury, redemption, TON Connect abstraction, season system, admin panel, atau fraud scoring yang dipersyaratkan prompt.

Keputusan audit: **jangan membuat repository baru dan jangan melakukan rewrite total**. Perluasan harus dilakukan secara incremental dengan memisahkan core quiz engine dari Babylon exploration layer. Genesis Run tetap dipertahankan sebagai mode/adventure opsional.

## Arsitektur existing yang terverifikasi

| Lapisan | Implementasi existing | Penilaian | Keputusan upgrade |
| --- | --- | --- | --- |
| Telegram Mini App | React + Vite, Telegram Web Apps SDK hook, safe-area/mobile shell | Layak dipakai ulang | Pertahankan dan perluas navigasi menjadi QUEST, RANK, PROFILE |
| API lokal | Express di `server/_core/index.ts` dan route game | Layak untuk development | Pertahankan sebagai adapter lokal |
| Production API | Vercel functions di `api/` dengan runtime bundle | Sudah berjalan | Pertahankan pola entrypoint, tambahkan endpoint per fase |
| Telegram auth | HMAC-SHA-256 `initData`, expiry 24 jam, timing-safe compare | Security baseline baik | Pertahankan; tambahkan request nonce/session binding untuk action game |
| Webhook bot | Secret header `X-Telegram-Bot-Api-Secret-Token`, command `/start` dan `/run` | Cukup untuk bootstrap | Pertahankan; tambahkan deep links/challenge links setelah core stabil |
| Game data | Supabase PostgreSQL melalui `@supabase/supabase-js` | Sumber data game yang benar | Jadikan Supabase satu-satunya sumber data ekonomi/game |
| Legacy scaffold auth | Drizzle/MySQL `users` table | Tidak tampak menjadi sumber data game | Jangan perluas untuk ekonomi; dokumentasikan sebagai scaffold terpisah atau konsolidasikan kemudian |
| Current game engine | Pure TypeScript Genesis checkpoints dengan deterministic seed | Aman sebagai vertical slice | Pertahankan sebagai adapter adventure; bangun `question-engine` terpisah |
| Rendering | BabylonJS lazy-loaded melalui `GameCanvas` | Sesuai target performa | Jangan load pada dashboard/quiz; gunakan hanya exploration layer |
| Rewards | RPC Supabase atomic untuk XP/relic, immutable-ish ledger dengan idempotency key | Pola baik, cakupan sempit | Gunakan pola transaksi ini untuk QC ledger, burn, dan redemption |
| Rewarded ads | Intent, expiry, zone verification, postback dedupe, atomic RPC | Baseline baik | Pertahankan; ubah reward utility/QC hanya setelah economy config siap |

## Alur data existing

```text
Telegram WebView
  → client mengirim initData
  → server memvalidasi HMAC dan expiry
  → server upsert gamequest_players
  → service membaca quest/run/daily dari Supabase
  → client merender state aman
  → client mengirim pilihan run
  → server memvalidasi pilihan berdasarkan seed + progress
  → RPC mengunci run/player dan mencatat XP/relic ledger
  → projection player/daily/leaderboard diperbarui
```

Alur ini sudah sesuai prinsip server-authoritative. Yang perlu diubah adalah memperluas domain data, bukan memindahkan aturan ke klien.

## Batas arsitektur yang ditemukan

`server/game/service.ts` hanya mengenal slug `genesis-run`; payload dashboard hanya mengembalikan XP, level, streak, relics, satu quest aktif, dan dua counter harian. `server/game/engine.ts` hanya berisi tiga checkpoint dan pilihan momentum, bukan pertanyaan pilihan ganda. Migration active membuat `player_reward_ledger` dengan currency `xp` atau `relic`, sehingga tidak dapat langsung menampung QC tanpa migration baru.

Ada dua representasi server: source TypeScript di `server/` dan runtime bundle di `api/_runtime/`. Script build meng-generate runtime bundle sebelum Vite build. Setiap perubahan pada service/API harus diuji melalui source lokal dan hasil build Vercel agar kedua jalur tetap sinkron.

## Risiko prioritas

| Prioritas | Risiko | Dampak | Mitigasi awal |
| --- | --- | --- | --- |
| P0 | Menambahkan QC sebagai kolom saldo tanpa ledger immutable | Duplikasi reward atau manipulasi saldo | Tambahkan `coin_ledger`, transaction RPC, cached projection hanya sebagai akselerator |
| P0 | Validasi jawaban atau correctness berada di client | Cheat dan answer-key leakage | Client hanya menerima question tanpa `correct_answer`; server mengoreksi submission |
| P0 | Completion update dan reward tidak satu transaksi | Balance dan ledger dapat tidak konsisten | Gunakan RPC PostgreSQL dengan row lock dan idempotency key |
| P1 | Dua endpoint API menerima aturan berbeda | Perilaku production/local tidak konsisten | Satu service/domain module, adapter HTTP tipis |
| P1 | Season, daily cap, dan timezone hard-coded | Operasi ekonomi sulit dikontrol | `economy_config`, season config, server UTC |
| P1 | Babylon dimuat pada initial bundle | Startup lambat di Telegram WebView | Dynamic import dan route-level code splitting |
| P2 | Rewarded ads dianggap sumber income utama | Emission tidak terkendali dan UX buruk | Ads hanya memberi utility/bonus terukur, tunduk pada cap |

## Rekomendasi struktur target

```text
client/src/
  pages/Home.tsx              dashboard QUEST//MIND
  pages/QuestHub.tsx          daftar mode dan daily state
  pages/QuizRun.tsx           KNOW/BLUFF/CHAIN/BOSS/WORLD shell
  pages/Profile.tsx           progression, achievements, inventory
  pages/Leaderboard.tsx       global/daily/weekly/season tabs
  pages/Redemption.tsx        eligible/pending/history
  game/                       Babylon optional exploration only

server/game/
  auth-boundary.ts            Telegram + request validation
  question-engine.ts          question/session/answer rules
  economy-engine.ts           QC emission/burn/projection rules
  anti-cheat.ts               nonce, rate, replay, timing, risk score
  reward-service.ts            transaction orchestration
  redemption-service.ts        eligibility, caps, review queue
  service.ts                   application use cases

supabase/migrations/
  ...questmind_foundation.sql
  ...questmind_quiz_engine.sql
  ...questmind_economy.sql
  ...questmind_redemption.sql
```

## Kesimpulan fase 1

Foundation existing memenuhi arah keamanan dasar yang diminta prompt. Gap utama bersifat domain/product, bukan alasan untuk mengganti stack. Fase berikutnya harus menghasilkan kontrak API, migration plan, formula economy yang configurable, dan desain session/anti-cheat sebelum implementasi MVP dimulai.

## Referensi repository

- [`README.md`](../README.md)
- [`server/telegram.ts`](../server/telegram.ts)
- [`server/game/http.ts`](../server/game/http.ts)
- [`server/game/service.ts`](../server/game/service.ts)
- [`server/game/engine.ts`](../server/game/engine.ts)
- [`supabase/migrations/20260824_gamequest_vertical_slice.sql`](../supabase/migrations/20260824_gamequest_vertical_slice.sql)
- [`supabase/migrations/20260824_gamequest_ad_reward_atomic.sql`](../supabase/migrations/20260824_gamequest_ad_reward_atomic.sql)
