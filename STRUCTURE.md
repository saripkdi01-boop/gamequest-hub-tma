# Game Structure

```text
React routes/pages
  ├─ Home: dashboard dan CTA Explore Route
  ├─ ExploreRoute: autentikasi Telegram + API game + shell HUD
  └─ QuestRun/Result: pilihan checkpoint dan outcome server-side

client/src/components/GameCanvas.tsx
  └─ lifecycle Babylon Engine + canvas resize/dispose + renderer WebGL kompatibel

client/src/game/
  ├─ scene.ts: createGameScene(engine, canvas)
  ├─ GameWorld.ts: ownership gate, player marker, collectibles, cleanup
  ├─ RouteInput.ts: semantic tap action pada gate
  └─ types.ts: state dari server yang aman untuk dirender

server/game/
  └─ tetap menjadi sumber kebenaran checkpoint, reward, dan leaderboard
```

React hanya mengelola route, loading/error, dan request server. Babylon mengelola visual scene dan input eksplorasi. Game state berasal dari API yang sudah memvalidasi identitas Telegram; scene tidak menghitung reward atau menyimpan progres ekonomi.
