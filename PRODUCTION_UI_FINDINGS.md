# Production UI Findings — 25 Agustus 2026

Deployment `e060e98` berstatus `READY` pada Vercel dan canonical URL `https://gamequest-hub-tma.vercel.app/` melayani build baru.

Root dashboard berhasil menampilkan language selector dengan 24 locale, tombol Profile, status Preview/Online, enam metrik player (Quest Coins, Mind Score, Streak, Relics, Energy, Daily Score), CTA QUEST//MIND, quest board, dan link Rank.

Route `/profile` berhasil dilayani oleh SPA. Halaman menampilkan kartu profil Adventurer, player status, tanggal bergabung, preferred language, kartu leaderboard/rank personal, enam stat progression, serta XP progress bar. Dalam browser preview, data memakai preview state dan tidak melakukan request reward karena tidak ada Telegram initData signed.

Route `/leaderboard` juga berhasil diverifikasi live. Endpoint mengembalikan season `alpha-1` dan entry nyata **Syarief — Level 1 — 50 XP — #1**, sehingga leaderboard bukan lagi sekadar placeholder. Podium, selector bahasa, tombol kembali, dan tombol profil tampil tanpa runtime error. Browser preview tidak memiliki initData sehingga highlight rank personal hanya muncul ketika dibuka dari Telegram.

Selector bahasa diuji secara interaktif pada production: memilih `ID · Bahasa Indonesia` mengubah label live menjadi **Kembali**, **Musim Alpha**, dan **Papan Peringkat**. Registry selector menampilkan 24 locale termasuk Indonesia, Inggris, Spanyol, Prancis, Jerman, Portugis, Rusia, Mandarin, Jepang, Korea, Arab, Hindi, Turki, Italia, Belanda, Polandia, Ukraina, Vietnam, Thai, Melayu, Filipino, Swahili, Persia, dan Bengali.
