# Product Gap Analysis — QUEST//MIND

**Status:** Fase 1 — audit non-destruktif  
**Tanggal:** 25 Agustus 2026  
**Author:** Manus AI

## Posisi produk saat ini

GameQuest Hub saat ini terasa seperti **dashboard adventure ringan** dengan satu quest Genesis Run. Pemain melihat player card, level, streak, relics, dan satu quest board. Interaksi utama adalah memilih tiga checkpoint naratif dalam scene Babylon. Reward yang terlihat adalah XP dan relics.

Target QUEST//MIND membutuhkan pengalaman yang berbeda: **competitive quiz + arcade + strategy + light Web3 economy**. Core loop yang dituju adalah `PLAY → THINK → CHOOSE → COMBO → EARN → SPEND → RANK → RETURN`. Karena itu, upgrade utama bukan sekadar reskin; diperlukan model sesi kuis, feedback real-time, progression terpisah, economy yang dikontrol, dan sistem kompetisi sosial.

## Matriks gap fitur

| Area | Existing | Target | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- | --- |
| Identitas produk | GameQuest Hub · Season Alpha | QUEST//MIND dengan tagline “Think Fast. Choose Smart. Build Your Quest.” | P1 | Naming, copy, dan visual konsisten di dashboard serta onboarding |
| Dashboard | Player card, 3 stats, Genesis Run, Reward vault | Quest hub, QC/XP/Mind Score, energy, streak, daily score, quick actions | P0 | Dashboard memuat state server dan tetap ringan |
| Mode game | Genesis Run checkpoint choice | KNOW, BLUFF, CHAIN, BOSS QUESTION, WORLD QUESTION | P0/P1 | KNOW dan CHAIN menjadi MVP; mode lain fase lanjutan |
| Pertanyaan | Tidak ada schema kuis | Question schema, difficulty, answer validation, explanation | P0 | Correct answer tidak pernah dikirim sebelum submission |
| Progression | XP, level, streak, relics | XP, level, streak, Mind Score, rank, combo, daily score, energy | P0 | XP, QC, dan Mind Score memiliki tujuan berbeda |
| Economy | XP/relic reward terbatas | QC internal, emission, burn, treasury, cap, redemption pool | P0/P2 | Semua perubahan QC berasal dari ledger server-side |
| Leaderboard | Season Alpha berdasarkan XP | Global, daily, weekly, season; Mind Score/Daily Score/Season XP | P0 | Saldo QC bukan satu-satunya ranking |
| Daily loop | Completion quest harian dan ad count | Daily quest, streak, boss attempt, world question, cap, daily leaderboard | P0/P1 | Semua reset berbasis UTC/server time |
| Social | Belum terlihat di dashboard | Share result/rank, invite, challenge player, daily challenge link | P1 | Share bersifat opt-in dan tidak spam |
| Achievement | Belum ada | FIRST BLOOD, SPEED THINKER, PERFECT RUN, dan seterusnya | P1 | Event achievement dicatat server-side dan idempoten |
| Season | `alpha-1` hard-coded di query/RPC | Season 30 hari dengan reset XP/rank, QC dipertahankan | P1 | Season config bisa diubah admin |
| Wallet | Belum ada | TON Connect sebagai settlement layer non-custodial | P2 | Tidak pernah meminta/menyimpan private key |
| Admin | Belum ada capability game admin yang terverifikasi | Question, config, fraud, redemption, treasury, leaderboard inspection | P2 | Semua endpoint admin protected dan audited |
| Performance | Babylon lazy-loaded | Quiz-first initial JS minimal; Babylon optional | P0 | Babylon tidak dimuat di dashboard/quiz |

## Rekomendasi urutan delivery

**MVP pertama** harus memvalidasi core loop tanpa membawa risiko payout: dashboard baru, KNOW, CHAIN, XP, Mind Score, QC ledger internal, daily quest, leaderboard, energy, dan power-up utility. BLUFF dapat ikut setelah rule risk/penalty disepakati, tetapi tidak boleh memakai uang nyata atau menjanjikan payout.

**Fase kedua** menambahkan BOSS QUESTION, WORLD QUESTION, achievements, dan season. Sistem ini meningkatkan retention dan kompetisi, tetapi tidak boleh dibangun sebelum event/session ledger cukup stabil.

**Fase ketiga** menambahkan treasury, redemption queue, dan TON Connect abstraction. Redemption harus dimulai sebagai status/eligibility/review flow, bukan payout otomatis. Nilai `1,000,000 QC = $1 accounting unit` harus disimpan sebagai konfigurasi ekonomi dan copy UI harus memakai istilah **eligible redemption**, bukan janji uang.

## Alur pemain target

```text
Onboarding
  → Dashboard
  → pilih mode + lihat reward/cost/energy
  → start session dari server
  → terima pertanyaan publik tanpa correct answer
  → pilih jawaban + timing metadata
  → server resolve correctness, reward, combo, XP, Mind Score
  → hasil + explanation + ledger reference
  → update daily score / leaderboard / achievements
  → spend QC pada utility atau kembali bermain
```

## Prinsip UX

Pengalaman harus terasa seperti produk game premium, bukan crypto dashboard. Gunakan dark navy, electric cyan, warm gold, dan neon secukupnya. Primary action harus jelas di layar 360–430px. Feedback correct/wrong dibuat cepat dan informatif; animasi tidak boleh menjadi prasyarat pemahaman hasil. Mode quiz harus usable tanpa Babylon dan tanpa asset berat.

## Keputusan yang perlu dikunci pada fase desain

| Keputusan | Default yang disarankan | Alasan |
| --- | --- | --- |
| Sumber waktu | `now()` server/UTC | Mencegah manipulasi device time |
| Sumber reward | PostgreSQL transaction + immutable ledger | Mencegah double reward/race condition |
| Score ranking | Mind Score, Daily Score, Season XP | Mendukung skill dan engagement, bukan saldo |
| Energy | Cached projection dengan event ledger opsional | Pembacaan cepat tanpa mengorbankan aturan server |
| QC | Internal game points, bukan token blockchain | Aman secara produk dan komunikasi |
| Babylon | Adventure/exploration optional | Menjaga performa dan aset existing |
| Ads | Utility/revive/hint dengan cap | Tidak menjadikan iklan mesin emission utama |

## Kesimpulan

Gap terbesar berada pada gameplay dan domain model. UI existing dapat menjadi dasar visual, tetapi dashboard perlu diubah menjadi hub kompetitif dan disertai kontrak API/database baru. Implementasi harus dimulai dari KNOW + CHAIN serta ledger QC internal sebelum masuk ke redemption atau blockchain settlement.
