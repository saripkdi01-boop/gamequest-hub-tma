# GameQuest Hub TMA

GameQuest Hub adalah Telegram Mini App mobile-first yang menyediakan halaman pemain awal, fondasi quest, autentikasi pengguna Telegram yang tervalidasi di server, webhook bot, serta penyimpanan profil pemain. Antarmuka akan tetap dapat dipreview di browser biasa, namun browser tersebut tidak memiliki identitas Telegram dan tidak akan membuat profil pemain.

## Arsitektur

| Komponen | Tanggung jawab |
| --- | --- |
| React + Vite | Antarmuka responsif yang menggunakan Telegram Web Apps SDK untuk tema, safe area, dan tombol utama. |
| Express lokal | Menyediakan route aplikasi selama pengembangan dan endpoint Telegram untuk preview. |
| Vercel Functions | Menyediakan endpoint produksi `/api/telegram/auth`, `/api/telegram/webhook`, dan `/api/telegram/health`. |
| Supabase PostgreSQL | Menyimpan tabel `gamequest_players`, termasuk identitas Telegram yang tervalidasi dan status pemain awal. Aksesnya hanya dari server. |

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
```

## Rujukan

Dokumentasi Telegram menjelaskan bahwa `initData` perlu divalidasi di server menggunakan token bot, dan parameter `secret_token` pada `setWebhook` dikirim kembali melalui header webhook resmi. [1] [2]

Supabase mewajibkan Row Level Security pada tabel di schema yang diekspos. Tabel `gamequest_players` telah mengaktifkan RLS tanpa kebijakan klien; fungsi server menggunakan kredensial server-only untuk melakukan upsert setelah signature Telegram tervalidasi. [3]

[1]: https://core.telegram.org/bots/webapps "Telegram Mini Apps"
[2]: https://core.telegram.org/bots/api#setwebhook "Telegram Bot API — setWebhook"
[3]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Row Level Security"
