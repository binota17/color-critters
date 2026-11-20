import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, GAME_WIDTH } from './constants';
import { PHYSICS_CONFIG } from './physicsConfig';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { GameplayScene } from '../scenes/GameplayScene';
import { EnvStylePrototypeScene } from '../scenes/EnvStylePrototypeScene';
import { TerrainPreviewScene } from '../scenes/TerrainPreviewScene';
import { PropsPlacementScene } from '../scenes/PropsPlacementScene';
import { TwinResonanceScene } from '../scenes/TwinResonanceScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.SKY,
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: PHYSICS_CONFIG.GRAVITY_Y },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, MainMenuScene, GameplayScene, EnvStylePrototypeScene, TerrainPreviewScene, PropsPlacementScene, TwinResonanceScene],
};
