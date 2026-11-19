# COLOR CRITTERS — Architecture

## Principles
- Scenes coordinate lifecycle and composition.
- Systems implement gameplay logic.
- Entities represent game objects.
- Level data should be separated from runtime logic.
- Use events where useful, not as a universal communication mechanism.
- Avoid premature abstraction.

## Suggested source structure
```text
src/
  main.ts
  game/
    config/
    scenes/
    entities/
      critters/
      objects/
    systems/
    managers/
    ui/
    data/
      levels/
      critters/
    events/
    utils/
  types/
```

## Scene responsibilities
- BootScene: initial setup and transition.
- PreloadScene: load assets.
- MainMenuScene: menu navigation.
- WorldMapScene: level selection and progress (can be deferred).
- GameplayScene: compose level, entities, systems, HUD, events; coordinate gameplay lifecycle.
- ResultScene: show results and navigation (can be deferred).

## Critter model
Use a shared Critter base or equivalent composition approach for movement, active/inactive state, interaction, ability dispatch and reset. Critter-specific abilities should not be hardcoded into GameplayScene.

## System boundaries
- InputManager: read input; no gameplay rules.
- CritterController: movement and jump.
- CritterSwitchSystem: active Critter selection and switching.
- InteractionSystem: identify valid nearby targets and interaction prompts.
- AbilitySystem: dispatch ability behavior.
- PuzzleSystem: conditions and state-driven object reactions.
- LevelSystem: load/complete/reset level lifecycle.
- SaveManager: progress persistence.

## Events (suggested)
- critter-switched
- ability-used
- object-activated
- puzzle-state-changed
- collectible-picked
- level-started
- level-completed
- level-reset
- game-paused
- game-resumed

## Interaction
Prefer proximity detection plus explicit E input for Growth Points and Electric Nodes. Collectibles, pressure plates and exit gates may use automatic triggers. Target selection should be deterministic (e.g., nearest valid target, with a tie-breaking rule).

## Puzzle conditions
Puzzle objects should expose states and conditions. Doors should be configured with required conditions instead of level-specific if/else code.

## Physics
Arcade Physics for MVP. Consider coyote time and jump buffering as optional game-feel improvements after baseline movement works.
