# Game Development Memory

- GameQuest Hub sudah memiliki Genesis Run tiga checkpoint, reward ledger idempoten, daily limit, leaderboard, dan Vercel/Supabase production.
- Browser biasa tidak memiliki `initData`; game eksplorasi harus memperlihatkan fallback preview tanpa memberi reward.
- Visual target generated disimpan pada URL `/manus-storage/genesis-run-visual-target_1612aac3.png`; halaman Explore Route memakainya sebagai route atlas HTML agar kompatibel dengan renderer mobile dan tetap sebagai referensi art direction.
- Monetag tetap feature-gated sampai operator memberikan SDK URL dan zone resmi. Tidak ada reward iklan dari callback klien.
- Explore Route memakai Babylon dengan fallback WebGL1 yang lebih kompatibel untuk webview/capture mobile. Bila setelah upgrade dependency scene kosong, hapus cache `node_modules/.vite`, restart server, lalu verifikasi ulang screenshot.
- Build produksi memisahkan Explore Route sebagai bundle lazy; dashboard tidak mengunduh Babylon sampai pemain membuka Genesis Run.
- Verifikasi server-side Genesis Run mengonfirmasi autentikasi Telegram, tiga checkpoint, replay idempoten, daily limit, dan ledger rewarded-ad atomik.
