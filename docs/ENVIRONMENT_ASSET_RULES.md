# COLOR CRITTERS — Environment Asset Rules

Technical art standards, naming conventions, and QA rules for all COLOR CRITTERS environment assets.

---

## 1. Tile Dimensions & Technical Standards

- **Base Grid Size:** `32 × 32` pixels (`TILE_SIZE = 32` in `src/game/config/constants.ts`).
- **Coordinates:** Integer pixel coordinates only (`roundPixels: true`).
- **Rendering:** Nearest-neighbor (`pixelArt: true`, `antialias: false`).
- **Format:** 8-bit RGBA PNG, non-interlaced, transparent background where non-solid.
- **Seam Integrity:** Edge-to-edge solid terrain tiles must fill the full `32 × 32` cell without unintended transparent 1 px borders.

---

## 2. Asset Naming & Folder Structure

```text
public/assets/
├── tiles/                  # Solid 32x32 gameplay terrain & platform tiles
│   ├── ground-top-mid.png
│   ├── ground-top-left.png
│   ├── ground-top-right.png
│   ├── ground-dirt.png
│   ├── platform-wood.png
│   ├── platform-branch.png
│   ├── stone-block.png
│   └── vine-tile.png
├── environment/            # L0-L2 backgrounds & L3 non-solid decorations
│   ├── cloud.png
│   ├── bg-hills.png
│   ├── bg-canopy.png
│   ├── decor-grass-tuft.png
│   ├── decor-flower.png
│   ├── decor-mushroom.png
│   ├── decor-rock.png
│   ├── decor-bush.png
│   └── prototype/          # ENV-ART-001 style-lock prototype samples
└── objects/                # Interactive puzzle objects
```

Use `kebab-case` lowercase filenames.

---

## 3. Terrain Rules

- **Grass Top (`ground-top-mid`):**
  - Top `2 px` border of `#3E273B` outline along the solid collision top edge, followed by a `6–9 px` scalloped grass cap (`#AEF338` top-left highlight, `#50DE58` body, `#206247` bottom overhang) casting a `1–2 px` `#914E34` shadow onto the dirt below.
  - Left and right edges tile seamlessly horizontally.
- **Dirt Body (`ground-dirt`):**
  - `#B86B43` base with 3–5 chunky rounded pebbles (`#F0A047`, `#F8B860` top-left highlight, `#914E34` bottom-right shadow) that do not clip awkwardly at tile seams.
- **Left / Right Terrain Edges (`ground-top-left`, `ground-top-right`):**
  - Rounded outer corner (`3–4 px` radius) with `#3E273B` outline along the exposed vertical edge and overhanging grass lip.
- **Inner / Outer Corners & Vertical Transitions:**
  - Inner corners wrap grass around the concave step with `#206247` shadow.
  - Vertical/cliff edges continue the `#3E273B` outline and warm earth bevel down into `ground-dirt`.
- **Stone (`stone-block`):**
  - Rounded 2×2 cobblestone quadrants within `32 × 32`, `#AAB3C4` top-left face, `#667497` shadow bevel, `#3E273B` outline, optional `#50DE58` moss cluster on top-left corner.

---

## 4. Platform Rules

All platforms must align their top collision surface to the `32 × 32` grid top (`y = 0` of the tile) without altering existing Arcade Physics static body geometry.

- **Grass Platforms:** Use `ground-top-left`, `ground-top-mid`, `ground-top-right` with a rounded `#3E273B`-outlined bottom edge.
- **Wooden Platforms:** Horizontal plank (`14–18 px` visual thickness aligned to top of `32 × 32` cell) with `#F8B860` top highlight, `#F0A047` midtone, `#914E34` underside, `#AAB3C4` corner rivets, and `#3E273B` outline.
- **Stone Platforms:** Sleek beveled slate slab (`#AAB3C4` / `#667497`) with rounded corners and `#3E273B` outline.
- **Branch Platforms:** Organic curved timber (`#F0A047` / `#914E34`) with `#50DE58` / `#AEF338` leaf clusters sprouting from the ends (leaf clusters must not obscure the flat top landing edge).
- **Floating Platforms:** Rounded bottom underside with subtle `#3E273B` outline so floating edges never look cut off.

---

## 5. Decoration Rules

- **Families:** Grass tufts (`16 × 16`), flowers (`16 × 16`), mushrooms (`16 × 16`–`24 × 24`), mossy rocks (`24 × 16`–`32 × 24`), bushes (`32 × 24`), tree trunks & canopies (background/canopy), hanging vines (`16 × 32`–`32 × 32`).
- **Outline & Scale:** Use `#3E273B` outline on L3 foreground props; keep props compact so they never exceed MOSS/ZIPPY's visual weight on walkable surfaces.
- **Placement Rules:**
  - Never place foreground props over `GrowthPoint`, `ElectricNode`, `PressurePlate`, `ElectricDoor`, or `ExitGate`.
  - Keep walkable platform centers clear or use low-profile `16 × 16` tufts/flowers so character feet remain visible.
  - Hanging vines belong strictly beneath platform undersides, never blocking jump arcs visually.

---

## 6. Background Rules

- **L0 (Sky & Clouds):** Bright, clean sky; clouds have soft flat bottoms and puffy rounded tops, zero outlines.
- **L1 (Distant Hills):** Smooth, low-contrast silhouettes in `#63D4E2` / `#7AE2DA`. Never use `#3E273B` or high-contrast greens.
- **L2 (Midground Vegetation):** Simplified rounded trees and bushes in `#45B69C` / `#34947A` / `#25654B`. Keep top edges below HUD zone or soft enough that HUD text remains 100% legible.
- **No Misleading Cues:** Background ledges/trees must never resemble solid L3 platforms.

---

## 7. Pixel-Art & Seam QA Rules

Every environment asset must pass before integration:
1. **Exact Palette Check:** Every non-transparent pixel must match `docs/ENVIRONMENT_PALETTE.md`.
2. **Zero Anti-Aliasing:** Alpha channel must be strictly `0` or `255` on L3 tiles/props.
3. **Seam Check:** Tileable assets (`ground-top-mid`, `ground-dirt`, `platform-wood`) must be tested in `2 × 2` and `3 × 1` tiled grids with zero visible seams or jitter.
4. **Native-Scale Inspection:** Inspect in-game at `960 × 540` alongside MOSS, ZIPPY, interactive objects, and HUD.

