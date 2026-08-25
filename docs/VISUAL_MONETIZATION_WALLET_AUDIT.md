# GameQuest Hub — Audit Visual, Monetisasi, Wallet, dan Stars

## Ringkasan

Project existing menggunakan React + Vite + Babylon.js, bukan Next.js. Scene Babylon saat ini sudah memiliki route atlas 3D procedural, tetapi masih menggunakan geometri dasar, `StandardMaterial`, satu kamera ArcRotate, dan lighting sederhana. Lampiran `gamequest-visual-upgrade.zip` menyediakan arah visual Quest Nexus: palet indigo-violet, teal portal, emas quest, glassmorphism, tombol 3D CSS, companion Yuki, dan particle field. Arah tersebut dapat diadaptasi tanpa memaksa dependency baru.

Visual target baru dibuat sebagai referensi art direction: portal batu kuno, pulau melayang, kristal bercahaya, karakter anime chibi semi-classic, rim lighting, dan komposisi portrait. Aset besar tidak boleh di-commit ke repository; URL CDN hasil upload disimpan pada asset manifest implementation.

## Keputusan visual

| Area | Baseline | Upgrade aman |
|---|---|---|
| Scene | Platform hexagonal dan gate sederhana | Pulau bertingkat, portal berlapis, kristal, rune, fog, dynamic point lights, dan floating particles dengan jumlah dibatasi device performance |
| Character | Capsule + visor | Companion procedural low-poly dengan head, hair crest, cape, orb, dan outline/emissive accents; kontrak callback gameplay tetap sama |
| Materials | StandardMaterial | PBR/standard fallback yang hemat, emissive accents, fresnel-like layering bila kompatibel |
| UI | Compact dark shell | Quest Nexus glass panels, 3D keycap buttons, subtle depth, generated visual target sebagai optional backplate/thumbnail |
| Motion | Rotation dan bob sederhana | Pulse portal, orbiting runes, crystal sway, companion hover, success/fail hooks, respect `prefers-reduced-motion` |
| Performance | Babylon engine dengan adaptive device ratio | DPR cap, reduced particle count, bounded scene objects, no large GLB, no mandatory post-process on low-end devices |

## Monetisasi provider

AdsGram resmi menyediakan rewarded video, interstitial, dan task format untuk Telegram Mini Apps. Rewarded ads diinisialisasi memakai `blockId` dari akun publisher dan promise `show()` menyelesaikan alur setelah iklan selesai; dokumentasi menyatakan event Reward tersedia setelah pengguna menyelesaikan tontonan. Akun publisher, block ID, dan persetujuan moderasi tetap diperlukan sebelum iklan benar-benar menghasilkan pendapatan [1] [2].

| Pendekatan | Tradeoffs | Cost | Setup Complexity |
|---|---|---:|---:|
| AdsGram rewarded + adapter server | Cocok dengan Telegram Mini App, format rewarded/interstitial/task, dashboard publisher dan payout; memerlukan publisher account, block ID, dan verifikasi event/provider | Bergantung terms AdsGram; payout dan minimum withdrawal mengikuti akun/provider | Sedang–tinggi |
| Pertahankan provider existing Monetag | Jalur intent/postback dan ledger sudah tersedia; perubahan lebih kecil, tetapi konfigurasi provider existing harus tersedia dan belum tentu sesuai kebutuhan AdsGram | Bergantung terms provider | Rendah–sedang |
| Interstitial tanpa reward sebagai fallback | Integrasi lebih ringan dan tidak menyentuh reward ledger; UX lebih mengganggu dan tidak cocok sebagai sumber reward pemain | Bergantung fill/terms provider | Rendah |

Keputusan implementasi: buat **provider adapter** dengan AdsGram sebagai opsi konfigurabel melalui `VITE_ADSGRAM_BLOCK_ID` dan `ADS_PROVIDER=adsgram|monetag`. Jangan memberi reward berdasarkan client callback saja. Alur reward harus tetap memulai intent di server, memakai idempotency/cap/cooldown, dan hanya menyelesaikan reward melalui bukti provider yang tersedia. Jika AdsGram tidak menyediakan server-verifiable callback untuk akun yang dipakai, mode AdsGram harus menghasilkan revenue telemetry tanpa memberi QC/relic otomatis sampai mekanisme verifikasi resmi dikonfigurasi.

## Telegram Stars

Telegram menyatakan bahwa penjualan digital goods dan services di dalam bot atau Mini App harus menggunakan Telegram Stars dengan currency tag `XTR`; alur server harus mengirim invoice, menangani `pre_checkout_query` dalam batas waktu, menunggu `successful_payment`, menyimpan `telegram_payment_charge_id`, dan baru mengirim barang/layanan setelah pembayaran sukses [3]. Telegram juga menyatakan bahwa pembayaran digital tidak boleh diganti dengan cryptocurrency atau provider pihak ketiga di dalam Telegram apps [3].

Keputusan implementasi: Stars digunakan untuk **digital goods** seperti cosmetic companion, energy refill, premium quest access, atau season pass. Stars tidak digunakan sebagai jalur langsung membeli token yang dijanjikan bernilai dolar tetap. Handler webhook production perlu ditambah untuk `pre_checkout_query`, `successful_payment`, refund, `/terms`, dan `/paysupport` sebelum mode live diaktifkan.

## TON Connect dan token economy

TON Connect adalah protokol koneksi wallet; private key tetap berada di wallet dan aplikasi menerima address serta meminta signature/transaction tanpa menyentuh private key [4]. DApp perlu menyediakan `tonconnect-manifest.json` publik melalui HTTPS, dengan icon PNG/ICO, dan memakai `@tonconnect/ui-react` untuk React [5].

Keputusan implementasi: fase pertama hanya menghubungkan wallet, menyimpan address yang sudah dibuktikan melalui `ton_proof`, dan menampilkan status network. Tidak ada private key di server. Fase token berikutnya menggunakan jetton/contract yang diaudit, ledger internal append-only, idempotent redemption, treasury approval, dan testnet dry-run.

Rasio `1.000.000 : 1 USD` tidak boleh diimplementasikan sebagai nilai tukar tetap atau dijanjikan sebagai harga pasar. Harga TON/jetton berubah, dan game tidak boleh menyebut saldo in-game sebagai aset yang pasti dapat ditukar dengan USD. Rasio tersebut dapat dicatat hanya sebagai **konfigurasi internal non-binding** untuk simulasi ekonomi/testnet, dengan label jelas “simulasi, bukan harga, bukan jaminan redemption”.

## Guardrail production

Sebelum menyalakan payout, redemption, atau penjualan token, project perlu memiliki terms, privacy policy, risk disclosure, support channel, audit contract, treasury controls, rate limits, fraud monitoring, backup payment records, dan pengujian testnet. Admin key, mint authority, payout signer, dan provider secret tidak boleh berada di client bundle.

## References

[1]: https://docs.adsgram.ai/publisher/reward-interstitial-integration "AdsGram — Reward and Interstitial Integration"
[2]: https://adsgram.ai/monetization "AdsGram — Monetization for Telegram Mini Apps"
[3]: https://core.telegram.org/bots/payments-stars "Telegram — Bot Payments API for Digital Goods and Services"
[4]: https://docs.ton.org/applications/ton-connect/overview "TON Docs — TON Connect overview"
[5]: https://docs.ton.org/applications/ton-connect/get-started "TON Docs — Get started with TON Connect"
