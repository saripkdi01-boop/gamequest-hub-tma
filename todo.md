# Project TODO

- [x] Menetapkan arsitektur aman untuk Telegram Web App, webhook, dan deployment Vercel.
- [x] Membuat desain GameQuest Hub mobile-first yang responsif untuk viewport Telegram.
- [x] Memuat dan menginisialisasi Telegram Web Apps SDK, termasuk tema, safe area, dan tombol utama.
- [x] Memverifikasi ulang UI Home dan integrasi Telegram setelah kompilasi bersih.
- [x] Memastikan fallback aman ketika aplikasi dibuka di luar Telegram.
- [x] Memindahkan penyimpanan profil dan status pemain dari MySQL pengembangan ke Supabase produksi.
- [x] Menerapkan skema pemain serta kebijakan keamanan akses pada Supabase.
- [x] Memastikan fungsi Vercel memakai kredensial Supabase server-side tanpa mengeksposnya ke klien.
- [x] Membuat validasi `initData` di server menggunakan token bot tanpa mengekspos token ke klien.
- [x] Membuat endpoint webhook Telegram yang memverifikasi secret token dan menangani perintah `/start`.
- [x] Menambahkan skema data dan penyimpanan persisten untuk profil Telegram serta status awal pemain.
- [x] Menambahkan pengujian unit untuk validasi Telegram dan handler pembaruan bot.
- [x] Menulis README operasional, contoh konfigurasi environment variable, dan panduan webhook.
- [x] Memverifikasi tampilan, endpoint, pengujian, dan build project secara lokal.
- [x] Menguji endpoint autentikasi Telegram dengan initData valid dan tidak valid.
- [x] Menguji endpoint webhook Telegram dengan webhook secret benar dan salah.
- [x] Menambahkan rahasia server Telegram dan Supabase ke environment variables Vercel untuk mengaktifkan fungsi produksi.
- [x] Menetapkan URL Mini App dan webhook Telegram ke domain produksi Vercel, lalu memverifikasi endpoint kesehatan produksi.
- [x] Membuat repository GitHub privat dan menyiapkan deployment Vercel dengan secrets aman.
- [x] Memverifikasi asal URL Mini App yang dikonfigurasi pada fungsi Vercel production.
- [x] Menganalisis kesiapan repository untuk loop game nyata, progres pemain, dan monetisasi iklan.
- [x] Meneliti dokumentasi Monego serta merancang integrasi iklan yang aman untuk Telegram Mini App.
- [x] Menyusun prompt DeepSeek implementatif untuk pengembangan game dan monetisasi berikutnya.
- [x] Menyediakan prompt mandiri yang dapat ditempel ke DeepSeek untuk meng-upgrade seluruh repository GameQuest Hub.
- [x] Memvalidasi masukan DeepSeek dan menerapkan model data permainan Supabase yang aman.
- [x] Mengimplementasikan state machine Genesis Run, ledger XP/relic idempoten, dan API game terautentikasi.
- [x] Mengganti dashboard statis dengan dashboard pemain, quest run, hasil quest, dan leaderboard berbasis data server.
- [x] Menambahkan fondasi rewarded-ad yang hanya memberikan reward dari postback server-side tervalidasi.
- [x] Memverifikasi transaksi atomik rewarded-ad untuk ledger, relic, dan statistik harian melalui pemain uji sementara.
- [x] Menambahkan pengujian game/reward, dokumentasi operasional, dan validasi build mobile.
- [x] Memverifikasi replay completion Genesis Run tetap idempoten tanpa menggandakan reward.
- [x] Membatasi Genesis Run selesai satu kali per pemain per hari UTC.
- [x] Menyusun panduan aktivasi dan pengoperasian GameQuest Hub melalui BotFather, Vercel, Supabase, dan Telegram.
- [x] Menentukan desain mode eksplorasi visual Genesis Run yang sesuai untuk Telegram mobile.
- [x] Menyiapkan aset visual game, context files, dan arsitektur Babylon yang lifecycle-safe.
- [x] Mengimplementasikan scene eksplorasi playable serta menghubungkannya ke progres quest server-side.
- [x] Mengoptimalkan pemuatan Babylon agar dashboard utama tetap ringan di jaringan Telegram mobile.
- [x] Menambahkan navigasi kembali native Telegram dan haptic fokus gate pada mode eksplorasi.
- [x] Menyempurnakan reward, haptic, safe area, dan alur game khusus Telegram.
- [x] Memverifikasi MainButton dan haptic sukses pada hasil quest tanpa mengganggu fallback browser.
- [x] Menguji game mobile, build, dokumentasi, serta memperbarui deployment produksi.
- [x] Mendorong Explore Route terbaru ke GitHub dan memverifikasi deployment Vercel production.
- [x] Memperbaiki fallback routing SPA Vercel agar tautan langsung ke Explore Route tidak menghasilkan 404.
- [x] Mendiagnosis mengapa bot tidak merespons perintah `/run` pada chat Telegram.
- [x] Memperbaiki webhook atau handler command Telegram dan menghapus duplikasi command yang tidak diperlukan.
- [ ] Memverifikasi respons `/start` dan `/run` serta akses Mini App pada bot production.
- [ ] Melakukan uji end-to-end `/start` dan `/run` di bot production serta mencatat bukti tombol Mini App pada balasan bot.
- [ ] Menelusuri update `/run` production terbaru yang tidak menghasilkan balasan bot meskipun webhook telah dipulihkan.
- [ ] Mengaudit ulang konfigurasi delivery Telegram dan deployment aktif setelah webhook mandiri tidak membalas command pengguna.
- [x] Audit struktur production GameQuest Hub dan pilih route gameplay kanonis untuk integrasi 10 karakter.
- [x] Definisikan metadata, visual fallback, dan peran gameplay untuk NEXUS, POCKET, TONBIT, CROSSLINK, NEURA, SOSIALIS, SHIELDTMA, PIXELX, SPEEDRUN, dan LEGENDA.
- [x] Tambahkan Character3D lazy loader dengan fallback visual yang aman bagi perangkat Telegram mobile.
- [x] Buat loop gameplay per karakter yang tetap menggunakan validasi quest dan reward server-authoritative.
- [x] Bangun roster, detail karakter, serta tampilan progres/season yang konsisten dengan UI Quest Nexus.
- [x] Rancang referral, VIP, season pass, burn, staking, dan vesting sebagai kontrak backend dengan feature flag nonaktif.
- [x] Siapkan skema dan migration Supabase yang idempoten tanpa mengaktifkan pembayaran Stars, iklan reward, atau redemption sebelum konfigurasi pemilik tersedia.
- [x] Tambahkan regression test, audit Vercel runtime, dan verifikasi produksi sebelum rilis.

## Availability incident — two arenas

- [x] Reproduce the unavailable-service state for both arena entry flows and capture the exact API response contract.
- [x] Trace authentication, request body, route mapping, and client state handling for both arenas.
- [x] Implement a theme-consistent recovery path that never fabricates rewards or bypasses Telegram validation.
- [x] Add regression coverage for unavailable, unauthorized, malformed, and demo-safe states.
- [x] Verify both arena flows on production and document remaining owner-side blockers: browser preview correctly remains non-rewarding and requires a verified Telegram session; deployment 25bde2d is READY.

Evidence screenshots are stored outside the repository under /home/ubuntu/upload/ and are treated as evidence only.
