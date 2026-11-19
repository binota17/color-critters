# COLOR CRITTERS — Game Design Document

## Genre and platform
- Genre: 2D puzzle platformer.
- Platform: web browser.
- View: side-view, room-based.
- Player count: single-player.
- Art direction: bright pixel art.
- MVP focus: puzzle solving, not combat.

## Core gameplay loop
1. Enter a level and observe its puzzle.
2. Plan how to use the Critters and environment.
3. Move, jump, switch Critters and use abilities.
4. Activate mechanisms and solve the puzzle.
5. Bring the required Critters to the Exit Gate.
6. Receive a result and optional replay goals.

## Critters

### MOSS — Growth
Proposed ability: Grow Vine.
- Activates compatible Growth Points.
- Creates predefined vine structures such as bridges or platforms.
- Growth is limited to level-authored Growth Points, not arbitrary freeform terrain generation.

### ZIPPY — Electricity
Proposed ability: Electric Pulse.
- Activates compatible Electric Nodes.
- Nodes may power doors or platforms.
- Electricity follows authored puzzle connections; it is not assumed to propagate through arbitrary objects.

### Future Critters (not MVP)
- EMBER: heat/fire interactions.
- BUBBLE: water/flow interactions.

## Switching
- Both Critters exist in the level.
- One Critter is player-controlled at a time.
- Inactive Critters remain at their positions and are not controlled.
- Proposed baseline: inactive Critters continue to be affected by physics.
- Switching does not teleport characters.
- No switching while paused or during transitions.

## Controls (proposed)
- A / Left Arrow: move left.
- D / Right Arrow: move right.
- Space: jump.
- E: interact/use ability.
- Tab: switch Critter.
- 1 / 2: select MOSS / ZIPPY.
- R: reset level.
- Esc: pause.

## Objects (MVP candidates)
- Ground/platforms.
- Pressure Plate.
- Growth Point.
- Vine Platform.
- Electric Node.
- Electric Door.
- Moving Platform (optional for early MVP).
- Collectible (optional).
- Exit Gate.

## Puzzle design principles
- Introduce mechanics before combining them.
- Avoid pixel-perfect platforming as a puzzle requirement.
- Reset should be fast.
- Avoid excessive punishment.
- Make puzzle cause/effect legible.
- Optional objectives can add replay value.

## Progression
- Level-based progression.
- World-map presentation is planned.
- Levels may receive up to three stars:
  - 1 star: complete the level.
  - 2 stars: completion plus a level-specific move target.
  - 3 stars: completion, move target, and collectibles.
- Move targets must be authored per level, not globally fixed.
- Cosmetic rewards may be explored later; no power upgrades in MVP.

## MVP scope
- Two Critters.
- One initial world.
- First prototype: one puzzle room.
- Target expansion: approximately 10 levels.
- No backend, multiplayer, combat or procedural generation.
