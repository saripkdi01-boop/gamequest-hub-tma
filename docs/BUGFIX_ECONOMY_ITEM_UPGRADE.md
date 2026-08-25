# QUEST//MIND — Bugfix, Quest Mining, dan Item Economy

## Perubahan utama

Bug `Unexpected token 'A', "A server e"... is not valid JSON` diperbaiki pada response parser terpusat. Client sekarang membaca content type dan body secara aman, mengekstrak pesan dari plain text atau HTML gateway error, serta menolak JSON success yang malformed dengan error terkontrol. Semua route gameplay, AdsGram, dan Stars memakai parser yang sama.

Reward Vault sekarang memiliki tiga quest server-authoritative: `signal_mining` memberikan 60 Quest Coins, `daily_bonus` memberikan 5 relic, dan `relic_resonance` memberikan 2 relic. Semua intent memiliki daily cap tiga iklan, cooldown sepuluh menit, expiry, provider discriminator, idempotency key, dan grant melalui `grant_ad_reward`. Callback AdsGram browser tetap hanya berstatus pending sampai bukti server-verifiable dari provider dikonfirmasi; interstitial dan task bersifat revenue-only.

Telegram Stars sekarang memiliki blueprint enam item digital: Energy Cell, Relic Key, Streak Sigil, Focus Lens, Yuki Prism Skin, dan Chain Booster. Harga preset hanya bersifat provisional dan invoice dilindungi `TELEGRAM_STARS_CATALOG_LIVE=false` secara default. Setelah owner menyetujui harga dan benefit, catalog dapat diaktifkan melalui environment server tanpa mengubah client. Successful payment memakai `telegram_payment_charge_id`, entitlement idempotent, serta RPC `grant_stars_item` yang menambahkan quantity pada `player_item_inventory`.

## Sirkulasi ekonomi

Quest Coins tetap merupakan saldo internal server, terpisah dari TON dan tidak memiliki harga pasar tetap. Quest iklan menjadi sumber emisi terbatas dengan cap harian. Stars hanya membeli digital goods; tidak membeli QC, tidak menjanjikan profit, dan tidak mengaktifkan redemption. Inventory ditampilkan pada dashboard sehingga jalur `payment → entitlement → inventory` dapat diaudit.

## Visual dan performa

Babylon scene mempertahankan floating Nexus, portal, gate, crystal, rune, fog, glow, dan companion anime. Low-power mode meningkatkan hardware scaling, menurunkan glow/object count, dan menghentikan animasi ketika `prefers-reduced-motion` aktif. Explore tetap lazy-loaded dan tidak memindahkan scoring/reward ke client.

## Aktivasi yang masih membutuhkan owner

AdsGram membutuhkan publisher approval, rewarded/interstitial/task block ID, serta bukti callback/postback server-verifiable. Stars membutuhkan persetujuan final SKU, harga XTR, benefit, terms, privacy, support, dan refund process. Tidak ada private key, seed phrase, signer, transfer TON, jetton deployment, trading, atau redemption yang disimpan atau dijalankan.

## Verifikasi lokal

- `pnpm check` — lulus.
- `pnpm test` — 22 passed, 2 skipped.
- `pnpm build` — lulus; warning chunk Babylon besar tetap ada karena scene 3D, tetapi Explore/Wallet tetap lazy-loaded.
