# Game Structure

```text
React routes/pages
  ├─ Home: dashboard dan CTA Explore Route
  ├─ GuideRoster: koleksi sepuluh guide, detail, dan pilihan presentasi lokal
  ├─ ExploreRoute: autentikasi Telegram + API game + shell HUD
  └─ QuestRun/Result: pilihan checkpoint dan outcome server-side

client/src/components/GameCanvas.tsx
  └─ lifecycle Babylon Engine + canvas resize/dispose + renderer WebGL kompatibel

client/src/game/
  ├─ guides.ts: metadata, peran, warna, dan protocol sepuluh guide
  ├─ scene.ts: createGameScene(engine, canvas)
  ├─ GameWorld.ts: ownership gate, player marker, collectibles, cleanup
  ├─ RouteInput.ts: semantic tap action pada gate
  └─ types.ts: state dari server yang aman untuk dirender

server/game/
  └─ tetap menjadi sumber kebenaran checkpoint, reward, dan leaderboard
```

React hanya mengelola route, loading/error, dan request server. Babylon mengelola visual scene dan input eksplorasi. Game state berasal dari API yang sudah memvalidasi identitas Telegram; scene tidak menghitung reward atau menyimpan progres ekonomi.

Seleksi guide berada di batas presentasi klien dan hanya dapat memperbarui identitas HUD, fallback SVG, serta material companion Babylon. Server tetap menjadi sumber tunggal untuk reward, inventory, entitlement, anti-cheat, dan pembayaran.
