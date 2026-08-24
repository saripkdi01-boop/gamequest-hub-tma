# Catatan Integrasi Telegram

## Keputusan Arsitektur

GameQuest Hub akan menggunakan Telegram Mini Apps SDK di klien untuk memanggil `ready()`, membaca `initData`, menerapkan variabel tema Telegram, dan menghormati safe area. Identitas pengguna dari browser tidak akan dipercaya secara langsung; `initData` akan dikirim ke server dan diverifikasi dengan HMAC-SHA-256 menggunakan token bot yang hanya tersedia sebagai environment variable server.

Endpoint `POST /api/telegram/webhook` akan memeriksa header `X-Telegram-Bot-Api-Secret-Token` dengan perbandingan waktu-konstan sebelum memproses pembaruan. Untuk perintah `/start`, bot membalas dengan tombol `web_app` yang membuka URL Mini App yang dikonfigurasi server.

## Rujukan Resmi

- Telegram Mini Apps: https://core.telegram.org/bots/webapps
- Telegram Bot API — setWebhook: https://core.telegram.org/bots/api#setwebhook

## Domain Produksi

URL Mini App dan target webhook produksi GameQuest Hub adalah `https://gamequest-hub-tma.vercel.app`.
