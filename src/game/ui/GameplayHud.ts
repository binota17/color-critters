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

/**
 * Pixel-art Gameplay HUD displaying active/inactive Critter portraits,
 * ability & cooldown status, puzzle locks, and completion overlay.
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
  private readonly completeOverlay: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, levelName: string) {
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
    const controlText = `${levelName}  |  A/D Move  •  Space Jump  •  Tab / 1-2 Switch  •  E Ability  •  R Reset`;
    const controlLabel = scene.add
      .text(22, GAME_HEIGHT - 19, controlText, {
        fontFamily: 'monospace',
        fontSize: '12px',
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

    // Level Complete overlay (pixel-art frame + stars + portraits)
    const box = scene.add.nineslice(
      0,
      0,
      TEXTURE_KEYS.UI_PANEL_COMPLETE,
      undefined,
      470,
      132,
      8,
      8,
      8,
      8,
    );
    const leftStar = scene.add.image(-190, -22, TEXTURE_KEYS.HUD_ICONS, 9).setScale(1.5);
    const rightStar = scene.add.image(190, -22, TEXTURE_KEYS.HUD_ICONS, 9).setScale(1.5);
    const mossBadge = scene.add.image(-168, 24, TEXTURE_KEYS.CRITTER_PORTRAITS, 0);
    const zippyBadge = scene.add.image(168, 24, TEXTURE_KEYS.CRITTER_PORTRAITS, 1);

    const title = scene.add
      .text(0, -22, `${levelName.toUpperCase()} COMPLETE!`, {
        fontFamily: 'monospace',
        fontSize: '19px',
        fontStyle: 'bold',
        color: '#14532d',
      })
      .setOrigin(0.5);
    const sub = scene.add
      .text(0, 24, 'Press R to Replay', {
        fontFamily: 'monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#166534',
      })
      .setOrigin(0.5);

    this.completeOverlay = scene.add
      .container(GAME_WIDTH / 2, GAME_HEIGHT * 0.32, [
        box,
        leftStar,
        rightStar,
        mossBadge,
        zippyBadge,
        title,
        sub,
      ])
      .setDepth(10)
      .setVisible(false);
  }

  update(data: HudUpdateData): void {
    const isMoss = data.active.id === CRITTER_IDS.MOSS;
    this.activePortrait.setFrame(isMoss ? 0 : 1);
    this.activeBadgeBg.setTexture(
      isMoss ? TEXTURE_KEYS.UI_BUTTON_GREEN : TEXTURE_KEYS.UI_BUTTON_WOOD,
    );
    this.activeLabel.setText(data.active.displayName);
    this.abilityIcon.setFrame(isMoss ? 0 : 1);

    const statusText =
      data.cooldownMs > 0 ? `Cooldown ${(data.cooldownMs / 1000).toFixed(1)}s` : 'Ready [E]';
    this.abilityLabel.setText(`${data.abilityName}  •  ${statusText}`);

    const isInactiveMoss = data.inactive.id === CRITTER_IDS.MOSS;
    const switchKey = isInactiveMoss ? '1' : '2';
    this.inactivePortrait.setFrame(isInactiveMoss ? 0 : 1);
    this.inactiveLabel.setText(`Standby: [${switchKey} / Tab] ${data.inactive.displayName}`);

    this.plateIcon.setFrame(data.plateOn ? 3 : 2);
    this.nodeIcon.setFrame(data.nodeOn ? 5 : 4);

    const doorOpen = data.plateOn && data.nodeOn;
    this.doorIcon.setFrame(doorOpen ? 7 : 6);
    this.doorLabel.setText(doorOpen ? 'Door: OPEN' : 'Door: LOCKED');
    this.doorLabel.setColor(doorOpen ? '#15803d' : '#991b1b');
  }

  setCompleteVisible(visible: boolean): void {
    this.completeOverlay.setVisible(visible);
  }
}
