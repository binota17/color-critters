# COLOR CRITTERS — Gameplay Rules

## Input baseline
- Left/right: horizontal movement.
- Jump: Space.
- Interact/Ability: E.
- Switch: Tab.
- Select MOSS/ZIPPY: 1/2.
- Reset: R.
- Pause: Esc.

## Critter switching
- Both Critters remain in the level.
- Exactly one is player-controlled at a time.
- Switching changes control and HUD.
- Switching does not reposition Critters.
- Inactive Critters cannot use abilities or receive player input.
- Proposed rule: inactive Critters remain subject to physics.
- Switching is disabled while paused and during level transitions.

## Interaction rules
- Growth Point: explicit E interaction, MOSS only.
- Electric Node: explicit E interaction, ZIPPY only.
- Collectible: overlap trigger.
- Pressure Plate: overlap/weight trigger.
- Exit Gate: trigger once its completion conditions are met.
- Ordinary platforms: physical collision, no interaction prompt.

## Ability validation
An ability must validate:
1. Active Critter is the correct type.
2. Target exists and is within interaction range.
3. Target is compatible.
4. Level state permits the action.

Invalid actions should provide understandable feedback where practical.

## Reset
Reset restores the level to its authored initial state:
- Critter positions and active selection.
- Puzzle object states.
- Spawned vine structures.
- Doors and platforms.
- Collectibles and relevant counters.
- Level timers/move counters as defined by the level.

## Completion
Level completion occurs when authored exit requirements are met. Do not assume every level requires both Critters unless the level data explicitly specifies it.
