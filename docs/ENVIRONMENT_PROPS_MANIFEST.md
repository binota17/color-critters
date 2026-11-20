# COLOR CRITTERS — Environment Props Manifest (ENV-ART-003)

Production decoration prop library for COLOR CRITTERS, conforming to `docs/ENVIRONMENT_ART_DIRECTION.md`, `docs/ENVIRONMENT_PALETTE.md`, and `docs/ENVIRONMENT_ASSET_RULES.md`.

## 1. Spritesheet Overview

| Spritesheet | Category | Dimensions | Grid | Cell Size | Prop Count | Anchor |
|---|---|---|---|---|---|---|
| `public/assets/environment/props/props-foliage.png` | Grass & Foliage | `240 × 32` px | `5 × 1` | `48 × 32` px | 5 | Bottom-center `(0.5, 1.0)` at `y = 31` |
| `public/assets/environment/props/props-mushrooms.png` | Mushrooms | `128 × 32` px | `4 × 1` | `32 × 32` px | 4 | Bottom-center `(0.5, 1.0)` at `y = 31` |
| `public/assets/environment/props/props-rocks.png` | Rocks | `192 × 32` px | `4 × 1` | `48 × 32` px | 4 | Bottom-center `(0.5, 1.0)` at `y = 31` |
| `public/assets/environment/props/props-flowers.png` | Flowers | `128 × 32` px | `4 × 1` | `32 × 32` px | 4 | Bottom-center `(0.5, 1.0)` at `y = 31` |

- **Padding:** `0` px between cells.
- **Palette:** Strictly uses `docs/ENVIRONMENT_PALETTE.md` (zero new colors added).
- **Alpha:** Binary `{0, 255}` (no anti-aliasing).

---

## 2. Prop Catalog

### A. Grass & Foliage (`props-foliage.png`, `48 × 32` cells)

| Frame | Asset ID | Dimensions | Anchor | Intended Usage |
|---|---|---|---|---|
| `0` | `grass-tuft-sm` | `48 × 32` | `(0.5, 1.0)` | Subtle 3-blade grass accent on walkable ground or platforms |
| `1` | `grass-tuft-md` | `48 × 32` | `(0.5, 1.0)` | Medium 4-blade grass tuft for open ground spans |
| `2` | `grass-tuft-lg` | `48 × 32` | `(0.5, 1.0)` | Lush multi-cluster grass near terrain edges or rocks |
| `3` | `bush-sm` | `48 × 32` | `(0.5, 1.0)` | Compact rounded bush for ground framing (avoid blocking interactables) |
| `4` | `bush-lg` | `48 × 32` | `(0.5, 1.0)` | Wide double-humped bush with gold blossom accents for wide ground spans |

### B. Mushrooms (`props-mushrooms.png`, `32 × 32` cells)

| Frame | Asset ID | Dimensions | Anchor | Intended Usage |
|---|---|---|---|---|
| `0` | `mushroom-sm` | `32 × 32` | `(0.5, 1.0)` | Small pink whimsical mushroom for corners & platforms |
| `1` | `mushroom-md` | `32 × 32` | `(0.5, 1.0)` | Medium spotted pink mushroom for forest/canopy ground |
| `2` | `mushroom-lg` | `32 × 32` | `(0.5, 1.0)` | Warm amber-gold mushroom for visual variety near rocks/bushes |
| `3` | `mushroom-cluster` | `32 × 32` | `(0.5, 1.0)` | 3-cap pink/cream cluster for focal decoration spots |

### C. Rocks (`props-rocks.png`, `48 × 32` cells)

| Frame | Asset ID | Dimensions | Anchor | Intended Usage |
|---|---|---|---|---|
| `0` | `rock-sm` | `48 × 32` | `(0.5, 1.0)` | Small rounded slate pebble for platforms or ground edges |
| `1` | `rock-md` | `48 × 32` | `(0.5, 1.0)` | Medium chiseled boulder for terrain framing |
| `2` | `rock-cluster` | `48 × 32` | `(0.5, 1.0)` | Two-stone organic cluster (distinct from `stone-block` terrain) |
| `3` | `rock-mossy` | `48 × 32` | `(0.5, 1.0)` | Moss-draped boulder with tiny sprout accent |

### D. Flowers (`props-flowers.png`, `32 × 32` cells)

| Frame | Asset ID | Dimensions | Anchor | Intended Usage |
|---|---|---|---|---|
| `0` | `flower-daisy` | `32 × 32` | `(0.5, 1.0)` | Cream-and-gold single flower |
| `1` | `flower-rose` | `32 × 32` | `(0.5, 1.0)` | Whimsical pink blossom |
| `2` | `flower-twin-cyan` | `32 × 32` | `(0.5, 1.0)` | Twin sky-cyan bellflowers |
| `3` | `flower-cluster` | `32 × 32` | `(0.5, 1.0)` | Mixed cream/pink/gold flower pair |

