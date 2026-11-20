import Phaser from 'phaser';
import { COLORS, CRITTER_IDS, GAME_HEIGHT, GAME_WIDTH, SCENE_KEYS, TEXTURE_KEYS } from '../config/constants';
import { publishDevGameState } from '../utils/devDebugHook';

/**
 * Placeholder Main Menu scene with a Play action to enter GameplayScene.
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.MAIN_MENU });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.SKY);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.34, 'COLOR CRITTERS', {
        fontFamily: 'monospace',
        fontSize: '48px',
        fontStyle: 'bold',
        color: COLORS.TITLE_TEXT,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.44, 'A Cooperative Puzzle Platformer', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: COLORS.SUBTITLE_TEXT,
      })
      .setOrigin(0.5);

    this.createLevelButton(GAME_WIDTH / 2, GAME_HEIGHT * 0.62, 'PLAY: LEVEL 1', 'level-01', 230, 48);
    this.createLevelButton(
      GAME_WIDTH / 2,
      GAME_HEIGHT * 0.76,
      'LEVEL 2: CANOPY',
      'level-02',
      230,
      42,
    );
    this.createLevelButton(
      GAME_WIDTH / 2,
      GAME_HEIGHT * 0.88,
      'LEVEL 3: RESONANT GROVE',
      'level-03',
      250,
      38,
    );

    this.add
      .sprite(GAME_WIDTH / 2 - 170, GAME_HEIGHT * 0.62, TEXTURE_KEYS.MOSS_SHEET)
      .setScale(2)
      .play(`${CRITTER_IDS.MOSS}-idle`);

    this.add
      .sprite(GAME_WIDTH / 2 + 170, GAME_HEIGHT * 0.62, TEXTURE_KEYS.ZIPPY_SHEET)
      .setScale(2)
      .setFlipX(true)
      .play(`${CRITTER_IDS.ZIPPY}-idle`);

    this.input.keyboard?.once('keydown-ENTER', () => this.startGame('level-01'));
    this.input.keyboard?.once('keydown-SPACE', () => this.startGame('level-01'));

    publishDevGameState({ scene: SCENE_KEYS.MAIN_MENU });
  }

  private createLevelButton(
    x: number,
    y: number,
    label: string,
    levelId: string,
    width: number,
    height: number,
  ): void {
    const buttonBg = this.add
      .rectangle(x, y, width, height, COLORS.BUTTON_BG)
      .setStrokeStyle(3, COLORS.BUTTON_BORDER)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(x, y, label, {
        fontFamily: 'monospace',
        fontSize: '18px',
        fontStyle: 'bold',
        color: COLORS.BUTTON_TEXT,
      })
      .setOrigin(0.5);

    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(COLORS.BUTTON_BG_HOVER);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(COLORS.BUTTON_BG);
    });

    buttonBg.on('pointerdown', () => {
      this.startGame(levelId);
    });
  }

  private startGame(levelId: string): void {
    this.scene.start(SCENE_KEYS.GAMEPLAY, { levelId });
  }
}
