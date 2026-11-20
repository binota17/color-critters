import Phaser from 'phaser';
import { CRITTER_IDS, GAME_HEIGHT, GAME_WIDTH, TEXTURE_KEYS, TILE_SIZE } from '../config/constants';
import { GameplayHud } from '../ui/GameplayHud';
import { publishDevGameState } from '../utils/devDebugHook';

/**
 * ENV-ART-001 Visual QA Prototype Scene.
 * Demonstrates the Chunky Nature + Whimsical World environment style lock
 * at native 960x540 resolution alongside MOSS, ZIPPY, interactive objects, and HUD.
 * Accessible via ?scene=EnvStylePrototypeScene without altering Level 1 or Level 2.
 */
export class EnvStylePrototypeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EnvStylePrototypeScene' });
  }

  preload(): void {
    this.load.spritesheet('proto-terrain', 'assets/environment/prototype/terrain-tiles.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.spritesheet('proto-platform', 'assets/environment/prototype/platform-tiles.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.spritesheet('proto-decor', 'assets/environment/prototype/decor-props.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.image('proto-bg-hills', 'assets/environment/prototype/bg-hills.png');
    this.load.image('proto-bg-canopy', 'assets/environment/prototype/bg-canopy.png');
  }

  create(): void {
    // L0: Sky & Clouds
    this.cameras.main.setBackgroundColor('#87ceeb');
    this.add.image(150, 118, TEXTURE_KEYS.CLOUD).setAlpha(0.9).setDepth(-30);
    this.add.image(510, 96, TEXTURE_KEYS.CLOUD).setScale(1.15).setAlpha(0.9).setDepth(-30);
    this.add.image(810, 132, TEXTURE_KEYS.CLOUD).setScale(0.9).setAlpha(0.9).setDepth(-30);

    const groundTopY = GAME_HEIGHT - TILE_SIZE * 2; // 476

    // L1: Distant Hills (tiled across 960px, low contrast, no outline)
    for (let x = 0; x < GAME_WIDTH; x += 320) {
      this.add.image(x + 160, groundTopY - 48, 'proto-bg-hills').setDepth(-20);
    }

    // L2: Midground Vegetation (tiled across 960px, muted blue-green)
    for (let x = 0; x < GAME_WIDTH; x += 320) {
      this.add.image(x + 160, groundTopY - 64, 'proto-bg-canopy').setDepth(-10);
    }

    // L3: Left ground island (cols 0..11, 2 tiles thick)
    this.placeGroundSpan(0, 11, groundTopY);

    // L3: Elevated step on left island (cols 7..10, 1 tile higher)
    this.placeTerrainTile(7, groundTopY - TILE_SIZE, 0);
    this.placeTerrainTile(8, groundTopY - TILE_SIZE, 1);
    this.placeTerrainTile(9, groundTopY - TILE_SIZE, 1);
    this.placeTerrainTile(10, groundTopY - TILE_SIZE, 2);
    for (let c = 7; c <= 10; c += 1) {
      this.placeTerrainTile(c, groundTopY, 3);
    }

    // L3: Right ground island (cols 16..29, 2 tiles thick)
    this.placeGroundSpan(16, 29, groundTopY);

    // L3: Stone block sample cluster (cols 23..24)
    this.placeTerrainTile(23, groundTopY - TILE_SIZE, 4);
    this.placeTerrainTile(24, groundTopY - TILE_SIZE, 4);
    this.placeTerrainTile(24, groundTopY - TILE_SIZE * 2, 4);

    // L3: Wooden platform (cols 12..16 at 3 tiles above ground)
    const platY = groundTopY - TILE_SIZE * 3;
    this.placePlatformTile(12, platY, 0);
    this.placePlatformTile(13, platY, 1);
    this.placePlatformTile(14, platY, 1);
    this.placePlatformTile(15, platY, 1);
    this.placePlatformTile(16, platY, 2);

    // L3: Small decoration set (mushroom=0, flower=1, mossy rock=2)
    this.placeDecor(2, groundTopY, 0);
    this.placeDecor(4, groundTopY, 1);
    this.placeDecor(18, groundTopY, 2);
    this.placeDecor(20, groundTopY, 1);
    this.placeDecor(26, groundTopY, 0);

    // Interactive object samples for readability QA
    this.add.sprite(10 * TILE_SIZE + 16, groundTopY - TILE_SIZE - 16, TEXTURE_KEYS.GROWTH_POINT, 0).setDepth(1);
    this.add.sprite(14 * TILE_SIZE + 16, platY - 16, TEXTURE_KEYS.PRESSURE_PLATE, 0).setDepth(1);

    // MOSS & ZIPPY at native scale (1x)
    this.add
      .sprite(3 * TILE_SIZE + 16, groundTopY - 16, TEXTURE_KEYS.MOSS_SHEET)
      .setDepth(2)
      .play(`${CRITTER_IDS.MOSS}-idle`);

    this.add
      .sprite(13 * TILE_SIZE + 16, platY - 16, TEXTURE_KEYS.ZIPPY_SHEET)
      .setDepth(2)
      .play(`${CRITTER_IDS.ZIPPY}-idle`);

    // Existing HUD for contrast/hierarchy verification
    new GameplayHud(this, 'ENV-ART-001: Style Lock Prototype');

    publishDevGameState({ scene: 'EnvStylePrototypeScene' });
  }

  private placeGroundSpan(startCol: number, endCol: number, groundTopY: number): void {
    for (let col = startCol; col <= endCol; col += 1) {
      const frame = col === startCol ? 0 : col === endCol ? 2 : 1;
      this.placeTerrainTile(col, groundTopY, frame);
      this.placeTerrainTile(col, groundTopY + TILE_SIZE, 3);
    }
  }

  private placeTerrainTile(col: number, topY: number, frame: number): void {
    this.add.image(col * TILE_SIZE + 16, topY + 16, 'proto-terrain', frame).setDepth(0);
  }

  private placePlatformTile(col: number, topY: number, frame: number): void {
    this.add.image(col * TILE_SIZE + 16, topY + 16, 'proto-platform', frame).setDepth(0);
  }

  private placeDecor(col: number, surfaceTopY: number, frame: number): void {
    this.add.image(col * TILE_SIZE + 16, surfaceTopY - 16, 'proto-decor', frame).setDepth(0);
  }
}

