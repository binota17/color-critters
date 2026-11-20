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

    // Production terrain, platforms, props & background layers (used by Level 1 & QA scenes)
    this.load.spritesheet(TEXTURE_KEYS.CORE_TERRAIN, 'assets/tiles/core-terrain-sheet.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.spritesheet(TEXTURE_KEYS.WOOD_PLATFORM, 'assets/environment/prototype/platform-tiles.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.spritesheet(TEXTURE_KEYS.PROPS_FOLIAGE, 'assets/environment/props/props-foliage.png', {
      frameWidth: 48,
      frameHeight: 32,
    });
    this.load.spritesheet(TEXTURE_KEYS.PROPS_MUSHROOMS, 'assets/environment/props/props-mushrooms.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(TEXTURE_KEYS.PROPS_ROCKS, 'assets/environment/props/props-rocks.png', {
      frameWidth: 48,
      frameHeight: 32,
    });
    this.load.spritesheet(TEXTURE_KEYS.PROPS_FLOWERS, 'assets/environment/props/props-flowers.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.image(TEXTURE_KEYS.BG_HILLS, 'assets/environment/prototype/bg-hills.png');
    this.load.image(TEXTURE_KEYS.BG_CANOPY, 'assets/environment/prototype/bg-canopy.png');
    this.load.image(TEXTURE_KEYS.BG_CANOPY_TREE, 'assets/environment/bg-canopy-tree.png');
    this.load.image(TEXTURE_KEYS.BG_GROVE_TREE, 'assets/environment/bg-grove-tree.png');
    this.load.image(TEXTURE_KEYS.BG_SUNBEAM, 'assets/environment/bg-sunbeam.png');

    // Dedicated Twin Resonance & Conduit assets
    this.load.spritesheet(TEXTURE_KEYS.RESONANCE_ROOT, 'assets/objects/resonance-root.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.spritesheet(TEXTURE_KEYS.RESONANCE_RELAY, 'assets/objects/resonance-relay.png', {
      frameWidth: TILE_SIZE,
      frameHeight: TILE_SIZE,
    });
    this.load.spritesheet(TEXTURE_KEYS.RESONANCE_VINE, 'assets/objects/resonance-vine.png', {
      frameWidth: TILE_SIZE,
      frameHeight: 16,
    });
    this.load.image(TEXTURE_KEYS.RESONANCE_ORB, 'assets/objects/resonance-orb.png');
    this.load.spritesheet(TEXTURE_KEYS.RESONANCE_AURA, 'assets/objects/resonance-aura.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
    this.load.spritesheet(TEXTURE_KEYS.CONDUIT_WIRE, 'assets/objects/conduit-wire.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    // Pixel-art UI panels, buttons, portraits, HUD icons & FX particles
    this.load.image(TEXTURE_KEYS.UI_PANEL, 'assets/ui/ui-panel.png');
    this.load.image(TEXTURE_KEYS.UI_PANEL_COMPLETE, 'assets/ui/ui-panel-complete.png');
    this.load.image(TEXTURE_KEYS.UI_BAR, 'assets/ui/ui-bar.png');
    this.load.image(TEXTURE_KEYS.UI_TOOLTIP, 'assets/ui/ui-tooltip.png');
    this.load.image(TEXTURE_KEYS.UI_BUTTON_GREEN, 'assets/ui/ui-button-green.png');
    this.load.image(TEXTURE_KEYS.UI_BUTTON_GREEN_HOVER, 'assets/ui/ui-button-green-hover.png');
    this.load.image(TEXTURE_KEYS.UI_BUTTON_WOOD, 'assets/ui/ui-button-wood.png');
    this.load.image(TEXTURE_KEYS.UI_BUTTON_WOOD_HOVER, 'assets/ui/ui-button-wood-hover.png');
    this.load.image(TEXTURE_KEYS.TITLE_BANNER, 'assets/ui/title-banner.png');
    this.load.spritesheet(TEXTURE_KEYS.CRITTER_PORTRAITS, 'assets/ui/critter-portraits.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(TEXTURE_KEYS.HUD_ICONS, 'assets/ui/hud-icons.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet(TEXTURE_KEYS.FX_PARTICLES, 'assets/ui/fx-particles.png', {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create(): void {
    this.registerCritterAnimations(CRITTER_IDS.MOSS, TEXTURE_KEYS.MOSS_SHEET);
    this.registerCritterAnimations(CRITTER_IDS.ZIPPY, TEXTURE_KEYS.ZIPPY_SHEET);
    const requestedScene = new URLSearchParams(window.location.search).get('scene');
    if (
      requestedScene === 'EnvStylePrototypeScene' ||
      requestedScene === 'TerrainPreviewScene' ||
      requestedScene === 'PropsPlacementScene' ||
      requestedScene === 'TwinResonanceScene'
    ) {
      this.scene.start(requestedScene);
      return;
    }
    this.scene.start(SCENE_KEYS.MAIN_MENU);
  }

  private registerCritterAnimations(id: CritterId, sheetKey: string): void {
    if (this.anims.exists(`${id}-idle`)) {
      return;
    }

    this.anims.create({
      key: `${id}-idle`,
      frames: this.anims.generateFrameNumbers(sheetKey, { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: `${id}-run`,
      frames: this.anims.generateFrameNumbers(sheetKey, { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${id}-jump`,
      frames: this.anims.generateFrameNumbers(sheetKey, { start: 8, end: 9 }),
      frameRate: 8,
      repeat: 0,
    });

    this.anims.create({
      key: `${id}-fall`,
      frames: this.anims.generateFrameNumbers(sheetKey, { start: 10, end: 11 }),
      frameRate: 6,
      repeat: -1,
    });
  }
}
