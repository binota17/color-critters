import Phaser from 'phaser';
import {
  COLORS,
  CRITTER_IDS,
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENE_KEYS,
  TEXTURE_KEYS,
  TILE_SIZE,
} from '../config/constants';
import { publishDevGameState } from '../utils/devDebugHook';

/**
 * Pixel-art Main Menu scene featuring L0-L3 meadow backdrop, title banner,
 * animated MOSS & ZIPPY sprites, and level select buttons.
 */
export class MainMenuScene extends Phaser.Scene {
  private clouds: Phaser.GameObjects.Image[] = [];

  constructor() {
    super({ key: SCENE_KEYS.MAIN_MENU });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.SKY);

    this.createMenuBackdrop();

    // Title Plaque Banner
    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT * 0.25, TEXTURE_KEYS.TITLE_BANNER)
      .setDepth(2);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.225, 'COLOR CRITTERS', {
        fontFamily: 'monospace',
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#14532d',
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.295, 'A Cooperative Puzzle Platformer', {
        fontFamily: 'monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#3e273b',
      })
      .setOrigin(0.5)
      .setDepth(3);

    // Level Buttons (positions preserved for automated E2E tests)
    this.createLevelButton({
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.62,
      label: 'PLAY: LEVEL 1',
      levelId: 'level-01',
      width: 246,
      height: 48,
      primary: true,
      iconFrame: 0,
    });
    this.createLevelButton({
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.76,
      label: 'LEVEL 2: CANOPY',
      levelId: 'level-02',
      width: 246,
      height: 42,
      primary: false,
      iconFrame: 1,
    });
    this.createLevelButton({
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.88,
      label: 'LEVEL 3: RESONANT GROVE',
      levelId: 'level-03',
      width: 274,
      height: 38,
      primary: false,
      iconFrame: 9,
    });

    const groundTopY = GAME_HEIGHT - TILE_SIZE * 2;

    this.add
      .sprite(GAME_WIDTH / 2 - 220, groundTopY - 32, TEXTURE_KEYS.MOSS_SHEET)
      .setScale(2)
      .setDepth(2)
      .play(`${CRITTER_IDS.MOSS}-idle`);

    this.add
      .sprite(GAME_WIDTH / 2 + 220, groundTopY - 32, TEXTURE_KEYS.ZIPPY_SHEET)
      .setScale(2)
      .setFlipX(true)
      .setDepth(2)
      .play(`${CRITTER_IDS.ZIPPY}-idle`);

    this.input.keyboard?.once('keydown-ENTER', () => this.startGame('level-01'));
    this.input.keyboard?.once('keydown-SPACE', () => this.startGame('level-01'));

    publishDevGameState({ scene: SCENE_KEYS.MAIN_MENU });
  }

  update(_time: number, delta: number): void {
    for (let i = 0; i < this.clouds.length; i += 1) {
      const cloud = this.clouds[i];
      cloud.x += (0.012 + i * 0.004) * delta;
      if (cloud.x > GAME_WIDTH + 60) {
        cloud.x = -60;
      }
    }
  }

  private createMenuBackdrop(): void {
    const groundTopY = GAME_HEIGHT - TILE_SIZE * 2;

    this.clouds = [
      this.add.image(140, 74, TEXTURE_KEYS.CLOUD).setAlpha(0.9).setDepth(-30),
      this.add.image(520, 58, TEXTURE_KEYS.CLOUD).setScale(1.15).setAlpha(0.9).setDepth(-30),
      this.add.image(820, 92, TEXTURE_KEYS.CLOUD).setScale(0.9).setAlpha(0.9).setDepth(-30),
    ];

    for (let x = 0; x < GAME_WIDTH; x += 320) {
      this.add.image(x + 160, groundTopY - 48, TEXTURE_KEYS.BG_HILLS).setDepth(-20);
      this.add.image(x + 160, groundTopY - 64, TEXTURE_KEYS.BG_CANOPY).setDepth(-10);
    }

    const totalCols = Math.ceil(GAME_WIDTH / TILE_SIZE);
    for (let col = 0; col < totalCols; col += 1) {
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      const topFrame = col % 4 === 2 ? 3 : 1;
      const botFrame = 8 + (col % 3);
      this.add.image(x, groundTopY + TILE_SIZE * 0.5, TEXTURE_KEYS.CORE_TERRAIN, topFrame).setDepth(0);
      this.add.image(x, groundTopY + TILE_SIZE * 1.5, TEXTURE_KEYS.CORE_TERRAIN, botFrame).setDepth(0);
    }

    const placeProp = (key: string, frame: number, col: number) => {
      this.add.image(Math.round(col * TILE_SIZE), groundTopY, key, frame).setOrigin(0.5, 1).setDepth(1);
    };

    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 4, 1.4);
    placeProp(TEXTURE_KEYS.PROPS_MUSHROOMS, 3, 3.2);
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 0, 5.2);
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 0, 9.6);
    placeProp(TEXTURE_KEYS.PROPS_ROCKS, 3, 20.5);
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 2, 24.4);
    placeProp(TEXTURE_KEYS.PROPS_MUSHROOMS, 1, 26.2);
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 3, 28.4);
  }

  private createLevelButton(options: {
    x: number;
    y: number;
    label: string;
    levelId: string;
    width: number;
    height: number;
    primary: boolean;
    iconFrame: number;
  }): void {
    const baseTex = options.primary ? TEXTURE_KEYS.UI_BUTTON_GREEN : TEXTURE_KEYS.UI_BUTTON_WOOD;
    const hoverTex = options.primary
      ? TEXTURE_KEYS.UI_BUTTON_GREEN_HOVER
      : TEXTURE_KEYS.UI_BUTTON_WOOD_HOVER;

    const buttonBg = this.add
      .nineslice(options.x, options.y, baseTex, undefined, options.width, options.height, 8, 8, 8, 8)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });

    const labelText = this.add
      .text(options.x + 8, options.y, options.label, {
        fontFamily: 'monospace',
        fontSize: options.primary ? '17px' : '15px',
        fontStyle: 'bold',
        color: options.primary ? '#ffffff' : '#3e273b',
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.add
      .image(options.x - labelText.width / 2 - 8, options.y, TEXTURE_KEYS.HUD_ICONS, options.iconFrame)
      .setDepth(3);

    buttonBg.on('pointerover', () => {
      buttonBg.setTexture(hoverTex);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setTexture(baseTex);
    });

    buttonBg.on('pointerdown', () => {
      this.startGame(options.levelId);
    });
  }

  private startGame(levelId: string): void {
    this.scene.start(SCENE_KEYS.GAMEPLAY, { levelId });
  }
}
