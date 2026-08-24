# GameQuest Hub TMA

GameQuest Hub adalah Telegram Mini App mobile-first yang menyediakan halaman pemain awal, fondasi quest, autentikasi pengguna Telegram yang tervalidasi di server, webhook bot, serta penyimpanan profil pemain. Antarmuka akan tetap dapat dipreview di browser biasa, namun browser tersebut tidak memiliki identitas Telegram dan tidak akan membuat profil pemain.

## Arsitektur

| Komponen | Tanggung jawab |
| --- | --- |
| React + Vite | Antarmuka responsif yang menggunakan Telegram Web Apps SDK untuk tema, safe area, dan tombol utama. |
| Express lokal | Menyediakan route aplikasi selama pengembangan dan endpoint Telegram untuk preview. |
| Vercel Functions | Menyediakan autentikasi Telegram, API game, webhook, leaderboard, dan postback rewarded-ad. |
| Supabase PostgreSQL | Menyimpan profil pemain, quest run, reward ledger, statistik harian, leaderboard, dan audit postback. Akses mutasi hanya dari server. |

## Keamanan Telegram

Token bot dan webhook secret hanya dibaca di server dari environment variables. Nilai tersebut tidak menggunakan prefix `VITE_`, tidak dicatat ke log, dan tidak pernah disisipkan ke halaman klien. Endpoint autentikasi memvalidasi signature `initData` menggunakan HMAC-SHA-256 sebelum melakukan upsert profil. Endpoint webhook menolak setiap request yang tidak membawa header `X-Telegram-Bot-Api-Secret-Token` yang cocok.

## Environment Variables

Salin `.env.example` hanya untuk dokumentasi lokal; jangan pernah commit berkas `.env` yang berisi nilai sesungguhnya. Tambahkan variabel berikut pada lingkungan **Production**, **Preview**, dan **Development** di Vercel.

| Variable | Wajib | Kegunaan |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | Ya | Memverifikasi `initData` dan mengirim balasan bot untuk `/start`. |
| `TELEGRAM_WEBHOOK_SECRET` | Ya | Mencocokkan header secret dari Telegram pada setiap webhook. |
| `TELEGRAM_WEB_APP_URL` | Ya | URL publik HTTPS Mini App untuk tombol pembuka pada pesan `/start`. |
| `SUPABASE_URL` | Ya | URL project Supabase untuk koneksi fungsi server. |
| `SUPABASE_KEY` | Ya | Secret key atau service role key Supabase yang hanya boleh digunakan fungsi server. |
| `VITE_ADS_ENABLED` | Tidak | Tetapkan `true` hanya setelah Monetag SDK dan zone telah dikonfigurasi. Default: `false`. |
| `VITE_MONETAG_ZONE_ID` | Tidak | Zone ID Rewarded Interstitial dari dashboard Monetag. Ini bukan credential server. |
| `VITE_MONETAG_SDK_SRC` | Tidak | URL script SDK resmi yang disediakan Monetag untuk Mini App Anda. Jangan menebak URL ini. |
| `MONETAG_POSTBACK_PATH_SECRET` | Tidak | Secret URL path untuk postback; hanya server-side dan wajib saat iklan rewarded diaktifkan. |

## Gameplay Genesis Run

Genesis Run adalah vertical slice permainan yang aktif bagi pemain Telegram tervalidasi. Server membuat satu run aktif dengan seed tersimpan, menjalankan tiga checkpoint pilihan, dan menyelesaikan run hanya setelah urutan checkpoint valid. Reward `+25 XP` dan `+3 relics` dicatat ke `player_reward_ledger` melalui fungsi Supabase atomik; pengulangan request completion hanya mengembalikan hasil yang sudah selesai tanpa memberi reward kedua.

| Route | Fungsi |
| --- | --- |
| `POST /api/game/dashboard` | Mengembalikan profil, progress, quest aktif, dan statistik harian untuk pemain tervalidasi. |
| `POST /api/game/genesis/start` | Memulai atau melanjutkan Genesis Run aktif. |
| `POST /api/game/genesis/choice` | Memvalidasi satu pilihan checkpoint dan menyelesaikan run bila checkpoint ketiga selesai. |
| `GET /api/game/leaderboard` | Mengembalikan peringkat Season Alpha berdasarkan XP. |
| `POST /api/game/ads/intent` | Membuat intent bonus iklan yang dibatasi daily cap dan cooldown. |

## Rewarded Ads Monetag

Reward iklan bersifat **opt-in** dan dinonaktifkan secara default. Klien hanya membuka iklan dan memperbarui status UI. Relic diberikan hanya setelah endpoint postback menerima event `impression` dengan `reward_event_type=valued`, zone yang sesuai, intent belum kedaluwarsa, serta Telegram ID yang cocok bila disediakan. Ledger, relic pemain, intent, dan statistik harian diperbarui dalam fungsi database atomik; postback berulang tidak dapat memberi reward kedua.[4] [5]

Setelah Mini App disetujui Monetag, simpan nilai SDK zone melalui Vercel Environment Variables dan redeploy. Gunakan template postback berikut pada zone Rewarded Interstitial; ganti setiap placeholder di dashboard, bukan di source code.

```text
https://gamequest-hub-tma.vercel.app/api/ads/monetag/<MONETAG_POSTBACK_PATH_SECRET>?ymid={ymid}&event_type={event_type}&reward_event_type={reward_event_type}&zone_id={zone_id}&sub_zone_id={sub_zone_id}&telegram_id={telegram_id}&estimated_price={estimated_price}
```

Format In-App Interstitial tidak boleh dipakai sebagai basis pemberian reward karena Monetag tidak menyediakan postback reward untuk format tersebut.[5]

## Deployment Vercel

Hubungkan repository GitHub ke project Vercel. Konfigurasi `vercel.json` telah memakai build `pnpm build` dan output `dist/public`; folder `api/` dipublikasikan sebagai fungsi serverless. Setelah deployment produksi tersedia, isi `TELEGRAM_WEB_APP_URL` dengan URL produksi, lalu lakukan redeploy agar tombol `/start` selalu mengarah ke domain final.

Setelah environment variables diisi, konfigurasikan webhook melalui Bot API berikut. Ganti placeholder dan jalankan dari terminal Anda sendiri agar token tidak tercatat ke histori percakapan.

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://<YOUR-VERCEL-DOMAIN>/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
  -d 'allowed_updates=["message"]'
```

Pengaturan Mini App di BotFather harus menggunakan URL HTTPS publik yang sama. Gunakan `/mybots` → pilih bot → **Bot Settings** → **Configure Mini App** untuk menetapkan URL tersebut.

## Validasi

Jalankan pengujian dan build sebelum melakukan push.

```bash
pnpm test
pnpm build
node scripts/verify-telegram-local.mjs
```

## Rujukan

Dokumentasi Telegram menjelaskan bahwa `initData` perlu divalidasi di server menggunakan token bot, dan parameter `secret_token` pada `setWebhook` dikirim kembali melalui header webhook resmi. [1] [2]

Supabase mewajibkan Row Level Security pada tabel di schema yang diekspos. Tabel `gamequest_players` telah mengaktifkan RLS tanpa kebijakan klien; fungsi server menggunakan kredensial server-only untuk melakukan upsert setelah signature Telegram tervalidasi. [3]

Monetag membedakan callback frontend dari postback server-side dan menyarankan postback untuk reward yang tepercaya serta idempoten. [4] [5]

[1]: https://core.telegram.org/bots/webapps "Telegram Mini Apps"
[2]: https://core.telegram.org/bots/api#setwebhook "Telegram Bot API — setWebhook"
[3]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security"
[4]: https://docs.monetag.com/docs/postbacks/ "Monetag Postbacks Overview"
[5]: https://docs.monetag.com/docs/postbacks/types/ "Monetag Postback Event Types"
