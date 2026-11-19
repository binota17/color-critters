# COLOR CRITTERS — Technical Design Document

## Stack
- Phaser 3
- TypeScript
- Vite
- Phaser Arcade Physics
- JSON/TypeScript level data
- LocalStorage for MVP saves
- Static web hosting

## Rendering
- Pixel-art rendering with antialiasing disabled for pixel sprites.
- Maintain an intended canvas aspect ratio and scale responsively.
- Avoid blur and inconsistent sprite scaling.

## Suggested initial game config (placeholder values)
- Canvas: 960 x 540.
- Tile size: 32 pixels.
- Gravity: 800.
- Movement speed: 180.
- Jump velocity: -380.

These are tuning placeholders, not validated gameplay values.

## Scenes
- BootScene
- PreloadScene
- MainMenuScene
- WorldMapScene (may be deferred)
- GameplayScene
- ResultScene (may be deferred)

## Systems
- InputManager
- CritterController
- CritterSwitchSystem
- AbilitySystem
- InteractionSystem
- PuzzleSystem
- LevelSystem
- SaveManager
- AudioManager (may be deferred)

## Data-driven levels
Level configuration should describe spawn points, environment, objects, exit and objectives. Avoid level-specific hardcoded logic in scene files.

## Save
LocalStorage for MVP. Save unlocked levels, per-level results, best time/moves, collectible progress and basic settings. Include a save version. In-progress puzzle state need not be saved initially.

## Reset
Reset the current level state without reloading the whole application. Restore object states, Critter positions, active Critter, puzzle conditions, moving platforms and collectibles.

## Testing
Test movement, jump, switching, ability validation, interaction target selection, puzzle conditions, reset, exit, persistence and browser scaling.
