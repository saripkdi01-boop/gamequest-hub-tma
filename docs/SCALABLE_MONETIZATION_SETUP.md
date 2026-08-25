# QUEST//MIND — Scalable Monetization Setup

## Status implementasi

Opsi B sekarang tersedia sebagai **adapter yang feature-flagged**. AdsGram memiliki jalur rewarded, interstitial, dan task pada client. Server memilih provider dari `ADS_PROVIDER` dan hanya membuat rewarded intent bila provider serta credential publik yang sesuai tersedia. Monetag existing tetap dapat dipakai melalui postback lama. AdsGram rewarded dikategorikan `provider_callback_pending` karena callback browser saja tidak dianggap sebagai bukti ledger; QC/relic tidak boleh diberikan hanya karena Promise `show()` selesai.

Telegram Stars memiliki route `/stars`, action invoice pada endpoint dashboard yang sudah ada, order table server-side, validasi `pre_checkout_query`, penyimpanan `successful_payment`, `telegram_payment_charge_id`, serta entitlement idempotent. Route tidak menampilkan katalog sampai `VITE_STARS_CATALOG_ENABLED=true` dan SKU server-side tersedia.

TON Connect memiliki route `/wallet`, manifest publik, dan ikon. Fase ini hanya non-custodial wallet connection; belum ada `ton_proof` binding server, jetton, redemption, trading, atau transfer value.

## Environment variables

| Variable | Scope | Contoh | Keterangan |
|---|---|---|---|
| `VITE_ADS_ENABLED` | client + server compatibility | `false` | Default aman: disabled |
| `ADS_ENABLED` | server | `false` | Set `true` hanya setelah provider siap |
| `ADS_PROVIDER` | server | `adsgram` atau `monetag` | Provider rewarded utama |
| `VITE_ADS_PROVIDER` | client build | `adsgram` atau `monetag` | Harus sama dengan server |
| `VITE_ADSGRAM_BLOCK_ID` | client | dari publisher AdsGram | Rewarded placement; bukan secret |
| `VITE_ADSGRAM_INTERSTITIAL_BLOCK_ID` | client | dari publisher AdsGram | Revenue-only interstitial |
| `VITE_ADSGRAM_TASK_BLOCK_ID` | client | dari publisher AdsGram | Revenue-only task |
| `ADSGRAM_BLOCK_ID` | server | dari publisher AdsGram | Required gate untuk membuat intent AdsGram |
| `VITE_MONETAG_SDK_SRC` | client | provider SDK URL | Dipakai bila provider `monetag` |
| `VITE_MONETAG_ZONE_ID` | server | existing zone | Validasi postback Monetag |
| `VITE_STARS_CATALOG_ENABLED` | client build | `false` | Menampilkan tombol Stars only when true |
| `TELEGRAM_STARS_CATALOG_JSON` | server secret | JSON SKU catalog | Berisi title, description, amountXtr, dan benefit; tidak disimpan di git |

Contoh catalog JSON yang aman untuk staging adalah `{"yuki.skin": {"title": "Yuki Skin", "description": "Digital cosmetic for Yuki", "amountXtr": 25, "benefit": {"type": "cosmetic", "item": "yuki.skin"}}}`. Harga dan benefit tersebut hanya contoh teknis dan tidak aktif sampai product owner menyetujuinya.

## Activation checklist

AdsGram live memerlukan publisher account yang disetujui, tiga block ID bila seluruh placement diaktifkan, serta kepastian dari provider mengenai server-verifiable callback atau postback untuk rewarded completion. Tanpa itu, interstitial/task dapat digunakan sebagai revenue-only experiment, tetapi rewarded tidak boleh menambah relic/QC.

Stars live memerlukan SKU final, harga XTR, deskripsi benefit, terms, privacy, support/refund process, dan bot webhook production yang sudah menerima payment updates. Telegram menyatakan digital goods/services di dalam Telegram harus memakai Stars `XTR` [1].

Wallet live hanya memerlukan manifest publik yang valid untuk koneksi. Settlement masa depan memerlukan server `ton_proof`, treasury policy, audited jetton contract, fraud controls, redemption policy, dan legal review. Jangan menambahkan private key, seed phrase, atau signer secret ke environment client.

## References

[1]: https://core.telegram.org/bots/payments-stars "Telegram — Bot Payments API for Digital Goods and Services"
[2]: https://docs.adsgram.ai/publisher/reward-interstitial-integration "AdsGram — Reward and Interstitial Integration"
[3]: https://docs.ton.org/applications/ton-connect/get-started "TON Docs — Get started with TON Connect"
