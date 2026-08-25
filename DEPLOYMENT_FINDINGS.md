# Deployment Findings — 25 Agustus 2026

Commit `599956f` sudah masuk ke deployment production Vercel dengan status `READY`. Canonical URL `https://gamequest-hub-tma.vercel.app/` kini menampilkan dashboard yang sudah diperbarui dengan Quest Coins, Mind Score, Streak, Relics, Energy, Daily Score, serta CTA QUEST//MIND.

Route `https://gamequest-hub-tma.vercel.app/mind` juga sudah aktif. UI menampilkan mode KNOW dan CHAIN sebagai mode yang dapat dipilih, sedangkan BLUFF dan BOSS masih disabled sesuai strategi delivery. Browser preview memberi label Verified dari keberadaan runtime WebApp object, tetapi karena tidak memiliki `initData`, tombol ENTER ARENA tetap disabled dan tidak membuat reward.

Direct deep-link `/mind` sekarang berhasil setelah deployment terbaru aktif. Verifikasi di dalam Telegram tetap diperlukan untuk menguji request authenticated dan RPC reward, karena browser preview tidak memiliki identitas Telegram signed.

## Supabase advisors

Security advisor menandai tabel existing dan tabel baru `qm_*` sebagai **RLS enabled without policy**. Untuk tabel game baru, ini disengaja karena migration juga melakukan `revoke all` dari `anon` dan `authenticated` serta hanya memberi akses ke `service_role`; tidak ada jalur client langsung. Temuan ini tetap perlu diuji lewat policy/permission test sebelum production redemption diaktifkan. Performance advisor menandai beberapa foreign key existing dan `qm_question_answers.question_id`/`qm_player_inventory.powerup_slug` tanpa covering index. Index player/session/ledger utama sudah dibuat; foreign-key index tambahan dapat ditambahkan pada hardening migration setelah query workload nyata diukur.

Rujukan advisor: https://supabase.com/docs/guides/database/database-linter
