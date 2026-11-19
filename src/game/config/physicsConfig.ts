import { GAME_HEIGHT, TILE_SIZE } from './constants';

export const PHYSICS_CONFIG = {
  GRAVITY_Y: 900,
  MOVE_SPEED: 180,
  JUMP_VELOCITY: -400,
  MAX_FALL_SPEED: 600,
  COYOTE_TIME_MS: 100,
  JUMP_BUFFER_MS: 120,
  RESPAWN_Y_THRESHOLD: GAME_HEIGHT + 64,
  SPAWN_POINTS: {
    moss: {
      x: TILE_SIZE * 3 + TILE_SIZE / 2,
      y: GAME_HEIGHT - TILE_SIZE * 2 - TILE_SIZE / 2,
    },
    zippy: {
      x: TILE_SIZE * 6 + TILE_SIZE / 2,
      y: GAME_HEIGHT - TILE_SIZE * 2 - TILE_SIZE / 2,
    },
  },
} as const;
