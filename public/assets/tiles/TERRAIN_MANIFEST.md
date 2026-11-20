# Core Terrain Tileset Manifest (ENV-ART-002)

Production core terrain tileset for COLOR CRITTERS, built to `docs/ENVIRONMENT_ART_DIRECTION.md`, `docs/ENVIRONMENT_PALETTE.md`, and `docs/ENVIRONMENT_ASSET_RULES.md`.

## Spritesheet

| File | Texture Key | Dimensions | Grid | Tile Size | Tile Count |
|---|---|---|---|---|---|
| `public/assets/tiles/core-terrain-sheet.png` | `core-terrain-sheet` | `256 × 160` px | `8 cols × 5 rows` | `32 × 32` px | 40 |

## Tile Identifiers & Usage

| Frame | Tile ID | Row/Col | Category | Usage & Transitions |
|---|---|---|---|---|
| `0` | `grass-top-left` | `(0, 0)` | Grass | Outer top-left corner; connects right to `1`/`3`/`2` and down to `11` |
| `1` | `grass-top-mid` | `(0, 1)` | Grass | Repeatable horizontal grass top; connects down to `8`/`9`/`10` |
| `2` | `grass-top-right` | `(0, 2)` | Grass | Outer top-right corner; connects left to `0`/`1`/`3` and down to `15` |
| `3` | `grass-top-mid-alt` | `(0, 3)` | Grass | Subtle sprout-tuft variation of `1` to break horizontal repetition |
| `4` | `grass-island-single` | `(0, 4)` | Grass | 1-tile wide grass cap above a vertical column (`21`) |
| `5` | `grass-plat-left` | `(0, 5)` | Grass Platform | 1-tile tall floating grass platform left end |
| `6` | `grass-plat-mid` | `(0, 6)` | Grass Platform | 1-tile tall floating grass platform repeatable middle |
| `7` | `grass-plat-right` | `(0, 7)` | Grass Platform | 1-tile tall floating grass platform right end |
| `8` | `dirt-mid` | `(1, 0)` | Dirt | Seamless 3×3 repeatable dirt body |
| `9` | `dirt-mid-alt1` | `(1, 1)` | Dirt | Seamless dirt body variation A |
| `10` | `dirt-mid-alt2` | `(1, 2)` | Dirt | Seamless dirt body variation B |
| `11` | `dirt-left` | `(1, 3)` | Dirt Edge | Left vertical dirt wall; connects above to `0` and below to `12` |
| `12` | `dirt-bot-left` | `(1, 4)` | Dirt Corner | Outer bottom-left corner |
| `13` | `dirt-bot-mid` | `(1, 5)` | Dirt Edge | Repeatable bottom dirt edge |
| `14` | `dirt-bot-right` | `(1, 6)` | Dirt Corner | Outer bottom-right corner |
| `15` | `dirt-right` | `(1, 7)` | Dirt Edge | Right vertical dirt wall; connects above to `2` and below to `14` |
| `16` | `terrain-step-up-left` | `(2, 0)` | Transition | Concave step-up base (grass from left meets raised dirt wall on right) |
| `17` | `terrain-step-up-right` | `(2, 1)` | Transition | Concave step-down base (raised dirt wall on left meets grass on right) |
| `18` | `terrain-inner-bl` | `(2, 2)` | Transition | Concave bottom-left dirt transition |
| `19` | `terrain-inner-br` | `(2, 3)` | Transition | Concave bottom-right dirt transition |
| `20` | `dirt-pillar-top` | `(2, 4)` | Pillar | 1-tile wide grass top cap for vertical columns |
| `21` | `dirt-pillar-mid` | `(2, 5)` | Pillar | 1-tile wide vertical dirt column |
| `22` | `dirt-pillar-bot` | `(2, 6)` | Pillar | 1-tile wide rounded bottom column cap |
| `23` | `grass-block-single` | `(2, 7)` | Grass | Isolated `1 × 1` floating grass-dirt block |
| `24` | `stone-top-left` | `(3, 0)` | Stone | Outer top-left stone corner (with moss accent) |
| `25` | `stone-top-mid` | `(3, 1)` | Stone | Repeatable stone top edge |
| `26` | `stone-top-right` | `(3, 2)` | Stone | Outer top-right stone corner |
| `27` | `stone-left` | `(3, 3)` | Stone | Left vertical stone edge |
| `28` | `stone-mid` | `(3, 4)` | Stone | Seamless 3×3 cobblestone body |
| `29` | `stone-right` | `(3, 5)` | Stone | Right vertical stone edge |
| `30` | `stone-bot-left` | `(3, 6)` | Stone | Outer bottom-left stone corner |
| `31` | `stone-bot-mid` | `(3, 7)` | Stone | Repeatable stone bottom edge |
| `32` | `stone-bot-right` | `(4, 0)` | Stone | Outer bottom-right stone corner |
| `33` | `stone-mid-moss` | `(4, 1)` | Stone | Stone body variation with moss accent |
| `34` | `stone-mid-cracked` | `(4, 2)` | Stone | Stone body variation with subtle crack |
| `35` | `stone-block-single` | `(4, 3)` | Stone | Isolated `1 × 1` stone block |
| `36` | `stone-plat-left` | `(4, 4)` | Stone Platform | 1-tile tall stone platform left end |
| `37` | `stone-plat-mid` | `(4, 5)` | Stone Platform | 1-tile tall stone platform repeatable middle |
| `38` | `stone-plat-right` | `(4, 6)` | Stone Platform | 1-tile tall stone platform right end |
| `39` | `grass-on-stone-mid` | `(4, 7)` | Transition | Grass cap transitioning directly onto stone body (`28`) |

