# COLOR CRITTERS — Environment Art Direction

## 1. Overall Style

**Chunky Nature + a touch of Whimsical World**

The environment visual language pairs rounded, readable, tactile natural forms with bright, friendly, fairytale-like accents. It is designed to harmonize directly with the approved **Chunky & Charming** character art style of **MOSS** and **ZIPPY**.

### Core Style Rules
- Crisp, unfiltered pixel art (`pixelArt: true`, `antialias: false`, `roundPixels: true`).
- Strong, readable silhouettes with rounded and chunky proportions.
- Intentional pixel clusters (no single-pixel noise or dithering speckle).
- Limited, cohesive color palette with zero smooth gradients or anti-aliasing.
- Consistent dark warm outline (`#3E273B`) on all interactive/gameplay-layer terrain, platforms, and foreground decorations.
- Top-left primary directional lighting.

---

## 2. Visual Pillars

1. **Tactile & Chunky:** Terrain blocks, stone slabs, wooden planks, and foliage are built from bold, rounded 2–4 px pixel clusters so they read effortlessly at native `960 × 540` gameplay resolution.
2. **Playful & Welcoming:** Warm earth tones, lush lime-to-emerald greens, and whimsical pastel accents (pink mushrooms, cream flowers, cyan sparkles) create an inviting puzzle-platformer world.
3. **Gameplay-First Clarity:** Background layers are intentionally low-contrast and outline-free so MOSS, ZIPPY, interactive puzzle objects, and solid collision surfaces always pop.

---

## 3. Shape Language

- **Terrain & Earth:** Rounded rectangular blocks (`32 × 32` grid) with overhanging, scalloped grass caps and chunky rounded soil pebbles inside the dirt body.
- **Stone:** Beveled, pillowy 2×2 or irregular cobblestone clusters with cool slate shadows and mossy top-left accents.
- **Wood & Branches:** Thick, slightly rounded horizontal planks with end-grain/rivet details; organic branches with curved knots and sprouting leaf clusters.
- **Foliage & Props:** Compact, bulbous canopies, rounded bushes, chunky 3-blade grass tufts, and capped mushrooms with soft rounded silhouettes.

---

## 4. Lighting & Material Rules

- **Primary Light Source:** Top-left (approx. 45°).
- **Highlights:** Placed strictly on top and left-facing surfaces (e.g., `#AEF338` on grass tops, `#F8B860` on upper-left dirt pebbles and wood edges, `#AAB3C4` on upper-left stone faces).
- **Shadows:** Placed on bottom and right-facing edges (e.g., `#206247` under grass overhangs, `#914E34` on lower-right earth/wood, `#667497` on lower-right stone bevels).
- **Material Differentiation:**
  - *Grass:* Crisp bright overhang (`#AEF338` → `#50DE58` → `#206247`) casting a 1–2 px drop shadow onto the dirt below.
  - *Dirt:* Warm matte earth (`#B86B43` base with `#F0A047`/`#F8B860` rounded pebbles and `#914E34` crevices).
  - *Wood:* Warm amber-brown planks (`#F0A047` mid, `#F8B860` top bevel, `#914E34` underside/grain).
  - *Stone:* Cool slate-gray (`#AAB3C4` face, `#667497` bevel/shadow) so stone contrasts clearly against warm dirt and green grass.

---

## 5. Gameplay Visual Hierarchy

Assets are strictly ordered from highest contrast/saturation (foreground gameplay) to lowest contrast (distant background):

1. **Priority 1 — Player Characters (MOSS & ZIPPY):** Highest saturation, crisp dark outlines, active UI indicator.
2. **Priority 2 — Interactive Puzzle Objects:** GrowthPoints, ElectricNodes, PressurePlates, ElectricDoors, ExitGate — high-contrast silhouettes and emissive/accent cues.
3. **Priority 3 — Solid Gameplay Terrain & Platforms:** Full `#3E273B` dark outline, full value range, clear top-edge landing readability.
4. **Priority 4 — Environmental Decoration:** Grass tufts, flowers, mushrooms, rocks, bushes — grounded on terrain without obscuring hitboxes or characters.
5. **Priority 5 — Background Layers (L0–L2):** Reduced contrast, cooler/shifted hues, **no dark outlines**.

---

## 6. Background Depth System

| Layer | Name | Depth Role | Visual Treatment |
|---|---|---|---|
| **L0** | Sky & Clouds | Atmospheric backdrop | Bright sky (`#87CEEB` / `#62DDFE`–`#9AEBFE`), puffy white/ice-blue pixel clouds (`#FFFFFF` / `#D8F4FE`), no outlines. |
| **L1** | Distant Hills / Mountains | Far horizon silhouette | Soft desaturated cyan-teal (`#63D4E2` / `#7AE2DA`), low contrast against sky, zero outlines, slow parallax (`0.1×`–`0.2×`). |
| **L2** | Midground Vegetation | Canopy & distant trees | Muted blue-green silhouettes (`#45B69C` / `#34947A` / `#25654B`), simplified rounded tree/bush shapes, no heavy outlines, medium parallax (`0.35×`–`0.5×`). |
| **L3** | Gameplay Environment | Solid terrain, platforms, decor | Full-contrast palette, `#3E273B` outlines, `1.0×` camera lock. |

---

## 7. Primary Style Reference

All environment art decisions trace back to the approved **Environment Style Sheet** (`ENV-ART-001` concept reference), validated alongside **MOSS** and **ZIPPY** (`CC-ART-001`).

