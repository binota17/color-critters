# COLOR CRITTERS — Level Design Guidelines

## Level teaching sequence (proposed)
1. Basic movement.
2. Jumping.
3. Switching.
4. Introduce MOSS.
5. Growth Point.
6. Vine traversal.
7. Introduce ZIPPY.
8. Electric Node.
9. Switching as a puzzle requirement.
10. Combine mechanics.

This is a suggested sequence, not a locked level list.

## Design principles
- Each level has one clear teaching or puzzle objective.
- Teach a mechanic in a safe/simple context before combining it.
- Keep player movement forgiving.
- Puzzle cause/effect should be visually clear.
- Provide quick reset.
- Optional collectibles should not obscure the core solution.
- Avoid excessive simultaneous mechanics early.

## First prototype room
Include:
- MOSS and ZIPPY.
- A simple ground/platform layout.
- One Growth Point.
- One Electric Node.
- One Electric Door.
- One Exit Gate.

Prototype objective: test whether switching and ability use create a satisfying, understandable puzzle. Do not build a full campaign before validating this room.

## Level data
Levels should be authored as data rather than level-specific scene code. A level definition should include:
- id, name and world id.
- Critter spawn positions.
- Environment/tile data.
- Object definitions and object ids.
- Exit conditions.
- Objectives and optional targets.
