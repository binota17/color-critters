import Phaser from 'phaser';
import { CRITTER_IDS, CritterId, SCENE_KEYS, TEXTURE_KEYS, TILE_SIZE } from '../config/constants';

/**
 * Preload scene that loads pixel-art spritesheets, tiles, objects, and environment art,
 * then registers reusable Phaser animations before entering MainMenuScene.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.PRELOAD });
  }

  preload(): void {
    this.load.spritesheet(TEXTURE_KEYS.MOSS_SHEET, 'assets/critters/moss-sheet.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.spritesheet(TEXTURE_KEYS.ZIPPY_SHEET, 'assets/critters/zippy-sheet.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });

    this.load.image(TEXTURE_KEYS.GROUND_TILE, 'assets/tiles/ground-tile.png');
    this.load.image(TEXTURE_KEYS.PLATFORM_TILE, 'assets/tiles/platform-tile.png');
    this.load.image(TEXTURE_KEYS.VINE_TILE, 'assets/tiles/vine-tile.png');

    this.load.spritesheet(TEXTURE_KEYS.GROWTH_POINT, 'assets/objects/growth-point.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.spritesheet(TEXTURE_KEYS.ELECTRIC_NODE, 'assets/objects/electric-node.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.image(TEXTURE_KEYS.ELECTRIC_DOOR_TILE, 'assets/objects/electric-door.png');
    this.load.spritesheet(TEXTURE_KEYS.PRESSURE_PLATE, 'assets/objects/pressure-plate.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.spritesheet(TEXTURE_KEYS.EXIT_GATE, 'assets/objects/exit-gate.png', {
      frameWidth: TILE_SIZE,
      frameHeight: 48,
    });

    this.load.image(TEXTURE_KEYS.CLOUD, 'assets/environment/cloud.png');
    this.load.image(TEXTURE_KEYS.GRASS_TUFT, 'assets/environment/grass-tuft.png');
  }

  create(): void {
    this.registerCritterAnimations(CRITTER_IDS.MOSS, TEXTURE_KEYS.MOSS_SHEET);
    this.registerCritterAnimations(CRITTER_IDS.ZIPPY, TEXTURE_KEYS.ZIPPY_SHEET);
    this.scene.start(SCENE_KEYS.MAIN_MENU);
  }

  private registerCritterAnimations(id: CritterId, sheetKey: string): void {
    if (this.anims.exists(`${id}-idle`)) {
      return;
    }

    this.anims.create({
      key: `${id}-idle`,
      frames: this.anims.generateFrameNumbers(sheetKey, { start: 0, end: 1 }),
      frameRate: 3,
      repeat: -1,
    });

    this.anims.create({
      key: `${id}-run`,
      frames: this.anims.generateFrameNumbers(sheetKey, { start: 2, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: `${id}-jump`,
      frames: [{ key: sheetKey, frame: 4 }],
      frameRate: 1,
      repeat: 0,
    });

    this.anims.create({
      key: `${id}-fall`,
      frames: [{ key: sheetKey, frame: 5 }],
      frameRate: 1,
      repeat: 0,
    });
  }
}
