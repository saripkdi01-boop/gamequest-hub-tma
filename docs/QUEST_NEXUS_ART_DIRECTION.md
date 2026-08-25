# QUEST//MIND — Quest Nexus Art Direction

## Visual thesis

**Quest Nexus** adalah dunia pulau pengetahuan yang melayang di antara reruntuhan semi-classic dan teknologi portal. Siluet besar dibuat mudah dikenali pada layar Telegram yang sempit: sebuah portal teal di tengah, kristal indigo-violet di perimeter, jalur batu berlapis, dan companion chibi sebagai navigator. Visual tidak bergantung pada tekstur eksternal atau GLB berat sehingga scene tetap cepat dibuka.

## Palette dan hierarchy

| Token | Peran | Nilai |
|---|---|---|
| Void | Ruang latar dan fog | `#09071D` |
| Nexus violet | Portal, scene depth, active UI | `#9A7BFF` |
| Portal teal | Energy, focus, companion orb | `#4CE0C4` |
| Quest gold | Reward, success, completed checkpoint | `#F5B942` |
| Ivory | Face/highlight companion | `#F3EFFF` |
| Ancient blue | Batu, panel, route surface | `#1C2045`–`#3C3E79` |

## Scene composition

Camera berada pada sudut tiga-perempat dengan target di portal utama. Pulau utama memakai tiga lapisan cylinder low-poly untuk memberi kesan melayang; path surface menahan contrast supaya checkpoint terbaca. Tiga gate adalah: beacon signal, glass crossing, dan relic arch. Crystal dan rune menjadi landmark tambahan, bukan hitbox reward.

## Character language

Yuki memakai kepala bulat, hair crest, cape indigo, orb teal, dan mata gelap berukuran besar. Asset React memiliki imperative `play()` untuk state `press`, `success`, `fail`, dan `celebrate`. Reaction hanya bersifat feedback visual; skor, momentum, QC, XP, dan completion tetap diputuskan server.

## Asset manifest

| Asset | Source | Status | Usage |
|---|---|---|---|
| Babylon Quest Nexus scene | `client/src/game/scene.ts` | Implemented | Procedural low-poly scene, no download |
| Yuki companion | `client/src/components/quest-nexus/CompanionCharacter.tsx` | Implemented | React HUD companion, accessible label |
| Quest Nexus CSS | `client/src/components/quest-nexus/theme-3d.css` | Implemented | Glass/keycap/depth/motion tokens |
| Art direction reference | Uploaded CDN asset `https://files.manuscdn.com/user_upload_by_module/session_file/310519663908840755/XkwLhnkHLYZyDlUi.png` | Reference only | Human review/backplate candidate; not in repository |
| Existing route thumbnail | `/manus-storage/genesis-run-visual-target_1612aac3.png` | Existing | Small non-blocking thumbnail in ExploreRoute |

## Performance budget

Scene target: maksimal 60 visible meshes pada handset mid-range, maksimal 18 star-dust meshes, particle/glow intensity dibatasi, dan tidak ada mandatory large texture. `adaptToDeviceRatio` tetap aktif melalui existing wrapper; future refinement dapat mengatur DPR cap berdasarkan `navigator.hardwareConcurrency` atau `prefers-reduced-motion`. Reduced motion mematikan bob, blink, sparkle, dan scanline; WebGL failure harus tetap menyisakan route card dan pilihan checkpoint yang berfungsi.

## Localization and accessibility

Semua label baru di ExploreRoute memakai `t(...)` yang sudah ada: route atlas, checkpoint, dan app name. Companion menyediakan `role="img"`, localized `aria-label`, `aria-live="polite"`, dan sparkle hanya dekoratif. Copy baru tidak ditulis hard-coded di UI. Visual hanya memperkuat feedback; tidak boleh menjadi sumber kebenaran gameplay.

## Next visual iteration

Tambahkan responsive camera framing, optional backplate CDN hanya bila product owner menyetujui, dan visual overlay untuk quiz arena dengan companion reaction yang sama. Jangan menambah GLB, post-processing berat, atau font baru sebelum profiling di Telegram Android WebView.
