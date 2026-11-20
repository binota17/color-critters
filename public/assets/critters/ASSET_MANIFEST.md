# Critter Asset Manifest (CC-ART-001)

Production pixel-art spritesheets for **MOSS** and **ZIPPY**, following the **Chunky & Charming** art direction.

## Spritesheets

| Asset Filename | Character | Texture Key | Dimensions | Layout | Frame Size | Frame Count |
|---|---|---|---|---|---|---|
| `public/assets/critters/moss-sheet.png` | MOSS (`moss`) | `moss-sheet` | `384 × 32` px | Horizontal strip (12 × 1) | `32 × 32` px | 12 |
| `public/assets/critters/zippy-sheet.png` | ZIPPY (`zippy`) | `zippy-sheet` | `384 × 32` px | Horizontal strip (12 × 1) | `32 × 32` px | 12 |

## Animation Specifications

Both characters share the exact same frame layout and timing:

| Animation Key | Character | Animation Name | Frame Range | Frame Count | FPS | Frame Duration | Repeat |
|---|---|---|---|---|---|---|---|
| `moss-idle` / `zippy-idle` | MOSS, ZIPPY | Idle | `0..3` | 4 | 4 | 250 ms | `-1` (loop) |
| `moss-run` / `zippy-run` | MOSS, ZIPPY | Run | `4..7` | 4 | 10 | 100 ms | `-1` (loop) |
| `moss-jump` / `zippy-jump` | MOSS, ZIPPY | Jump | `8..9` | 2 | 8 | 125 ms | `0` (play once) |
| `moss-fall` / `zippy-fall` | MOSS, ZIPPY | Fall | `10..11` | 2 | 6 | 167 ms | `-1` (loop) |

## Anchor & Hitbox Alignment

- **Sprite Origin:** `(0.5, 0.5)` (Phaser default centered on `32 × 32` cell)
- **Default Facing:** Right (`setFlipX(true)` when facing left)
- **Ground Baseline:** Row `y = 29` (2 px above cell bottom `y = 31`), matching the Arcade Physics body (`size: 22 × 22`, `offset: (5, 8)`, bottom at `y = 30`).
- **Rendering:** Nearest-neighbor (`pixelArt: true`, `antialias: false`, `roundPixels: true`), transparent RGBA background, zero anti-aliasing.

