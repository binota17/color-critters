import { LevelDefinition } from '../../../types/level';
import { LEVEL_01 } from './level01';
import { LEVEL_02 } from './level02';

export const LEVELS: LevelDefinition[] = [LEVEL_01, LEVEL_02];

export function getLevelById(levelId?: string): LevelDefinition {
  return LEVELS.find((lvl) => lvl.id === levelId) ?? LEVEL_01;
}
