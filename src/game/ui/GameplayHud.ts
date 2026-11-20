import Phaser from 'phaser';
import { CRITTER_IDS, GAME_HEIGHT, GAME_WIDTH, TEXTURE_KEYS } from '../config/constants';
import { Critter } from '../entities/critters/Critter';

export interface HudUpdateData {
  active: Critter;
  inactive: Critter;
  abilityName: string;
  cooldownMs: number;
  plateOn: boolean;
  nodeOn: boolean;
}

export interface GameplayHudOptions {
  isFinalLevel?: boolean;
  onResume?: () => void;
  onNextLevel?: () => void;
  onReplay?: () => void;
  onMainMenu?: () => void;
}

/**
 * Pixel-art Gameplay HUD displaying active/inactive Critter portraits,
 * ability & cooldown status, puzzle locks, Pause Menu, and Completion overlay.
 */
export class GameplayHud {
  private readonly activePortrait: Phaser.GameObjects.Image;
  private readonly activeBadgeBg: Phaser.GameObjects.NineSlice;
  private readonly activeLabel: Phaser.GameObjects.Text;
  private readonly abilityIcon: Phaser.GameObjects.Image;
  private readonly abilityLabel: Phaser.GameObjects.Text;
  private readonly inactivePortrait: Phaser.GameObjects.Image;
  private readonly inactiveLabel: Phaser.GameObjects.Text;
  private readonly plateIcon: Phaser.GameObjects.Image;
  private readonly nodeIcon: Phaser.GameObjects.Image;
  private readonly doorIcon: Phaser.GameObjects.Image;
  private readonly doorLabel: Phaser.GameObjects.Text;
  private readonly completeScrim: Phaser.GameObjects.NineSlice;
  private readonly completeOverlay: Phaser.GameObjects.Container;
  private readonly pauseScrim: Phaser.GameObjects.NineSlice;
  private readonly pauseOverlay: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, levelName: string, options: GameplayHudOptions = {}) {
    // Top-left compact HUD panel (9-slice pixel frame)
    scene.add
      .nineslice(12, 10, TEXTURE_KEYS.UI_PANEL, undefined, 456, 62, 8, 8, 8, 8)
      .setOrigin(0, 0)
      .setAlpha(0.95)
      .setDepth(8);

    this.activePortrait = scene.add
      .image(34, 41, TEXTURE_KEYS.CRITTER_PORTRAITS, 0)
      .setDepth(9);

    this.activeBadgeBg = scene.add
      .nineslice(56, 18, TEXTURE_KEYS.UI_BUTTON_GREEN, undefined, 68, 22, 6, 6, 6, 6)
      .setOrigin(0, 0)
      .setDepth(9);

    this.activeLabel = scene.add
      .text(90, 29, 'MOSS', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(9);

    this.abilityIcon = scene.add
      .image(136, 29, TEXTURE_KEYS.HUD_ICONS, 0)
      .setDepth(9);

    this.abilityLabel = scene.add
      .text(148, 22, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#3e273b',
      })
      .setDepth(9);

    this.inactivePortrait = scene.add
      .image(64, 54, TEXTURE_KEYS.CRITTER_PORTRAITS, 1)
      .setScale(0.5)
      .setDepth(9);

    this.inactiveLabel = scene.add
      .text(78, 47, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#444d6b',
      })
      .setDepth(9);

    // Top-right compact Puzzle Status panel
    scene.add
      .nineslice(GAME_WIDTH - 12, 10, TEXTURE_KEYS.UI_PANEL, undefined, 286, 40, 8, 8, 8, 8)
      .setOrigin(1, 0)
      .setAlpha(0.95)
      .setDepth(8);

    scene.add
      .text(GAME_WIDTH - 284, 23, 'Plate', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#3e273b',
      })
      .setDepth(9);

    this.plateIcon = scene.add
      .image(GAME_WIDTH - 236, 30, TEXTURE_KEYS.HUD_ICONS, 2)
      .setDepth(9);

    scene.add
      .text(GAME_WIDTH - 216, 23, 'Node', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#3e273b',
      })
      .setDepth(9);

    this.nodeIcon = scene.add
      .image(GAME_WIDTH - 174, 30, TEXTURE_KEYS.HUD_ICONS, 4)
      .setDepth(9);

    this.doorIcon = scene.add
      .image(GAME_WIDTH - 144, 30, TEXTURE_KEYS.HUD_ICONS, 6)
      .setDepth(9);

    this.doorLabel = scene.add
      .text(GAME_WIDTH - 130, 23, 'Door: LOCKED', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#991b1b',
      })
      .setDepth(9);

    // Bottom control strip backed by pixel-art slate bar
    const controlText = `${levelName}  |  A/D Move  •  Space Jump  •  Tab / 1-2 Switch  •  E Ability  •  R Reset  •  Esc Pause`;
    const controlLabel = scene.add
      .text(22, GAME_HEIGHT - 19, controlText, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#fbefd5',
      })
      .setOrigin(0, 0.5)
      .setDepth(9);

    scene.add
      .nineslice(
        12,
        GAME_HEIGHT - 19,
        TEXTURE_KEYS.UI_BAR,
        undefined,
        controlLabel.width + 20,
        24,
        6,
        6,
        6,
        6,
      )
      .setOrigin(0, 0.5)
      .setAlpha(0.9)
      .setDepth(8);

    // Completion overlay scrim & modal
    this.completeScrim = scene.add
      .nineslice(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        TEXTURE_KEYS.UI_BAR,
        undefined,
        GAME_WIDTH + 24,
        GAME_HEIGHT + 24,
        6,
        6,
        6,
        6,
      )
      .setAlpha(0.42)
      .setDepth(18)
      .setInteractive()
      .setVisible(false);

    this.completeOverlay = this.buildCompleteOverlay(scene, levelName, options);

    // Pause menu scrim & modal
    this.pauseScrim = scene.add
      .nineslice(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        TEXTURE_KEYS.UI_BAR,
        undefined,
        GAME_WIDTH + 24,
        GAME_HEIGHT + 24,
        6,
        6,
        6,
        6,
      )
      .setAlpha(0.56)
      .setDepth(18)
      .setInteractive()
      .setVisible(false);

    this.pauseOverlay = this.buildPauseOverlay(scene, levelName, options);
  }

  private buildCompleteOverlay(
    scene: Phaser.Scene,
    levelName: string,
    options: GameplayHudOptions,
  ): Phaser.GameObjects.Container {
    const isFinalLevel = Boolean(options.isFinalLevel);
    const box = scene.add.nineslice(
      0,
      0,
      TEXTURE_KEYS.UI_PANEL_COMPLETE,
      undefined,
      504,
      204,
      8,
      8,
      8,
      8,
    );
    const leftStar = scene.add.image(-204, -62, TEXTURE_KEYS.HUD_ICONS, 9).setScale(1.5);
    const rightStar = scene.add.image(204, -62, TEXTURE_KEYS.HUD_ICONS, 9).setScale(1.5);
    const mossBadge = scene.add.image(-204, -14, TEXTURE_KEYS.CRITTER_PORTRAITS, 0);
    const zippyBadge = scene.add.image(204, -14, TEXTURE_KEYS.CRITTER_PORTRAITS, 1);

    const titleText = isFinalLevel ? 'CAMPAIGN COMPLETE!' : `${levelName.toUpperCase()} COMPLETE!`;
    const title = scene.add
      .text(0, -62, titleText, {
        fontFamily: 'monospace',
        fontSize: isFinalLevel ? '21px' : '18px',
        fontStyle: 'bold',
        color: '#14532d',
      })
      .setOrigin(0.5);

    const subText = isFinalLevel
      ? `${levelName} — All Stages Cleared!`
      : 'MOSS & ZIPPY unlocked the exit gate!';
    const sub = scene.add
      .text(0, -32, subText, {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#166534',
      })
      .setOrigin(0.5);

    const children: Phaser.GameObjects.GameObject[] = [
      box,
      leftStar,
      rightStar,
      mossBadge,
      zippyBadge,
      title,
      sub,
    ];

    if (isFinalLevel) {
      children.push(
        ...this.createModalButton(scene, {
          x: 0,
          y: 12,
          width: 260,
          height: 38,
          label: 'MAIN MENU [Enter]',
          primary: true,
          onClick: () => options.onMainMenu?.(),
        }),
        ...this.createModalButton(scene, {
          x: 0,
          y: 62,
          width: 220,
          height: 36,
          label: 'REPLAY [R]',
          primary: false,
          onClick: () => options.onReplay?.(),
        }),
      );
    } else {
      children.push(
        ...this.createModalButton(scene, {
          x: 0,
          y: 12,
          width: 260,
          height: 38,
          label: 'NEXT LEVEL [Enter]',
          primary: true,
          onClick: () => options.onNextLevel?.(),
        }),
        ...this.createModalButton(scene, {
          x: -108,
          y: 62,
          width: 196,
          height: 36,
          label: 'REPLAY [R]',
          primary: false,
          onClick: () => options.onReplay?.(),
        }),
        ...this.createModalButton(scene, {
          x: 108,
          y: 62,
          width: 196,
          height: 36,
          label: 'MAIN MENU [M]',
          primary: false,
          onClick: () => options.onMainMenu?.(),
        }),
      );
    }

    return scene.add
      .container(GAME_WIDTH / 2, GAME_HEIGHT * 0.44, children)
      .setDepth(20)
      .setVisible(false);
  }

  private buildPauseOverlay(
    scene: Phaser.Scene,
    levelName: string,
    options: GameplayHudOptions,
  ): Phaser.GameObjects.Container {
    const box = scene.add.nineslice(
      0,
      0,
      TEXTURE_KEYS.UI_PANEL,
      undefined,
      360,
      252,
      8,
      8,
      8,
      8,
    );
    const mossBadge = scene.add
      .image(-132, -80, TEXTURE_KEYS.CRITTER_PORTRAITS, 0)
      .setScale(0.9);
    const zippyBadge = scene.add
      .image(132, -80, TEXTURE_KEYS.CRITTER_PORTRAITS, 1)
      .setScale(0.9);

    const title = scene.add
      .text(0, -88, 'PAUSED', {
        fontFamily: 'monospace',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#3e273b',
      })
      .setOrigin(0.5);

    const subtitle = scene.add
      .text(0, -60, levelName, {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#444d6b',
      })
      .setOrigin(0.5);

    const resumeBtn = this.createModalButton(scene, {
      x: 0,
      y: -14,
      width: 244,
      height: 38,
      label: 'RESUME [Esc]',
      primary: true,
      onClick: () => options.onResume?.(),
    });
    const restartBtn = this.createModalButton(scene, {
      x: 0,
      y: 36,
      width: 244,
      height: 36,
      label: 'RESTART LEVEL [R]',
      primary: false,
      onClick: () => options.onReplay?.(),
    });
    const menuBtn = this.createModalButton(scene, {
      x: 0,
      y: 84,
      width: 244,
      height: 36,
      label: 'MAIN MENU [M]',
      primary: false,
      onClick: () => options.onMainMenu?.(),
    });

    return scene.add
      .container(GAME_WIDTH / 2, GAME_HEIGHT * 0.48, [
        box,
        mossBadge,
        zippyBadge,
        title,
        subtitle,
        ...resumeBtn,
        ...restartBtn,
        ...menuBtn,
      ])
      .setDepth(20)
      .setVisible(false);
  }

  private createModalButton(
    scene: Phaser.Scene,
    config: {
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
      primary: boolean;
      onClick: () => void;
    },
  ): Phaser.GameObjects.GameObject[] {
    const baseTex = config.primary ? TEXTURE_KEYS.UI_BUTTON_GREEN : TEXTURE_KEYS.UI_BUTTON_WOOD;
    const hoverTex = config.primary
      ? TEXTURE_KEYS.UI_BUTTON_GREEN_HOVER
      : TEXTURE_KEYS.UI_BUTTON_WOOD_HOVER;

    const bg = scene.add
      .nineslice(config.x, config.y, baseTex, undefined, config.width, config.height, 8, 8, 8, 8)
      .setInteractive({ useHandCursor: true });

    const text = scene.add
      .text(config.x, config.y, config.label, {
        fontFamily: 'monospace',
        fontSize: config.primary ? '14px' : '13px',
        fontStyle: 'bold',
        color: config.primary ? '#ffffff' : '#3e273b',
      })
      .setOrigin(0.5);

    bg.on('pointerover', () => {
      bg.setTexture(hoverTex);
    });
    bg.on('pointerout', () => {
      bg.setTexture(baseTex);
    });
    bg.on('pointerdown', () => {
      config.onClick();
    });

    return [bg, text];
  }

  private lastIsMoss: boolean | null = null;
  private lastDoorOpen: boolean | null = null;

  update(data: HudUpdateData): void {
    const isMoss = data.active.id === CRITTER_IDS.MOSS;
    if (this.lastIsMoss !== isMoss) {
      this.lastIsMoss = isMoss;
      this.activePortrait.setFrame(isMoss ? 0 : 1);
      this.activeBadgeBg.setTexture(
        isMoss ? TEXTURE_KEYS.UI_BUTTON_GREEN : TEXTURE_KEYS.UI_BUTTON_WOOD,
      );
      this.activeLabel.setText(data.active.displayName);
      this.abilityIcon.setFrame(isMoss ? 0 : 1);

      const isInactiveMoss = data.inactive.id === CRITTER_IDS.MOSS;
      const switchKey = isInactiveMoss ? '1' : '2';
      this.inactivePortrait.setFrame(isInactiveMoss ? 0 : 1);
      this.inactiveLabel.setText(`Standby: [${switchKey} / Tab] ${data.inactive.displayName}`);
    }

    const statusText =
      data.cooldownMs > 0 ? `Cooldown ${(data.cooldownMs / 1000).toFixed(1)}s` : 'Ready [E]';
    this.abilityLabel.setText(`${data.abilityName}  •  ${statusText}`);

    this.plateIcon.setFrame(data.plateOn ? 3 : 2);
    this.nodeIcon.setFrame(data.nodeOn ? 5 : 4);

    const doorOpen = data.plateOn && data.nodeOn;
    if (this.lastDoorOpen !== doorOpen) {
      this.lastDoorOpen = doorOpen;
      this.doorIcon.setFrame(doorOpen ? 7 : 6);
      this.doorLabel.setText(doorOpen ? 'Door: OPEN' : 'Door: LOCKED');
      this.doorLabel.setColor(doorOpen ? '#15803d' : '#991b1b');
    }
  }

  setCompleteVisible(visible: boolean): void {
    this.completeScrim.setVisible(visible);
    this.completeOverlay.setVisible(visible);
    if (visible) {
      this.setPauseVisible(false);
    }
  }

  setPauseVisible(visible: boolean): void {
    this.pauseScrim.setVisible(visible);
    this.pauseOverlay.setVisible(visible);
  }
}
