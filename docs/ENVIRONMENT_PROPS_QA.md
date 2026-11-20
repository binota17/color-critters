# COLOR CRITTERS — Environment Props QA Report (ENV-ART-003)

## 1. Automated Validation Methods

All 4 batch spritesheets were validated via `build_env_props.py`:
- **Dimension & Grid Check:** Exact multiples of cell dimensions (`240×32`, `128×32`, `192×32`, `128×32`).
- **Non-Empty & Clipping Check:** Every frame has a non-empty bounding box (`getbbox() is not None`).
- **Ground Anchor Check:** Every prop's bottommost pixel aligns cleanly to `y = 31` (`bbox[3] == 32`), ensuring `origin(0.5, 1.0)` places all props flush on any terrain or platform top surface.
- **Palette Compliance:** Every pixel verified against `docs/ENVIRONMENT_PALETTE.md` (zero unlisted colors).
- **Alpha & Anti-Aliasing Check:** Strictly binary alpha `{0, 255}` across all 17 props.

| Batch File | Props | Cell Size | Exact Colors | Alpha Values | Status |
|---|---|---|---|---|---|
| `props-foliage.png` | 5 | `48 × 32` | 7 | `{0, 255}` | PASS |
| `props-mushrooms.png` | 4 | `32 × 32` | 9 | `{0, 255}` | PASS |
| `props-rocks.png` | 4 | `48 × 32` | 7 | `{0, 255}` | PASS |
| `props-flowers.png` | 4 | `32 × 32` | 10 | `{0, 255}` | PASS |

---

## 2. Batch Visual QA

Each batch was inspected via 4× nearest-neighbor contact sheets:
- **Batch 1 (Foliage):** Distinct silhouettes across `grass-tuft-sm`, `grass-tuft-md`, `grass-tuft-lg`, `bush-sm`, and `bush-lg`; removed initial ellipse pole artifacts for smooth rounded bush silhouettes.
- **Batch 2 (Mushrooms):** Clear readability at native scale; whimsical pink/cream and warm amber-gold caps clearly distinct from interactive objects.
- **Batch 3 (Rocks):** Organic rounded boulders and draped moss distinct from `2 × 2` cobblestone `core-terrain-sheet` blocks.
- **Batch 4 (Flowers):** Sparse whimsical accents (`#FB779F`, `#FEDE71`, `#43DEFC`, `#FBEFD5`) that complement terrain without competing with MOSS or ZIPPY.

---

## 3. Native-Scale & Placement QA (`960 × 540`)

Validated in `PropsPlacementScene` (`?scene=PropsPlacementScene`) at native `960 × 540` resolution:
- Props sit flush on `core-terrain-sheet` grass tops and `platform-tiles` wooden planks using `setOrigin(0.5, 1.0)`.
- **MOSS** and **ZIPPY** remain the highest-contrast foreground elements and are never obscured by props.
- Interactive objects (`GrowthPoint`, `PressurePlate`, `ElectricNode`) remain clearly distinguishable from all props.
- `GameplayHud` top/bottom bars remain 100% legible.

---

## 4. Known Issues / Notes

- `bush-sm` (`48 × 32`) and `bush-lg` (`48 × 32`) have substantial visual footprints and should be placed on background-adjacent ground edges or between puzzle zones rather than directly over active puzzle triggers.

