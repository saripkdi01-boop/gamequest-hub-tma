# GameQuest Hub — Audit Produk, Monetisasi, dan Prompt DeepSeek

**Catatan istilah.** Saya mengasumsikan nama “Monego” yang Anda maksud adalah **Monetag**, karena Monetag memiliki SDK dan dokumentasi resmi khusus Telegram Mini Apps. Jika yang dimaksud adalah vendor berbeda, jangan integrasikan sampai dokumentasi SDK dan postback vendor tersebut tersedia.

## Ringkasan Eksekutif

Repository GameQuest Hub sudah merupakan **fondasi TMA yang aman dan layak dikembangkan**, bukan game penuh. Ia sudah memiliki antarmuka mobile-first yang rapi, validasi `initData` Telegram di server, webhook `/start`, penyimpanan profil pemain di Supabase, dan fungsi Vercel. Namun, statistik, quest, progress, XP, relic, dan kartu “Genesis Run” saat ini masih bersifat tampilan awal; belum ada loop permainan, state quest, ledger reward, leaderboard, maupun monetisasi yang benar-benar berjalan.[1]

> **Kesimpulan produk:** jangan memasang iklan sebelum ada aktivitas permainan yang bernilai. Bangun satu loop permainan kecil tetapi nyata terlebih dahulu, lalu jadikan iklan rewarded sebagai opsi percepatan atau bonus—bukan cara satu-satunya untuk bermain.

| Area | Status saat ini | Dampak | Prioritas |
| --- | --- | --- | --- |
| Identitas Telegram | `initData` tervalidasi server-side dan profil pemain dipersistenkan | Dasar keamanan sudah baik | Pertahankan |
| UI mobile | Dashboard, player card, statistik, dan kartu starter quest tersedia | Siap menjadi shell game | Pertahankan |
| Loop game | Belum ada state quest, objective, penyelesaian, atau reward nyata | Produk masih berupa prototype UI | P0 |
| Data ekonomi | Level/XP/relic belum bersumber dari ledger transaksional | Risiko reward ganda dan data tidak konsisten | P0 |
| Monetisasi | Belum ada SDK iklan, intent, postback, atau batas reward | Tidak aman untuk mengaitkan reward iklan | P1 setelah P0 |
| Operasional | Vercel, Supabase, dan webhook Telegram aktif | Siap menjadi fondasi produksi | Pertahankan |

## Temuan Teknis dari Repository

Struktur proyek menggunakan React/Vite di klien, fungsi Vercel pada folder `api/`, webhook dan verifikasi Telegram di server, serta Supabase untuk tabel `gamequest_players`. Token bot dan secret webhook hanya digunakan di server; ini adalah keputusan yang benar dan harus dipertahankan.[1]

Antarmuka saat ini mengambil nama pemain dari autentikasi Telegram, tetapi XP, level, streak, relic, jumlah quest, dan konten “Genesis Run” masih di-hardcode. Fungsi tombol hanya menggulir ke kartu quest. Artinya, DeepSeek perlu memperlakukan halaman ini sebagai **desain shell**, bukan sebagai sistem quest yang sudah selesai.[1]

| Kekuatan yang harus dipertahankan | Kesenjangan yang harus ditutup |
| --- | --- |
| Verifikasi HMAC Telegram dan batas usia `initData` | Tidak ada session game atau API game terautentikasi |
| Webhook memakai secret token | Tidak ada tabel `quests`, `player_quests`, atau status progress |
| RLS Supabase dan kunci server-only | Tidak ada ledger XP/relic yang idempoten |
| TMA-aware theme, safe area, haptic, dan MainButton | Tidak ada game loop interaktif, daily reset, atau leaderboard |
| Endpoint health non-sensitif | Tidak ada observabilitas event quest/ad atau anti-abuse |

## Rancangan Game Nyata: Vertical Slice P0

Implementasikan **Genesis Run** sebagai game loop pertama. Pemain memulai quest, melewati tiga checkpoint pilihan berurutan yang berasal dari seed server, lalu menyelesaikan objective dengan strategi sederhana—misalnya memilih jalur berdasarkan resource terbatas, risiko, dan multiplier. Client hanya merender pilihan; server menyimpan seed, memvalidasi urutan aksi, menghitung skor, dan menyelesaikan quest. Dengan demikian, reward tidak dapat dibuat hanya dengan memalsukan request klien.

| Entitas | Kolom/aturan minimum | Tujuan |
| --- | --- | --- |
| `quests` | `id`, `slug`, `title`, `objective_type`, `reward_xp`, `reward_relics`, `active` | Definisi quest yang dapat dikonfigurasi |
| `player_quests` | `id`, `player_id`, `quest_id`, `status`, `seed`, `progress_json`, `started_at`, `completed_at` | State machine `available → active → completed` |
| `player_reward_ledger` | `id`, `player_id`, `currency`, `amount`, `reason`, `idempotency_key`, `created_at` | Satu sumber kebenaran untuk XP/relic |
| `daily_player_stats` | `player_id`, `date_utc`, `completed_quests`, `rewarded_ads`, `ad_rewards_total` | Batas daily quest dan monetisasi |
| `leaderboard_snapshots` | `season_id`, `player_id`, `score`, `rank`, `updated_at` | Leaderboard yang tidak menghitung ulang seluruh tabel |

Setiap completion harus terjadi dalam transaksi/database RPC yang atomik: cek status quest belum completed, tulis ledger dengan `idempotency_key` unik, naikkan XP/relic, hitung level dari total XP, lalu ubah status quest. Jangan pernah menerima angka XP, relic, level, atau `player_id` yang diklaim oleh klien.

## Monetisasi Monetag yang Disarankan

Monetag menyediakan tiga format untuk Telegram Mini Apps: **Rewarded Interstitial**, **Rewarded Popup**, dan **In-App Interstitial**. Rewarded Interstitial paling sesuai untuk bonus permainan yang eksplisit; In-App Interstitial tidak mendukung postback reward dan karenanya tidak boleh dipakai untuk memberi currency pemain.[2] [3]

| Placement | Format | Nilai bagi pemain | Aturan UX dan ekonomi |
| --- | --- | --- | --- |
| Tombol “Claim Bonus Relic” | Rewarded Interstitial | +10 relic atau +1 energy | Opt-in; maksimal 3 kali/hari; cooldown 10 menit |
| Tombol “Revive Genesis Run” | Rewarded Interstitial | Satu revive per run | Hanya setelah gagal; maksimal 1 kali/run |
| Tombol toko/bonus khusus | Rewarded Popup | Claim kosmetik kecil | Hanya dari klik eksplisit; jangan auto-open |
| Jeda antarchapter | In-App Interstitial | Tidak ada reward | Frekuensi konservatif; jangan pada onboarding atau sebelum aksi inti |

### Aturan Anti-Fraud yang Wajib

Frontend SDK hanya cocok untuk memperbarui UI. Dokumentasi Monetag menyatakan callback frontend secara default hanya mengonfirmasi bahwa logika SDK dicoba, bukan bahwa event iklan benar-benar termonetisasi. Reward bernilai harus diberikan hanya dari **server-side postback** Monetag yang dikonfirmasi.[4]

1. Saat pemain menekan tombol rewarded ad, backend membuat `ad_reward_intent` berisi UUID acak `ymid`, `player_id`, reward yang diizinkan, timestamp kedaluwarsa, dan status `pending`.
2. Klien memanggil SDK Monetag menggunakan `ymid` tersebut dan `requestVar` yang menjelaskan placement, misalnya `daily_bonus` atau `revive_genesis_run`.
3. Klien boleh menampilkan status “menunggu verifikasi”, tetapi **tidak** menambah XP/relic.
4. Konfigurasikan postback SDK zone ke endpoint HTTPS Vercel, misalnya `GET /api/ads/monetag/postback/<random-path-secret>?ymid={ymid}&event={event_type}&value={reward_event_type}&zone={zone_id}&subzone={sub_zone_id}&telegram_id={telegram_id}&amount={estimated_price}`.
5. Endpoint memvalidasi `ymid`, kecocokan player/Telegram ID/zone, masa berlaku intent, event yang diharapkan, dan `reward_event_type=valued`. Kemudian endpoint memasukkan postback dan ledger reward dengan unique constraint pada `ymid`; postback duplikat harus selalu idempoten.
6. Jika data tidak cocok atau `reward_event_type=non_valued`, tandai intent gagal tanpa reward. Simpan audit log terpisah tanpa menyimpan credential iklan.

Dokumentasi Monetag memang merekomendasikan URL HTTPS tanpa redirect, validasi parameter, logging postback, dan idempotensi berbasis `ymid`; postback dapat diulang bila endpoint tidak membalas 200.[5] Reward-based postbacks tersedia untuk Rewarded Interstitial dan Rewarded Popup, bukan In-App Interstitial.[6]

### Konfigurasi SDK

Gunakan **snippet SDK asli dari dashboard Monetag**, karena nama host dan zone ID diberikan setelah aplikasi/zone dibuat. Jangan mengarang URL script atau zone ID. Zone ID adalah identifier klien, sedangkan nilai seperti `MONETAG_POSTBACK_PATH_SECRET` harus menjadi environment variable server-only. SDK mendukung preload, `ymid`, `requestVar`, timeout, dan penanganan error; gunakan `preload` setelah pemain membuka game agar CTA rewarded tidak terasa lambat.[3]

Tetapkan event iklan dan attribution di database. `requestVar` harus merupakan label placement yang tetap, contohnya `daily_bonus`, `revive_run`, atau `chapter_break`. `ymid` harus UUID unik untuk **satu** attempt; jangan gunakan Telegram ID sebagai `ymid`.

## Kesiapan Moderasi dan Produk

Sebelum mengajukan integrasi, tampilkan halaman game yang berfungsi, navigasi jelas, kebijakan privasi, dan pemisahan yang jujur antara hadiah game dan iklan. Monetag menyatakan bahwa Mini App tunduk pada terms mereka dan dapat dimoderasi berkelanjutan; materi yang melanggar hukum, menyesatkan, atau mendorong aktivitas terlarang dapat ditolak.[7] Jangan menyebut iklan sebagai “penghasilan”, “investasi”, atau mekanisme cash-out. Reward harus berupa mata uang/boost **di dalam game**, bukan janji keuntungan finansial.

## Prompt DeepSeek Siap Pakai

Salin seluruh prompt berikut ke DeepSeek setelah membuka repository `saripkdi01-boop/gamequest-hub-tma` sebagai workspace.

```text
Anda adalah Staff Full-Stack Game Engineer dan Security Engineer. Bekerja langsung pada repository GameQuest Hub Telegram Mini App yang sudah ada. Jangan membuat demo kosmetik atau data palsu. Implementasikan vertical slice game nyata yang dapat dimainkan, aman terhadap manipulasi klien, dan siap menerima monetisasi rewarded ads Monetag.

KONTEKS REPOSITORY
- Stack: React + Vite + TypeScript, Express untuk pengembangan lokal, Vercel Functions di /api untuk produksi, Supabase PostgreSQL untuk data pemain.
- Identitas Telegram sudah divalidasi server-side dari initData; jangan melemahkan verifikasi tersebut dan jangan percaya telegram user id yang dikirim klien.
- Bot/webhook, Vercel, dan Supabase sudah aktif.
- UI Home sudah indah tetapi progress Level, XP, Streak, Relics, dan Genesis Run masih bersifat statis. Jadikan data tersebut nyata.
- Jangan mengekspos token bot, webhook secret, SUPABASE_KEY, postback secret, atau credential lain ke React/Vite. Jangan commit .env.

TUJUAN PRODUK P0
Bangun game vertical slice “Genesis Run”: pemain memulai satu quest interaktif berbasis tiga checkpoint pilihan. Server membuat seed yang deterministik untuk run, menyimpan status quest, menerima aksi checkpoint, memvalidasi urutan dan rule, menghitung outcome, dan hanya server yang memberi XP/relic saat run selesai. Client hanya merender gameplay dan memanggil API yang terautentikasi.

MODEL DATA SUPABASE
1. Tambahkan tabel berikut dengan SQL migration yang idempoten dan RLS aktif:
   - quests(id, slug unique, title, description, objective_type, config_json, reward_xp, reward_relics, active, created_at)
   - player_quests(id uuid, player_id references gamequest_players, quest_id, status enum/string available|active|completed|failed, seed, progress_json, started_at, completed_at, unique player_id+quest_id+daily_key bila perlu)
   - player_reward_ledger(id uuid, player_id, currency xp|relic, amount integer, reason, idempotency_key unique, created_at)
   - ad_reward_intents(id uuid, ymid unique, player_id, placement, reward_currency, reward_amount, status pending|verified|rejected|expired, expires_at, created_at, verified_at)
   - ad_postbacks(id uuid, ymid, event_type, reward_event_type, zone_id, sub_zone_id, telegram_id, estimated_price, raw_safe_payload_json, received_at, unique(ymid, event_type, reward_event_type))
   - daily_player_stats(player_id, day_utc, rewarded_ads_count, rewarded_relics, unique(player_id, day_utc))
2. Akses data game hanya melalui fungsi server menggunakan service key. Jangan buat policy RLS yang mengizinkan browser mengubah reward.
3. Buat satu quest seed “Genesis Run” nyata, bukan hardcode UI. Jika migration dikerjakan dengan SQL seed, jadikan seed idempoten.

ATURAN GAMEPLAY
- Endpoint start quest membuat player_quest active dan seed server; tidak boleh dua run aktif untuk quest yang sama.
- Endpoint submit choice menerima index pilihan yang sempit/tervalidasi, memperbarui progress server-side, dan mengembalikan state baru tanpa membuka seed yang belum seharusnya terlihat.
- Setelah tiga checkpoint valid, selesaikan quest dengan transaksi/RPC atomik: cek belum completed, tulis ledger XP +25 dan relic reward, update player aggregate, tandai quest completed. Idempotency wajib.
- Level dihitung deterministik dari XP total. Dokumentasikan formula sederhana dan uji boundary-nya.
- Home harus mengambil profil, aggregate, quest aktif/tersedia dari server serta menampilkan loading, error, empty state, dan status quest sebenarnya.
- Tambahkan satu daily quest atau reset UTC yang terukur, tetapi jangan memakai cron jika reset dapat dihitung saat request.

MONETAG (ASUMSI: VENDOR YANG DIMAKSUD ADALAH MONETAG)
- Buat abstraction `MonetagAdProvider` di client. Jangan mengarang URL script atau zone ID; gunakan snippet SDK/zone ID resmi yang dimasukkan operator dari dashboard Monetag.
- Hanya izinkan Rewarded Interstitial untuk hadiah gameplay P0. Jangan berikan hadiah pada callback frontend.
- Tambahkan endpoint server untuk membuat ad reward intent setelah validasi Telegram: periksa player, placement allowlist (`daily_bonus`, `revive_genesis_run`), batas 3 rewarded ads/hari, cooldown 10 menit, dan kelayakan quest. Buat UUID ymid yang acak.
- Client memanggil SDK menggunakan ymid dan requestVar, menampilkan status “verifikasi hadiah”, lalu merefresh data player. `preload` boleh dipakai setelah game siap. Tangani no-feed, timeout, dan error tanpa menggagalkan game.
- Tambahkan endpoint GET `/api/ads/monetag/postback/<MONETAG_POSTBACK_PATH_SECRET>` yang tidak menampilkan secret dan selalu cepat. Validasi ymid, expiry, telegram id jika disediakan, expected placement, zone/subzone allowlist, event type, dan `reward_event_type === valued`. Simpan postback idempoten lalu grant reward dalam transaksi atomik. Event non_valued tidak boleh memberi reward.
- Dokumentasikan template Postback URL dengan macro Monetag, namun jangan masukkan nilai secret atau zone ID ke repository.
- Jangan gunakan Rewarded Popup kecuali dipicu langsung dari klik pengguna. Jangan gunakan In-App Interstitial untuk reward karena tidak punya postback reward.

KEAMANAN DAN KUALITAS
- Jangan menerima player_id, XP, relic, ad revenue, status completion, atau reward dari client sebagai kebenaran.
- Terapkan validation schema Zod untuk seluruh input API; batasi rate endpoint quest dan ad intent per pemain.
- Semua waktu bisnis dalam UTC. Gunakan idempotency keys dan unique constraints.
- Tambahkan audit log aman untuk quest completion dan postback tanpa menyimpan token/secret.
- Jangan menambah review, testimonial, rating, atau data pengguna palsu.
- Pertahankan desain elegan mobile-first, Telegram theme, safe-area, haptic, dan MainButton. Game harus tetap nyaman di layar 360–430px.

PENGUJIAN DAN HASIL YANG WAJIB ANDA BERIKAN
1. Vitest untuk: signature/initData yang invalid, start quest ganda, urutan checkpoint invalid, completion idempoten, perhitungan level, reward ledger duplikat, ad intent daily cap/cooldown, postback valued valid, postback non_valued, dan postback duplikat.
2. Jalankan `pnpm test`, `pnpm build`, serta verifikasi UI mobile.
3. Update README dengan environment variables baru dan langkah konfigurasi Monetag postback tanpa menulis secret.
4. Beri saya ringkasan file yang berubah, skema database, langkah konfigurasi dashboard Monetag, hasil test/build, serta risiko atau pekerjaan tahap berikutnya.
5. Mulai dari audit file yang ada, lalu implementasikan secara bertahap. Jangan berhenti pada rencana atau pseudocode; tulis kode produksi yang kompatibel dengan struktur repository saat ini.
```

## Urutan Implementasi yang Paling Aman

| Sprint | Hasil nyata | Ukuran keberhasilan |
| --- | --- | --- |
| 1 | Genesis Run playable + ledger reward | Pemain menyelesaikan tiga checkpoint dan XP tersimpan idempoten |
| 2 | Daily quest, streak, dan leaderboard | Data pemain pada Home tidak lagi statis |
| 3 | Rewarded Interstitial + intent/postback | Reward iklan hanya masuk dari postback `valued` |
| 4 | A/B placement, telemetry, dan tuning reward | Retensi dan ad frequency terukur tanpa mengganggu game |

## Referensi

[1]: https://github.com/saripkdi01-boop/gamequest-hub-tma "Repository GameQuest Hub"
[2]: https://docs.monetag.com/ "Monetag SDK for Telegram Mini Apps — Introduction"
[3]: https://docs.monetag.com/docs/sdk-reference/ "Monetag SDK Reference"
[4]: https://docs.monetag.com/docs/postbacks/ "Monetag Postbacks Overview"
[5]: https://docs.monetag.com/docs/postbacks/configuration/ "Monetag Postback Configuration"
[6]: https://docs.monetag.com/docs/postbacks/types/ "Monetag Postback Event Types"
[7]: https://docs.monetag.com/docs/introduction/moderation-process/ "Monetag Moderation Process"
[8]: https://core.telegram.org/bots/webapps "Telegram Mini Apps Documentation"
