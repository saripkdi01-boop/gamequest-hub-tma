# Prompt untuk DeepSeek — Upgrade Total GameQuest Hub

> **Cara pakai:** Buka repository berikut sebagai workspace DeepSeek, lalu tempel seluruh prompt di bawah tanpa menghapus bagian apa pun: `https://github.com/saripkdi01-boop/gamequest-hub-tma`.

```text
Anda adalah Principal Full-Stack Game Engineer, PostgreSQL/Supabase Architect, dan Application Security Engineer. Anda memiliki akses workspace ke repository GitHub privat ini:

https://github.com/saripkdi01-boop/gamequest-hub-tma

TUGAS UTAMA
Audit lalu UPGRADE seluruh codebase GameQuest Hub dari fondasi Telegram Mini App yang sebagian besar masih berupa UI statis menjadi vertical-slice game quest yang benar-benar dapat dimainkan, memiliki progres persisten, backend aman, leaderboard dasar, dan fondasi monetisasi iklan rewarded yang benar-benar anti-fraud.

JANGAN hanya memberi rencana, pseudocode, atau contoh terpisah. Setelah audit singkat, implementasikan perubahan langsung di repository dengan file nyata, migrations, API, UI, tests, dokumentasi, dan perintah validasi. Pertahankan bagian yang sudah baik; jangan rewrite total stack tanpa alasan kuat.

KONTEKS TEKNIS YANG HARUS ANDA PERTAHANKAN
- React + Vite + TypeScript untuk klien.
- Express untuk development lokal, Vercel Functions di folder `/api` untuk production.
- Supabase PostgreSQL untuk persistence pemain.
- Telegram Mini App SDK sudah dimuat; `initData` sudah diverifikasi server-side menggunakan HMAC bot token.
- Webhook bot `/start`, Telegram webhook secret, Vercel deployment, dan Supabase sudah berfungsi.
- Jangan mengekspos `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `SUPABASE_KEY`, service-role key, path secret postback, atau secret lain ke klien atau Git.
- Jangan menghapus validasi `initData`, validasi webhook secret, RLS, atau endpoint kesehatan yang sudah ada.
- Jangan membuat review, rating, testimonial, atau user data palsu.

AUDIT YANG HARUS DILAKUKAN PERTAMA
1. Baca `README.md`, `client/src/pages/Home.tsx`, `client/src/hooks/useTelegramWebApp.ts`, `server/telegram.ts`, `server/supabase.ts`, `api/telegram/*`, schema/migrations, tests, dan `todo.md`.
2. Tulis ringkasan singkat di awal respons: apa yang sudah production-ready dan apa yang masih UI hardcoded.
3. Jangan berhenti pada audit. Lanjutkan implementasi semua item berikut.

HASIL PRODUK YANG HARUS DIBANGUN — GAMEPLAY NYATA P0
Ubah “Genesis Run” dari kartu statis menjadi game quest nyata.

1. Pemain dapat menekan Start Quest.
2. Server membuat run `Genesis Run` dengan seed random yang tersimpan.
3. Run memiliki 3 checkpoint. Di setiap checkpoint pemain memilih satu dari 2–3 pilihan yang memiliki konsekuensi resource, risiko, dan skor.
4. Client hanya menampilkan state yang dikirim server. Client tidak boleh menentukan hasil run, XP, relic, seed, reward, player_id, atau status completion.
5. Server memvalidasi urutan checkpoint, memproses pilihan, dan menutup run hanya setelah checkpoint ke-3 valid.
6. Saat completion, server secara atomik memberi reward yang sebenarnya: +25 XP dan relic reward yang masuk akal (misalnya 3). Hindari completion ganda saat user mengklik cepat atau request diulang.
7. Home menampilkan Level, XP progress, Streak, Relics, Genesis Run status, dan quest berikutnya dari data server yang nyata—bukan value hardcoded.
8. Tambahkan satu daily bonus/quest dengan reset berdasarkan UTC yang dihitung saat request. Jangan menambahkan cron jika tidak diperlukan.

DATABASE DAN MIGRATION SUPABASE
Buat migration SQL yang aman, idempoten bila memungkinkan, dan gunakan RLS. Jangan menyimpan file bytes dalam database.

Minimal tambahkan tabel berikut:

- `quests`: `id`, `slug` UNIQUE, `title`, `description`, `objective_type`, `config_json`, `reward_xp`, `reward_relics`, `active`, `created_at`.
- `player_quests`: `id`, `player_id` yang mereferensi pemain, `quest_id`, `status` (`available|active|completed|failed`), `seed`, `progress_json`, `started_at`, `completed_at`, `updated_at`.
- `player_reward_ledger`: `id`, `player_id`, `currency` (`xp|relic`), `amount`, `reason`, `idempotency_key` UNIQUE, `metadata_json`, `created_at`.
- `daily_player_stats`: `player_id`, `day_utc`, `completed_quests`, `rewarded_ads_count`, `rewarded_relics`, unique `(player_id, day_utc)`.
- `leaderboard_snapshots`: `season_id`, `player_id`, `score`, `rank`, `updated_at`.
- `ad_reward_intents` dan `ad_postbacks` untuk monetisasi rewarded, sebagaimana detail di bawah.

Gunakan RLS tanpa policy write dari browser. Semua mutation game dan reward harus melewati endpoint/function server dengan kredensial server-side.

ECONOMY DAN STATE MACHINE
- Definisikan formula level yang deterministic dan mudah diaudit, contoh: `level = floor(sqrt(totalXp / 100)) + 1`; pilih satu formula, dokumentasikan, dan uji semua boundary-nya.
- Gunakan `player_reward_ledger` sebagai sumber kebenaran tambahan XP dan relic. Jangan hanya increment angka aggregate tanpa audit trail.
- Setiap reward harus punya `idempotency_key` unik dan constraint database yang benar.
- Gunakan transaksi database atau Supabase RPC yang atomik untuk: validasi state → insert ledger → update aggregate/progress → completion.
- Tambahkan protection minimal terhadap double-click, replay request, dan run yang sudah expired/completed.

API DAN VALIDASI
- Gunakan Zod untuk seluruh input klien.
- Selalu derive pemain dari Telegram `initData` yang sudah divalidasi server-side, bukan dari `player_id` dari body request.
- Implementasikan endpoint/fungsi yang rapi untuk:
  - membaca game state/dashboard;
  - start Genesis Run;
  - submit checkpoint choice;
  - mengambil quest list;
  - mengambil leaderboard;
  - claim daily quest/bonus jika memenuhi syarat.
- Tambahkan rate limiting logis per pemain untuk start/submit quest dan endpoint ad intent.
- Simpan timestamps business dalam UTC.
- Jangan memakai `fetch` klien untuk route internal jika pola proyek sudah memakai tRPC; ikuti pola existing project secara konsisten. Bila mengubah ke tRPC lebih aman dan bersih, lakukan secara penuh termasuk contract/test, bukan setengah-setengah.

UI/UX TELEGRAM
- Pertahankan gaya visual GameQuest Hub yang elegan, dark, mobile-first, dan nyaman pada lebar 360–430px.
- Pertahankan Telegram safe-area, theme adaptation, haptic feedback, MainButton, dan fallback browser biasa.
- Buat route/screen nyata: Home, Quest Run, Quest Result, Leaderboard, dan Reward/Bonus.
- Tampilkan loading skeleton, error state yang membantu, disabled state saat request berjalan, dan pesan saat quest sudah selesai.
- Hindari animasi berat. Hormati `prefers-reduced-motion`.

MONETISASI IKLAN — ASUMSI “MONEGO” BERARTI MONETAG
Jika vendor yang dimaksud user ternyata bukan Monetag, BERHENTI sebelum integrasi SDK dan minta dokumentasi vendor. Jika memang Monetag, implementasikan fondasi berikut.

1. Gunakan hanya snippet/zone ID resmi yang operator ambil dari dashboard Monetag. Jangan mengarang script URL, zone ID, atau credential.
2. Buat abstraction client `MonetagAdProvider`/hook yang memuat SDK dengan aman dan tidak merusak browser preview bila SDK tidak tersedia.
3. Gunakan Rewarded Interstitial untuk reward game. Jangan memberi currency dari callback frontend; callback hanya mengubah UI menjadi “menunggu verifikasi”.
4. Reward hanya boleh diberikan setelah server-side postback Monetag yang cocok dan bernilai `reward_event_type=valued`.
5. Buat tabel:
   - `ad_reward_intents`: UUID `ymid` UNIQUE, `player_id`, `placement`, `reward_currency`, `reward_amount`, `status` (`pending|verified|rejected|expired`), `expires_at`, `created_at`, `verified_at`.
   - `ad_postbacks`: `ymid`, `event_type`, `reward_event_type`, `zone_id`, `sub_zone_id`, `telegram_id`, `estimated_price`, payload aman, `received_at`, unique constraint untuk mencegah proses ganda.
6. Endpoint server `create ad intent` wajib:
   - memverifikasi Telegram identity;
   - allowlist placement: `daily_bonus` dan `revive_genesis_run`;
   - menerapkan maksimal 3 rewarded ad per UTC day;
   - menerapkan cooldown 10 menit;
   - memastikan reward/quest masih eligible;
   - menghasilkan UUID `ymid` acak; jangan gunakan Telegram ID sebagai `ymid`.
7. Endpoint GET postback harus menggunakan `MONETAG_POSTBACK_PATH_SECRET` yang hanya di server dan bukan di repository. Endpoint harus memvalidasi ymid, expiry, player/Telegram ID jika ada, zone/subzone allowlist, event, dan `reward_event_type === valued`; kemudian melakukan reward secara atomik dan idempoten.
8. Postback `non_valued`, invalid, expired, atau duplicate tidak boleh menambah reward.
9. Rewarded Popup hanya boleh berasal dari click pengguna langsung. In-App Interstitial tidak boleh memberi reward karena tidak memiliki postback reward.
10. Jangan tampilkan iklan saat onboarding, saat request error, atau sebelum pemain memahami game. Buat feature flag `VITE_ADS_ENABLED` dan pastikan game tetap bisa dimainkan jika iklan tidak tersedia.
11. Dokumentasikan template postback dengan macro resmi, tetapi jangan tulis secret/path token atau zone ID aktual ke Git.

KEAMANAN DAN OBSERVABILITY
- Jangan percaya XP/relic/level/ad revenue/quest completion dari klien.
- Jangan log token, `initData` mentah, secret, atau informasi iklan sensitif.
- Tambahkan audit event untuk `quest_started`, `checkpoint_submitted`, `quest_completed`, `ad_intent_created`, `ad_postback_verified`, dan `ad_reward_rejected`.
- Gunakan response error generik kepada klien; detail error hanya ke log server.
- Dokumentasikan privilege Supabase dan RLS dengan jelas.

TEST WAJIB
Tulis atau perbarui Vitest test untuk minimal:
- Telegram initData invalid/expired/tampered.
- Start quest kedua saat run masih aktif.
- Submit checkpoint di urutan invalid.
- Quest completion idempotent dan no duplicate ledger.
- Formula level pada seluruh boundary penting.
- Daily reset UTC dan daily cap.
- Ad intent cooldown dan allowlist placement.
- Postback `valued` valid memberi reward tepat satu kali.
- Postback `non_valued`, invalid, expired, dan duplicate tidak memberi reward.
- UI state penting atau unit test helper game logic.

VALIDASI AKHIR
- Jalankan `pnpm test` dan `pnpm build` sampai lulus.
- Verifikasi tampilan pada viewport mobile 390×844.
- Perbarui README dengan model data, environment variable tambahan, konfigurasi Monetag postback, dan urutan deploy tanpa mengekspos rahasia.
- Perbarui `todo.md`, tandai pekerjaan selesai secara akurat.

FORMAT RESPONS AKHIR ANDA
1. Ringkasan audit awal maksimal 10 poin.
2. Daftar file yang ditambah/diubah dan alasan masing-masing.
3. Migration SQL dan cara menerapkannya.
4. Detail gameplay Genesis Run dan model reward.
5. Langkah operator untuk menambahkan Monetag zone/snippet/postback di dashboard.
6. Hasil test/build yang benar-benar Anda jalankan.
7. Risiko tersisa dan backlog tahap berikutnya.

Mulai sekarang: audit codebase, implementasikan semua bagian di atas secara bertahap, jalankan tests/build, dan jangan berhenti hanya pada rekomendasi.
```
