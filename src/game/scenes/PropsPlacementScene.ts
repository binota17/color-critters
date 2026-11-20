import Phaser from 'phaser';
import { CRITTER_IDS, GAME_HEIGHT, GAME_WIDTH, TEXTURE_KEYS, TILE_SIZE } from '../config/constants';
import { GameplayHud } from '../ui/GameplayHud';
import { publishDevGameState } from '../utils/devDebugHook';

/**
 * ENV-ART-003 Props Placement QA Scene.
 * Demonstrates all 4 decoration families (Foliage, Mushrooms, Rocks, Flowers)
 * intentionally placed on production core terrain & platforms alongside MOSS, ZIPPY,
 * interactive objects, and HUD at native 960x540 resolution.
 * Accessible via ?scene=PropsPlacementScene.
 */
export class PropsPlacementScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PropsPlacementScene' });
  }

  preload(): void {
    this.load.spritesheet('core-terrain-sheet', 'assets/tiles/core-terrain-sheet.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.spritesheet('proto-platform', 'assets/environment/prototype/platform-tiles.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.image('proto-bg-hills', 'assets/environment/prototype/bg-hills.png');
    this.load.image('proto-bg-canopy', 'assets/environment/prototype/bg-canopy.png');

    this.load.spritesheet('props-foliage', 'assets/environment/props/props-foliage.png', {
      frameWidth: 48,
      frameHeight: 32,
    });
    this.load.spritesheet('props-mushrooms', 'assets/environment/props/props-mushrooms.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('props-rocks', 'assets/environment/props/props-rocks.png', {
      frameWidth: 48,
      frameHeight: 32,
    });
    this.load.spritesheet('props-flowers', 'assets/environment/props/props-flowers.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#87ceeb');
    this.add.image(150, 118, TEXTURE_KEYS.CLOUD).setAlpha(0.9).setDepth(-30);
    this.add.image(520, 96, TEXTURE_KEYS.CLOUD).setScale(1.15).setAlpha(0.9).setDepth(-30);
    this.add.image(820, 130, TEXTURE_KEYS.CLOUD).setScale(0.9).setAlpha(0.9).setDepth(-30);

    const groundTopY = GAME_HEIGHT - TILE_SIZE * 2; // 476

    for (let x = 0; x < GAME_WIDTH; x += 320) {
      this.add.image(x + 160, groundTopY - 48, 'proto-bg-hills').setDepth(-20);
      this.add.image(x + 160, groundTopY - 64, 'proto-bg-canopy').setDepth(-10);
    }

    // Left ground span (cols 0..11) + elevated step (cols 7..10)
    this.placeGroundSpan(0, 11, groundTopY);
    this.placeTerrain(7, groundTopY - TILE_SIZE, 0);
    this.placeTerrain(8, groundTopY - TILE_SIZE, 1);
    this.placeTerrain(9, groundTopY - TILE_SIZE, 3);
    this.placeTerrain(10, groundTopY - TILE_SIZE, 2);
    for (let c = 7; c <= 10; c += 1) {
      this.placeTerrain(c, groundTopY, 8);
    }

    // Right ground span (cols 16..29)
    this.placeGroundSpan(16, 29, groundTopY);

    // Wooden platform (cols 11..16)
    const platY = groundTopY - TILE_SIZE * 3;
    this.placePlatform(11, platY, 0);
    for (let c = 12; c <= 15; c += 1) {
      this.placePlatform(c, platY, 1);
    }
    this.placePlatform(16, platY, 2);

    // Intentional Props Placement (depth 1, bottom-center anchor 0.5, 1.0)
    // Zone 1 (Left ground): bush-lg, mushroom-cluster, grass tufts, flowers
    this.placeProp('props-foliage', 4, 1.5 * TILE_SIZE, groundTopY); // bush-lg
    this.placeProp('props-mushrooms', 3, 2.8 * TILE_SIZE, groundTopY); // mushroom-cluster
    this.placeProp('props-foliage', 0, 4.3 * TILE_SIZE, groundTopY); // grass-tuft-sm
    this.placeProp('props-flowers', 0, 5.2 * TILE_SIZE, groundTopY); // flower-daisy
    this.placeProp('props-rocks', 0, 6.2 * TILE_SIZE, groundTopY); // rock-sm

    // Elevated step: flower-rose, grass-tuft-md, GrowthPoint
    this.placeProp('props-flowers', 1, 7.6 * TILE_SIZE, groundTopY - TILE_SIZE); // flower-rose
    this.placeProp('props-foliage', 1, 8.8 * TILE_SIZE, groundTopY - TILE_SIZE); // grass-tuft-md
    this.add.sprite(10 * TILE_SIZE + 16, groundTopY - TILE_SIZE - 16, TEXTURE_KEYS.GROWTH_POINT, 0).setDepth(1);

    // Wooden platform: rock-sm, mushroom-sm, PressurePlate
    this.placeProp('props-rocks', 0, 11.7 * TILE_SIZE, platY); // rock-sm
    this.placeProp('props-mushrooms', 0, 15.8 * TILE_SIZE, platY); // mushroom-sm
    this.add.sprite(14 * TILE_SIZE + 16, platY - 16, TEXTURE_KEYS.PRESSURE_PLATE, 0).setDepth(1);

    // Right ground: rock-mossy, grass-tuft-lg, flower-twin-cyan, mushroom-lg, bush-sm, ElectricNode
    this.placeProp('props-foliage', 2, 17.5 * TILE_SIZE, groundTopY); // grass-tuft-lg
    this.placeProp('props-rocks', 3, 19.2 * TILE_SIZE, groundTopY); // rock-mossy
    this.placeProp('props-flowers', 2, 20.6 * TILE_SIZE, groundTopY); // flower-twin-cyan
    this.add.sprite(22 * TILE_SIZE + 16, groundTopY - 16, TEXTURE_KEYS.ELECTRIC_NODE, 0).setDepth(1);
    this.placeProp('props-mushrooms', 2, 24.0 * TILE_SIZE, groundTopY); // mushroom-lg
    this.placeProp('props-flowers', 3, 25.3 * TILE_SIZE, groundTopY); // flower-cluster
    this.placeProp('props-rocks', 2, 26.8 * TILE_SIZE, groundTopY); // rock-cluster
    this.placeProp('props-foliage', 3, 28.5 * TILE_SIZE, groundTopY); // bush-sm

    // MOSS & ZIPPY at native scale (depth 2)
    this.add
      .sprite(3.5 * TILE_SIZE + 16, groundTopY - 16, TEXTURE_KEYS.MOSS_SHEET)
      .setDepth(2)
      .play(`${CRITTER_IDS.MOSS}-idle`);

    this.add
      .sprite(13 * TILE_SIZE + 16, platY - 16, TEXTURE_KEYS.ZIPPY_SHEET)
      .setDepth(2)
      .play(`${CRITTER_IDS.ZIPPY}-idle`);

    new GameplayHud(this, 'ENV-ART-003: Props Placement QA');
    publishDevGameState({ scene: 'PropsPlacementScene' });
  }

  private placeGroundSpan(startCol: number, endCol: number, groundTopY: number): void {
    for (let col = startCol; col <= endCol; col += 1) {
      const topFrame = col === startCol ? 0 : col === endCol ? 2 : col % 3 === 0 ? 3 : 1;
      this.placeTerrain(col, groundTopY, topFrame);
      this.placeTerrain(col, groundTopY + TILE_SIZE, 8 + (col % 3));
    }
  }

  private placeTerrain(col: number, topY: number, frame: number): void {
    this.add.image(col * TILE_SIZE + 16, topY + 16, 'core-terrain-sheet', frame).setDepth(0);
  }

  private placePlatform(col: number, topY: number, frame: number): void {
    this.add.image(col * TILE_SIZE + 16, topY + 16, 'proto-platform', frame).setDepth(0);
  }

  private placeProp(key: string, frame: number, x: number, surfaceTopY: number): void {
    this.add.image(Math.round(x), surfaceTopY, key, frame).setOrigin(0.5, 1).setDepth(1);
  }
}

