# Economy Design — Quest Coins

**Status:** Fase 1 — baseline desain, belum mengaktifkan redemption  
**Tanggal:** 25 Agustus 2026  
**Author:** Manus AI

## Prinsip ekonomi

**Quest Coins (QC) adalah internal game points.** QC tidak boleh disebut token blockchain atau uang tunai sebelum terdapat mekanisme redemption yang benar-benar tersedia, treasury-backed, dan telah melalui review keamanan/operasional. XP adalah progression, Mind Score adalah ukuran skill/reputasi, sedangkan QC adalah currency utility.

Target accounting unit dari prompt adalah `1.000.000 QC = $1`, tetapi angka ini bukan janji pembayaran. Ia hanya boleh digunakan sebagai parameter konfigurasi internal untuk menghitung batas dan nilai accounting. UI harus menggunakan istilah **eligible redemption** dan selalu tunduk pada treasury balance, daily cap, cooldown, fraud review, dan kebijakan operator.

## Sumber emission dan sink

| Kategori | Sumber/sink | Perlakuan |
| --- | --- | --- |
| Emission | Jawaban benar, speed bonus, combo, daily quest, world event, achievement | Dihitung server-side; semua entry memiliki source dan reference ID |
| Utility sink | Hint, 50/50, revive, time freeze, power-up | Burn QC dalam transaksi yang sama dengan item grant/use |
| Cosmetic sink | Cosmetic, ticket, badge, special entry | Burn atau reserve sesuai item policy |
| Ad reward | Hint, revive, energy, cosmetic ticket, atau bonus kecil | Tidak menjadi unlimited QC faucet; tunduk pada intent/postback/cap |
| Redemption | Pengurangan QC dan pencatatan liability | Hanya dari immutable ledger, setelah eligibility/review |
| Correction | Reversal/admin adjustment | Wajib audit reason dan role protection; tidak menghapus entry lama |

## Model ledger

Setiap perubahan QC harus menjadi entry immutable dengan minimal field berikut:

| Field | Kegunaan |
| --- | --- |
| `transaction_id` | Identifier unik yang dapat dirujuk support dan redemption |
| `player_id` | Pemilik transaksi |
| `type` | `EARN`, `BURN`, `REDEMPTION`, `REVERSAL`, atau `ADMIN_ADJUSTMENT` |
| `amount` | Bilangan signed/atau amount positif dengan type yang eksplisit; implementasi harus konsisten |
| `source` | `know_correct`, `chain_combo`, `hint`, `redemption`, dan sebagainya |
| `reference_id` | Session, answer, purchase, redemption, atau event reference |
| `idempotency_key` | Pencegah replay/double grant |
| `created_at` | Waktu server |
| `metadata_json` | Difficulty, multiplier, fraud decision, dan metadata non-secret |

Saldo pemain boleh tersedia sebagai **cached projection**, tetapi tidak boleh menjadi satu-satunya source of truth. Rekonsiliasi harus dapat menghitung saldo dari ledger dan menemukan perbedaan.

## Formula MVP yang dapat dikonfigurasi

Nilai berikut adalah default awal untuk simulasi, bukan konstanta yang boleh di-hard-code di frontend:

```text
base_qc = difficulty.base_reward
speed_ratio = clamp(remaining_time / time_limit, 0, 1)
speed_multiplier = 1 + speed_ratio * speed_bonus_max
combo_multiplier = min(1 + combo_index * combo_step, combo_cap)
risk_multiplier = 1 untuk SAFE; risk_multiplier_max untuk RISK
raw_qc = floor(base_qc * speed_multiplier * combo_multiplier * risk_multiplier)
final_qc = min(raw_qc, per_answer_cap, remaining_daily_emission_cap)
```

`Mind Score` dan `XP` dihitung terpisah. Correct answer dapat menambah Mind Score berdasarkan difficulty dan confidence rule; XP mengikuti progression curve; QC mengikuti emission budget. A wrong answer tidak boleh memberi QC, tetapi dapat memengaruhi combo, streak, atau energy sesuai mode.

## Suggested default configuration

| Parameter | Default awal | Catatan operasional |
| --- | ---: | --- |
| `easy.base_reward` | 25 QC | Dapat diubah admin |
| `medium.base_reward` | 60 QC | Dapat diubah admin |
| `hard.base_reward` | 140 QC | Dapat diubah admin |
| `boss.base_reward` | 500 QC | Terbatas attempt |
| `speed_bonus_max` | 0,50 | Maksimum +50% |
| `combo_step` | 0,20 | +20% per combo level |
| `combo_cap` | 3,00 | Batas multiplier 3x |
| `per_answer_cap` | 1.000 QC | Guardrail global |
| `daily_player_emission_cap` | 10.000 QC | Melindungi faucet |
| `redemption_threshold_qc` | 1.000.000 QC | Eligibility minimum, bukan jaminan payout |
| `redemption_cooldown_hours` | 72 | Dapat dipakai untuk fraud review |
| `daily_redemption_cap_qc` | 10.000.000 QC | Treasury-backed operator cap |
| `risk_review_threshold` | 70/100 | Di atas threshold masuk REVIEW |

## Treasury accounting

Treasury dashboard server-side harus menampilkan `total_emitted`, `total_burned`, `total_redeemed`, `pending_redemption`, `treasury_balance`, `daily_emission`, `daily_redemption`, dan `circulating_qc`. `circulating_qc` harus dihitung dengan formula yang terdokumentasi, misalnya `emitted - burned - redeemed - expired/reversed_amount` sesuai kebijakan final.

Treasury balance tidak boleh dikirim ke client secara detail. Client cukup menerima status eligibility, estimasi accounting value jika diizinkan policy, cap yang berlaku, dan status request. Secret wallet/treasury operational data tetap server-side.

## Redemption lifecycle

```text
LOCKED
  → ELIGIBLE
  → PENDING
  → REVIEW atau PROCESSING
  → PAID / REJECTED
```

Eligibility harus memeriksa saldo ledger, threshold, daily cap, cooldown, player risk score, duplicate pending request, dan account status. Payout tidak boleh dipicu dari saldo client atau input `amount` tanpa re-derivation server-side. Semua perubahan status memiliki audit trail serta `ledger_transaction_id`.

## Risiko ekonomi utama

Risiko terbesar adalah QC faucet yang lebih cepat daripada sink, multi-account farming, rewarded-ad abuse, dan persepsi bahwa QC adalah pendapatan terjamin. Karena itu, fase MVP harus mengaktifkan QC sebagai utility currency internal tanpa payout. Redemption hanya dapat diaktifkan setelah treasury policy, identity/fraud review, reconciliation, dan operational runbook tersedia.

## Kesimpulan

MVP harus mengutamakan ledger dan konfigurasi, bukan nilai payout. Formula harus tersimpan di backend dan dapat diubah melalui admin-protected settings. Semua emission/burn harus atomic, idempotent, dan dapat direkonsiliasi.
