# Game Plan: GameQuest Hub — Genesis Run Exploration

## Risk Tasks

### 1. Babylon canvas di dalam Telegram Mini App
- **Why isolated:** React 19 dapat memasang effect dua kali di development, sedangkan Telegram webview memiliki viewport dinamis, safe area, dan keterbatasan input touch.
- **Approach:** Inisialisasi `Engine` tepat satu kali di `GameCanvas`, dispose seluruh scene/listener saat unmount, gunakan canvas berukuran penuh, dan tetap pertahankan UI React sebagai shell.
- **Verify:** Berpindah Home → Explore → Home berulang kali tanpa canvas ganda, error console, atau viewport terpotong; resize dan touch input tetap responsif.

### 2. Handoff eksplorasi ke progres quest aman
- **Why isolated:** Eksplorasi tidak boleh menjadi sumber reward. Backend Genesis Run tetap menentukan checkpoint, pilihan valid, dan completion.
- **Approach:** Scene hanya mengirim event pilihan checkpoint yang sudah tersedia dari API. React memanggil API existing, lalu meneruskan state baru ke scene tanpa menyimpan XP/relic di klien.
- **Verify:** Pemilihan gate berikutnya membuka checkpoint valid; completion tetap menghasilkan satu ledger reward meski tombol/pilihan ditekan ulang.

## Main Build

Bangun mode **Explore Route** berupa jalur isometrik tiga gate dengan Pathfinder, beacon, glass bridge, relic arch, lima crystal collectible visual, navigasi tap-friendly, HUD XP/relic, serta CTA untuk melanjutkan Genesis Run. Scene menggunakan procedural meshes ringan dan satu visual target generated sebagai referensi mood, bukan sebagai sumber aturan game.

- **Assets needed:** satu visual target in-game portrait, texture/background bernuansa midnight-navy dan lime, serta procedural mesh untuk platform, gate, crystal, dan Pathfinder.
- **Verify:**
  - Tap gate yang tersedia memicu pilihan checkpoint yang benar.
  - Player marker bergerak ke gate berikutnya setelah respons API berhasil.
  - HUD terbaca pada viewport 360–430px tanpa overlap.
  - Scene fallback saat dibuka di browser biasa tetap informatif.
  - Tidak ada texture hilang, glitch clipping mencolok, atau error console.
  - Konsistensi reference: navy gelap, edge lime/cyan, tiga gate, crystal, dan UI minimal.
