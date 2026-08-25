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

### 3. Pipeline aset sepuluh karakter
- **Why isolated:** GLB dengan skeleton, animasi, kompresi, dan texture besar dapat gagal dimuat atau mengganggu frame rate Telegram mobile.
- **Approach:** Roster pertama memakai metadata guide, procedural Babylon mesh, serta fallback SVG yang selalu tersedia. Loader GLB hanya menjadi progressive enhancement untuk model yang disuplai pemilik dan telah lolos budget ukuran/perangkat.
- **Verify:** Memilih salah satu dari sepuluh guide mengubah HUD dan companion scene tanpa canvas kosong, import gagal, atau render loop baru.

### 4. Seleksi guide versus ekonomi authoritative
- **Why isolated:** Karakter yang dipilih klien tidak boleh menghasilkan QC, Relics, Stars, inventory, ataupun bonus referral tanpa validasi server.
- **Approach:** Guide awal mengubah identitas visual dan konteks strategi saja. Semua benefit mekanik masa depan berada di feature flag backend dengan Telegram identity, rate-limit, cap, dan ledger idempoten.
- **Verify:** Perubahan guide tidak memanggil API reward atau mengubah statistik/dashboard pemain.

## Main Build

Bangun mode **Explore Route** berupa jalur isometrik tiga gate dengan Pathfinder, beacon, glass bridge, relic arch, lima crystal collectible visual, navigasi tap-friendly, HUD XP/relic, serta CTA untuk melanjutkan Genesis Run. Scene menggunakan procedural meshes ringan dan satu visual target generated sebagai referensi mood, bukan sebagai sumber aturan game.

Upgrade ini menambahkan roster NEXUS, POCKET, TONBIT, CROSSLINK, NEURA, SOSIALIS, SHIELDTMA, PIXELX, SPEEDRUN, dan LEGENDA. Setiap guide memiliki peran, warna, signature protocol, serta afinitas sistem game yang jelas. `/explore` tetap menjadi route gameplay kanonis; roster hanya meneruskan preferensi presentasi ke route tersebut dan tidak menggandakan alur Genesis Run.

- **Assets needed:** satu visual target in-game portrait, texture/background bernuansa midnight-navy dan lime, serta procedural mesh untuk platform, gate, crystal, dan Pathfinder.
- **Verify:**
  - Tap gate yang tersedia memicu pilihan checkpoint yang benar.
  - Player marker bergerak ke gate berikutnya setelah respons API berhasil.
  - HUD terbaca pada viewport 360–430px tanpa overlap.
  - Scene fallback saat dibuka di browser biasa tetap informatif.
  - Tidak ada texture hilang, glitch clipping mencolok, atau error console.
  - Konsistensi reference: navy gelap, edge lime/cyan, tiga gate, crystal, dan UI minimal.
