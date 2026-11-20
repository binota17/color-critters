import { LevelDefinition } from '../../../types/level';
import { LEVEL_01 } from './level01';
import { LEVEL_02 } from './level02';
import { LEVEL_03 } from './level03';

export const LEVELS: LevelDefinition[] = [LEVEL_01, LEVEL_02, LEVEL_03];

export function getLevelById(levelId?: string): LevelDefinition {
  return LEVELS.find((lvl) => lvl.id === levelId) ?? LEVEL_01;
}

export function getNextLevelId(currentLevelId?: string): string | null {
  const index = LEVELS.findIndex((lvl) => lvl.id === currentLevelId);
  if (index === -1 || index + 1 >= LEVELS.length) {
    return null;
  }
  return LEVELS[index + 1].id;
}
