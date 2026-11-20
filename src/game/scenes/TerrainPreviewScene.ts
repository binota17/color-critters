import Phaser from 'phaser';
import { CRITTER_IDS, COLORS, TEXTURE_KEYS, TILE_SIZE } from '../config/constants';
import { publishDevGameState } from '../utils/devDebugHook';

/**
 * ENV-ART-002 Terrain Preview & Seam QA Scene.
 * Displays assembled 3x3+ terrain, edges, corners, step transitions, stone family,
 * and platforms at native 960x540 resolution alongside MOSS & ZIPPY.
 * Accessible via ?scene=TerrainPreviewScene.
 */
export class TerrainPreviewScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TerrainPreviewScene' });
  }

  preload(): void {
    this.load.spritesheet('core-terrain-sheet', 'assets/tiles/core-terrain-sheet.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.SKY);

    this.add
      .text(16, 12, 'ENV-ART-002: Core Terrain Tileset Preview (32x32 Native Scale)', {
        fontFamily: 'monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#0f172a',
        backgroundColor: '#e0f2fe',
        padding: { x: 8, y: 4 },
      })
      .setDepth(10);

    // 1. Floating Grass Platform (1x4) & Stone Platform (1x4) & 1x1 Single Blocks
    this.placeTile(2, 3, 5);
    this.placeTile(3, 3, 6);
    this.placeTile(4, 3, 6);
    this.placeTile(5, 3, 7);

    this.placeTile(7, 3, 36);
    this.placeTile(8, 3, 37);
    this.placeTile(9, 3, 37);
    this.placeTile(10, 3, 38);

    this.placeTile(12, 3, 23); // 1x1 grass block
    this.placeTile(14, 3, 35); // 1x1 stone block

    // 2. 1x4 Vertical Dirt Pillar
    this.placeTile(16, 3, 20);
    this.placeTile(16, 4, 21);
    this.placeTile(16, 5, 21);
    this.placeTile(16, 6, 22);

    // 3. 3x3+ Grass & Dirt Island with variation tiles (cols 2..6, rows 10..13)
    this.placeTile(2, 10, 0);
    this.placeTile(3, 10, 1);
    this.placeTile(4, 10, 3);
    this.placeTile(5, 10, 1);
    this.placeTile(6, 10, 2);
    for (let r = 11; r <= 12; r += 1) {
      this.placeTile(2, r, 11);
      this.placeTile(3, r, r === 11 ? 8 : 10);
      this.placeTile(4, r, r === 11 ? 9 : 8);
      this.placeTile(5, r, r === 11 ? 8 : 9);
      this.placeTile(6, r, 15);
    }
    this.placeTile(2, 13, 12);
    this.placeTile(3, 13, 13);
    this.placeTile(4, 13, 13);
    this.placeTile(5, 13, 13);
    this.placeTile(6, 13, 14);

    // 4. Stepped Grass/Dirt Terrain with Inner Corners (cols 9..16, rows 9..13)
    this.placeTile(9, 10, 0);
    this.placeTile(10, 10, 1);
    this.placeTile(11, 10, 16);
    this.placeTile(12, 9, 0);
    this.placeTile(13, 9, 3);
    this.placeTile(14, 9, 2);
    this.placeTile(15, 10, 17);
    this.placeTile(16, 10, 2);

    this.placeTile(9, 11, 11);
    this.placeTile(10, 11, 8);
    this.placeTile(11, 11, 9);
    this.placeTile(12, 10, 8);
    this.placeTile(13, 10, 10);
    this.placeTile(14, 10, 8);
    this.placeTile(12, 11, 10);
    this.placeTile(13, 11, 8);
    this.placeTile(14, 11, 9);
    this.placeTile(15, 11, 8);
    this.placeTile(16, 11, 15);

    this.placeTile(9, 12, 11);
    for (let c = 10; c <= 15; c += 1) {
      this.placeTile(c, 12, 8 + ((c + 1) % 3));
    }
    this.placeTile(16, 12, 15);

    this.placeTile(9, 13, 12);
    for (let c = 10; c <= 15; c += 1) {
      this.placeTile(c, 13, 13);
    }
    this.placeTile(16, 13, 14);

    // 5. 3x3+ Stone Block & Grass-on-Stone Transition (cols 19..24, rows 9..12)
    this.placeTile(19, 9, 24);
    this.placeTile(20, 9, 25);
    this.placeTile(21, 9, 39); // grass-on-stone transition
    this.placeTile(22, 9, 25);
    this.placeTile(23, 9, 26);
    for (let r = 10; r <= 11; r += 1) {
      this.placeTile(19, r, 27);
      this.placeTile(20, r, 28);
      this.placeTile(21, r, r === 10 ? 33 : 28);
      this.placeTile(22, r, r === 11 ? 34 : 28);
      this.placeTile(23, r, 29);
    }
    this.placeTile(19, 12, 30);
    this.placeTile(20, 12, 31);
    this.placeTile(21, 12, 31);
    this.placeTile(22, 12, 31);
    this.placeTile(23, 12, 32);

    // Characters at native scale for terrain readability verification
    this.add
      .sprite(3 * TILE_SIZE + 16, 10 * TILE_SIZE - 16, TEXTURE_KEYS.MOSS_SHEET)
      .setDepth(2)
      .play(`${CRITTER_IDS.MOSS}-idle`);

    this.add
      .sprite(13 * TILE_SIZE + 16, 9 * TILE_SIZE - 16, TEXTURE_KEYS.ZIPPY_SHEET)
      .setDepth(2)
      .play(`${CRITTER_IDS.ZIPPY}-idle`);

    publishDevGameState({ scene: 'TerrainPreviewScene' });
  }

  private placeTile(col: number, row: number, frame: number): void {
    this.add
      .image(col * TILE_SIZE + TILE_SIZE / 2, row * TILE_SIZE + TILE_SIZE / 2, 'core-terrain-sheet', frame)
      .setDepth(0);
  }
}

