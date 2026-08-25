# Performance Audit — Telegram Mobile

**Status:** Fase 1 — audit non-destruktif  
**Tanggal:** 25 Agustus 2026  
**Author:** Manus AI

## Kondisi existing

Dashboard React existing memuat komponen UI ringan dan menggunakan endpoint dashboard hanya ketika `initData` Telegram tersedia. Genesis exploration dipisahkan ke route dan Babylon dimuat secara lazy. Ini adalah keputusan arsitektur yang tepat untuk Telegram WebView, jaringan 4G, dan Android low-mid range.

Build baseline berhasil setelah dependency di-install. Type-check juga berhasil. Ukuran bundle aktual dan WebView profiling belum diukur pada fase ini, sehingga angka performa belum boleh diklaim. Baseline test memiliki 11 test lulus dan 2 test gagal karena environment/integration access, bukan karena unit engine atau Telegram behavior mock.

## Risiko performa target

| Area | Risiko | Rekomendasi |
| --- | --- | --- |
| Initial JS | Penambahan mode, icons, charts, dan wallet SDK dapat memperbesar bundle | Route-level lazy loading; jangan import Babylon/Ton Connect di dashboard |
| Data fetch | Dashboard terlalu banyak request serial | Satu read model dashboard; cache pendek dengan `cache-control: no-store` tetap untuk data sensitif |
| Quiz rendering | Animasi dan state update per answer dapat menyebabkan jank | CSS transform/opacity, feedback singkat, hindari layout thrashing |
| Leaderboard | Dataset besar dan query ranking mahal | Pagination/limit, index `(season_id, score desc)`, server-side rank window atau materialized snapshot |
| Babylon | Scene berat pada low-end | Tetap optional, procedural/light assets, dispose engine/scene, fallback jika WebGL bermasalah |
| Network failure | Telegram WebView dapat kehilangan koneksi | Loading/empty/error states; retry idempotent; tidak memberi reward offline |
| Images/assets | Visual polish dapat membebani initial load | SVG/vector, compressed assets, defer non-critical visuals |
| Wallet | TON Connect SDK tidak diperlukan pada core loop | Muat hanya halaman redemption/provider flow dan tetap abstrak |

## Target pengukuran fase implementasi

| Metric | Target awal |
| --- | --- |
| Dashboard first meaningful UI | ≤ 2 detik pada koneksi 4G simulasi |
| Quiz first question after start | ≤ 1 detik setelah response server |
| Initial JS sebelum quiz/Babylon | Serendah mungkin; ukur dengan bundle analyzer setelah MVP |
| Interaction feedback | Segera setelah submission response; tidak menunggu asset berat |
| Babylon mode | Tidak memblokir dashboard dan quiz |
| Low-end rendering | 60 FPS jika memungkinkan; fallback effects bila device lemah |
| Memory | Dispose scene/listener saat route ditinggalkan; tidak ada canvas ganda |

## Strategi implementasi

Dashboard menampilkan skeleton ringan, mengambil satu read model, dan menyimpan hanya state tampilan lokal. Question session diambil server-side secara batch kecil agar perpindahan pertanyaan tidak memerlukan payload besar. `correct_answer` dan scoring rule tidak pernah berada di bundle atau response publik.

Mode BOSS dan WORLD dapat menambahkan animasi spesial melalui CSS/SVG ringan, bukan particle system besar. Babylon tetap menjadi optional exploration layer yang di-load dengan dynamic import saat Genesis Run dipilih. TON Connect dan halaman redemption juga wajib memakai dynamic import agar tidak menambah initial dashboard bundle.

## Verifikasi

Pada fase QA, gunakan viewport 360px, 390px, dan 430px; throttling slow 4G; device emulation Android low-end; repeated navigation Home → Quiz → Home dan Home → Genesis → Home; serta network interruption saat start/submit/retry. Hasil pengukuran harus disimpan bersama build artifact dan tidak digantikan oleh perkiraan.
