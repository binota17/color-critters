# Objects & Environment Extras Manifest (OBJ-ART-001)

Production pixel-art puzzle objects, Twin Resonance components, puzzle conduits, and L2 backdrop assets conforming to `docs/ENVIRONMENT_PALETTE.md` and `docs/ENVIRONMENT_ASSET_RULES.md`.

## Puzzle Objects

| Asset Filename | Texture Key | Dimensions | Layout | Frames / States |
|---|---|---|---|---|
| `public/assets/objects/growth-point.png` | `growth-point` | `64 × 32` px | `2 × 1` (`32 × 32`) | `0`: Dormant sprout pot; `1`: Bloomed vine crown |
| `public/assets/objects/electric-node.png` | `electric-node` | `64 × 32` px | `2 × 1` (`32 × 32`) | `0`: Unpowered coil; `1`: Energized gold/cyan coil |
| `public/assets/objects/electric-door.png` | `electric-door` | `32 × 32` px | Single tile | Vertical energy barrier segment |
| `public/assets/objects/pressure-plate.png` | `pressure-plate` | `64 × 32` px | `2 × 1` (`32 × 32`) | `0`: Unpressed coral pad; `1`: Pressed emerald pad |
| `public/assets/objects/exit-gate.png` | `exit-gate` | `64 × 48` px | `2 × 1` (`32 × 48`) | `0`: Locked stone arch; `1`: Open cyan portal |
| `public/assets/objects/resonance-root.png` | `resonance-root` | `64 × 32` px | `2 × 1` (`32 × 32`) | `0`: Dormant root cradle; `1`: Connected glowing seed |
| `public/assets/objects/resonance-relay.png` | `resonance-relay` | `64 × 32` px | `2 × 1` (`32 × 32`) | `0`: Unpowered tuning totem; `1`: Powered resonant crystal |
| `public/assets/objects/resonance-vine.png` | `resonance-vine` | `64 × 16` px | `2 × 1` (`32 × 16`) | `0`: Biological vine strand; `1`: Charged golden-cyan strand |
| `public/assets/objects/resonance-orb.png` | `resonance-orb` | `16 × 16` px | Single sprite | Energy packet transmitted from Root to Relay |
| `public/assets/objects/resonance-aura.png` | `resonance-aura` | `96 × 48` px | `2 × 1` (`48 × 48`) | `0`: Emerald root aura; `1`: Gold-cyan relay aura |
| `public/assets/objects/conduit-wire.png` | `conduit-wire` | `48 × 16` px | `3 × 1` (`16 × 16`) | `0`: Inactive conduit; `1`: Plate-active green; `2`: Node-active gold |

## Additional L2 Environment Assets

| Asset Filename | Texture Key | Dimensions | Layer | Notes |
|---|---|---|---|---|
| `public/assets/environment/bg-canopy-tree.png` | `bg-canopy-tree` | `128 × 256` px | L2 | Outline-free canopy tree silhouette for Level 2 |
| `public/assets/environment/bg-grove-tree.png` | `bg-grove-tree` | `128 × 256` px | L2 | Outline-free deep grove tree silhouette for Level 3 |
| `public/assets/environment/bg-sunbeam.png` | `bg-sunbeam` | `128 × 320` px | L2 | Stepped pixel-art sunbeam shaft for Level 3 |
