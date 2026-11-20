# COLOR CRITTERS — Environment Palette

Official limited pixel-art palette for all environment terrain, platforms, decorations, and background layers. Derived directly from the approved **ENV-ART-001** Environment Style Sheet.

## 1. Universal Outline

| Role | HEX | RGB | Usage |
|---|---|---|---|
| **Outline Dark** | `#3E273B` | `(62, 39, 59)` | Primary outline for all L3 gameplay terrain, platforms, stone, and foreground props. Never use pure `#000000`. |

---

## 2. Grass & Foliage

| Role | HEX | RGB | Usage |
|---|---|---|---|
| **Grass Highlight** | `#AEF338` | `(174, 243, 56)` | Top-left sunlit grass cap, leaf tips, sprout highlights. |
| **Grass Mid** | `#50DE58` | `(80, 222, 88)` | Primary grass overhang body, bushes, vine leaves. |
| **Grass Meadow** | `#89D223` | `(137, 210, 35)` | Secondary foliage cluster, grass transitions, mid-highlight. |
| **Grass Shadow** | `#206247` | `(32, 98, 71)` | Underside of grass overhang, deep foliage crevices. |

---

## 3. Earth, Dirt & Wood

| Role | HEX | RGB | Usage |
|---|---|---|---|
| **Earth / Wood Highlight** | `#F8B860` | `(248, 184, 96)` | Top-left bevel of wooden planks, sunlit pebble highlights, branch top edge. |
| **Earth / Wood Mid** | `#F0A047` | `(240, 160, 71)` | Primary wooden plank body, warm dirt pebbles, tree bark midtone. |
| **Earth Body Base** | `#B86B43` | `(184, 107, 67)` | Main dirt block fill behind rounded pebbles; warm soil base. |
| **Earth / Wood Shadow** | `#914E34` | `(145, 78, 52)` | Dirt crevices, cast shadow beneath grass overhang, wood underside & bark shadow. |

---

## 4. Stone

| Role | HEX | RGB | Usage |
|---|---|---|---|
| **Stone Highlight / Face** | `#AAB3C4` | `(170, 179, 196)` | Top-left lit face of stone blocks, mossy rocks, metal rivets on wood platforms. |
| **Stone Shadow** | `#667497` | `(102, 116, 151)` | Bottom-right stone bevel, mortar/seam crevices, cool rock shadow. |

---

## 5. Whimsical Accents

| Role | HEX | RGB | Usage |
|---|---|---|---|
| **Accent Gold** | `#FEDE71` | `(254, 222, 113)` | Flower centers, sunlit sparkle accents. |
| **Accent Cyan** | `#43DEFC` | `(67, 222, 252)` | Water/waterfall highlights, electric/crystal accents. |
| **Accent Pink** | `#FB779F` | `(251, 119, 159)` | Mushroom caps, decorative blossoms. |
| **Accent Pink Light** | `#FEB1C3` | `(254, 177, 195)` | Top-left mushroom cap highlight, soft petal shading. |
| **Accent Cream** | `#FBEFD5` | `(251, 239, 213)` | Mushroom stems, spots, white flower petals. |

---

## 6. Background Layers (L0–L2 — Reduced Contrast)

| Layer | Role | HEX | RGB | Usage |
|---|---|---|---|---|
| **L0** | Sky Base | `#87CEEB` | `(135, 206, 235)` | Primary game sky (`COLORS.SKY`) / mid sky tone. |
| **L0** | Sky Upper / Lower | `#62DDFE` / `#9AEBFE` | `(98, 221, 254)` / `(154, 235, 254)` | Optional stepped sky bands (no smooth gradients). |
| **L0** | Cloud White / Shadow | `#FFFFFF` / `#D8F4FE` | `(255, 255, 255)` / `(216, 244, 254)` | Puffy pixel clouds. |
| **L1** | Distant Hills | `#63D4E2` | `(99, 212, 226)` | Far mountain/hill silhouettes (no outline). |
| **L1** | Distant Hills Highlight | `#7AE2DA` | `(122, 226, 218)` | Soft upper-ridge separation on distant hills. |
| **L2** | Midground Canopy Light | `#45B69C` | `(69, 182, 156)` | Midground tree crowns & rolling bushes. |
| **L2** | Midground Canopy Mid | `#34947A` | `(52, 148, 122)` | Midground foliage depth & trunks. |
| **L2** | Midground Canopy Deep | `#25654B` | `(37, 101, 75)` | Deepest L2 canopy accents (keep low-opacity/soft when near L3). |

---

## 7. Usage Guidelines

1. **No Unlisted Colors:** Do not introduce ad-hoc colors or intermediate anti-aliased shades.
2. **Character Separation:** MOSS (`#22D34E` / `#91FA78`) and ZIPPY (`#FFDE24` / `#22D3EE`) remain brighter and higher-contrast than L1/L2 backgrounds and Earth/Stone terrain.
3. **Depth Desaturation:** Never use `#3E273B` outlines or `#AEF338` highlights on L0–L2 background elements.

