# Panduan Menjalankan GameQuest Hub di Bot Telegram

Panduan ini menjelaskan cara mengoperasikan GameQuest Hub melalui bot Telegram Anda. Endpoint produksi saat ini sudah aktif dan health check mengonfirmasi konfigurasi Telegram serta origin Mini App: `https://gamequest-hub-tma.vercel.app/api/telegram/health`.

> **Penting:** GameQuest Hub yang dibangun saat ini adalah **Telegram Mini App (TMA)**, bukan produk Telegram HTML5 Game API. Untuk menjalankannya, gunakan **Menu Button/Mini App URL** dan pesan `/start`; Anda tidak perlu membuat game baru pada halaman **Games** BotFather atau menyalakan Inline Mode.

## 1. Ringkasan URL dan status

| Item | Nilai yang digunakan |
| --- | --- |
| Mini App produksi | `https://gamequest-hub-tma.vercel.app` |
| Health check Telegram | `https://gamequest-hub-tma.vercel.app/api/telegram/health` |
| Endpoint webhook bot | `https://gamequest-hub-tma.vercel.app/api/telegram/webhook` |
| Repository privat | `https://github.com/saripkdi01-boop/gamequest-hub-tma` |
| Bot | `@Gamequesthub_bot` |

## 2. Konfigurasi BotFather

Masuk ke chat **@BotFather**, kirim `/mybots`, pilih **GameQuest Hub**, lalu lakukan konfigurasi berikut.

| Pengaturan | Nilai yang disarankan |
| --- | --- |
| Name | `GameQuest Hub` |
| About | `Play. Complete. Enjoy.` |
| Description | `Mulai perjalananmu sebagai Pathfinder. Ambil quest pertama, kumpulkan XP dan relics, bangun streak, lalu buka dunia GameQuest Hub.` |
| Menu Button / Configure Mini App | `https://gamequest-hub-tma.vercel.app` |
| Privacy Policy | Tambahkan URL kebijakan privasi Anda sebelum peluncuran publik. |

Gunakan hanya dua command berikut untuk **Default Scope** pada Direct Messages. Hapus command yang sama dari scope atau bahasa lain agar Telegram tidak menampilkan `/run` berulang.

```text
start - Mulai petualanganmu dan buka quest pertama di GameQuest Hub.
run - Jalankan quest aktifmu dan lanjutkan perjalanan di GameQuest Hub.
```

Jika BotFather menampilkan layar **Games** seperti “Create a New Game”, kembali satu langkah. Layar itu ditujukan untuk Telegram Game API, sedangkan GameQuest Hub dibuka sebagai Mini App dari tombol menu atau tombol dalam pesan `/start`.

## 3. Verifikasi Environment Variables Vercel

Buka [Vercel Environment Variables](https://vercel.com/saripkdi01-boops-projects/gamequest-hub-tma/settings/environment-variables). Pastikan variabel berikut tersedia di **Production**, **Preview**, dan **Development**. Jangan mengirim nilainya melalui chat atau memasukkannya ke repository.

| Key | Nilai/asal | Sensitive |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | Token bot dari BotFather | Ya |
| `TELEGRAM_WEBHOOK_SECRET` | Secret token webhook yang Anda buat | Ya |
| `SUPABASE_URL` | URL project Supabase | Ya |
| `SUPABASE_KEY` | Server/service key Supabase | Ya |
| `TELEGRAM_WEB_APP_URL` | `https://gamequest-hub-tma.vercel.app` | Boleh aktif |

Setelah mengubah nilai environment variable, jalankan **Redeploy** pada deployment terbaru. Endpoint health harus menampilkan `configured: true` dan `webAppOrigin: https://gamequest-hub-tma.vercel.app`.

## 4. Mendaftarkan atau memperbarui webhook

Webhook sudah diarahkan saat setup awal. Gunakan langkah ini hanya bila bot tidak merespons `/start`, Anda mengganti secret, atau Anda pindah domain.

Jalankan perintah berikut dari terminal pribadi (misalnya Termux, macOS Terminal, Windows PowerShell dengan `curl`). Ganti placeholder lokal; jangan tempel token asli ke chat atau screenshot.

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://gamequest-hub-tma.vercel.app/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
  -d 'allowed_updates=["message"]'
```

Kemudian baca statusnya dengan perintah berikut.

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

Respons yang sehat mempunyai URL webhook yang sama dengan tabel di atas dan `last_error_message` kosong. Webhook Telegram memakai HTTPS dan dapat menyertakan `secret_token` pada header `X-Telegram-Bot-Api-Secret-Token`; aplikasi memverifikasi header itu sebelum memproses update.[1]

## 5. Cara menjalankan dan menguji game di Telegram

1. Buka chat privat dengan `@Gamequesthub_bot`.
2. Kirim `/start`.
3. Bot membalas pesan sambutan dengan tombol **Open GameQuest Hub**. Tekan tombol tersebut. Alternatifnya, tekan **Menu Button** bot yang sudah Anda konfigurasi di BotFather.
4. Pastikan header game menunjukkan **Online**, bukan **Preview**. Status Preview hanya muncul bila URL dibuka dari browser biasa dan memang tidak memiliki identitas Telegram tervalidasi.
5. Tekan **Mulai Genesis Run** untuk membuka **Explore Route**. Tap gate bercahaya yang aktif, lalu pilih satu strategi pada checkpoint Signal Ridge, Glass Crossing, dan Relic Gate.
6. Setelah completion, periksa bahwa hasil menampilkan `+25 XP` dan `+3 Relics`. Kembali ke Home untuk melihat statistik yang tersimpan.
7. Buka **Ranks** untuk melihat leaderboard Season Alpha. Genesis Run dibatasi satu completion per pemain per hari UTC untuk mencegah farming reward.

Identitas pemain dipastikan di server melalui `initData` Telegram yang tervalidasi, sehingga jangan menguji gameplay penuh hanya dengan URL Vercel pada Chrome/Safari biasa.[2]

## 6. Supabase dan data game

Migration gameplay sudah diterapkan pada project Supabase yang terhubung. Database kini berisi profil pemain, quest run, ledger reward, statistik harian, leaderboard, ad intent, dan postback audit. Tidak perlu menjalankan migration manual lagi untuk deployment saat ini.

Untuk memeriksa data tanpa mengubah apa pun, buka **Supabase Dashboard → Table Editor** dan tinjau tabel berikut.

| Tabel | Fungsi |
| --- | --- |
| `gamequest_players` | Profil, level, XP, streak, dan relic pemain. |
| `player_quests` | Run Genesis Run aktif atau selesai. |
| `player_reward_ledger` | Catatan sumber kebenaran reward XP/relic. |
| `leaderboard_snapshots` | Skor Season Alpha. |
| `ad_reward_intents` / `ad_postbacks` | Audit monetisasi rewarded ketika diaktifkan. |

Jangan mengedit XP, relic, atau ledger manual pada production. Reward dikelola server dan menggunakan kunci idempotensi untuk mencegah penambahan ganda.

## 7. Deployment perubahan kode

Source code ada di branch `main` repository GitHub privat. Setiap push ke branch tersebut akan memicu deployment Vercel jika integrasi GitHub project masih aktif.

```bash
git clone https://github.com/saripkdi01-boop/gamequest-hub-tma.git
cd gamequest-hub-tma
pnpm install
pnpm test
pnpm build
git add .
git commit -m "feat: describe your change"
git push origin main
```

Setelah deployment selesai, ulangi pengujian dari chat Telegram—bukan hanya dari browser. Vercel Functions akan menyajikan API game dan webhook di production.

## 8. Mengaktifkan Monetag secara aman (opsional)

Fitur Reward Vault sudah ada tetapi **sengaja nonaktif** sampai Anda memiliki Mini App Monetag yang disetujui, zone Rewarded Interstitial, dan snippet SDK resmi. Jangan mengaktifkan monetisasi hanya dengan menebak URL SDK atau Zone ID.

Saat data tersebut tersedia, masukkan variabel berikut di Vercel, lalu redeploy.

| Key | Nilai |
| --- | --- |
| `VITE_ADS_ENABLED` | `true` |
| `VITE_MONETAG_ZONE_ID` | Zone ID resmi Rewarded Interstitial dari Monetag |
| `VITE_MONETAG_SDK_SRC` | URL script SDK resmi dari dashboard Monetag |
| `MONETAG_POSTBACK_PATH_SECRET` | String acak panjang untuk path postback, misalnya dibuat dengan password manager |

Setelah itu, konfigurasikan postback untuk zone Rewarded Interstitial. Gunakan URL berikut dengan macro yang disediakan Monetag pada dashboard; pertahankan secret path hanya di dashboard dan Vercel.

```text
https://gamequest-hub-tma.vercel.app/api/ads/monetag/<MONETAG_POSTBACK_PATH_SECRET>?ymid={ymid}&event_type={event_type}&reward_event_type={reward_event_type}&zone_id={zone_id}&sub_zone_id={sub_zone_id}&telegram_id={telegram_id}&estimated_price={estimated_price}
```

GameQuest Hub hanya memberi `+5 relics` setelah postback server-side memverifikasi intent, zone, status `valued`, dan data pemain. Callback frontend tidak memberi reward. Monetag merekomendasikan postback server-side, URL HTTPS, dan `ymid` unik untuk reward yang tepercaya serta idempoten.[3] [4]

## 9. Pemecahan masalah

| Gejala | Penyebab umum | Tindakan |
| --- | --- | --- |
| Tombol `/start` tidak dijawab | Webhook salah atau `TELEGRAM_WEBHOOK_SECRET` tidak cocok | Jalankan `getWebhookInfo`, perbarui `setWebhook`, lalu redeploy bila secret diubah. |
| App menampilkan **Open in Telegram** | URL dibuka di browser biasa | Buka dari tombol bot atau Menu Button Telegram. |
| `configured: false` pada health | Environment variable Telegram belum tersedia pada deployment | Tambahkan variabel di Vercel lalu Redeploy. |
| Quest gagal dimulai | Supabase key/URL tidak valid atau migration tidak tersedia | Periksa log Vercel dan akses tabel Supabase. |
| Reward tidak bertambah | Run belum completion atau postback iklan belum `valued` | Selesaikan tiga checkpoint; untuk iklan periksa dashboard Monetag dan endpoint postback. |

## Referensi

[1]: https://core.telegram.org/bots/api#setwebhook "Telegram Bot API — setWebhook"
[2]: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app "Telegram Mini Apps — Validating initData"
[3]: https://docs.monetag.com/docs/postbacks/ "Monetag — Postbacks"
[4]: https://docs.monetag.com/docs/postbacks/configuration/ "Monetag — Configuring Postbacks"
