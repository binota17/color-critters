import Phaser from 'phaser';
import { CRITTER_IDS, GAME_HEIGHT, GAME_WIDTH } from '../config/constants';
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
 * Clean, minimal pixel-art Gameplay HUD displaying active/inactive Critters,
 * ability & cooldown status, puzzle locks, and completion overlay.
 */
export class GameplayHud {
  private readonly activeBadgeBg: Phaser.GameObjects.Rectangle;
  private readonly activeLabel: Phaser.GameObjects.Text;
  private readonly abilityLabel: Phaser.GameObjects.Text;
  private readonly inactiveLabel: Phaser.GameObjects.Text;
  private readonly plateDot: Phaser.GameObjects.Rectangle;
  private readonly nodeDot: Phaser.GameObjects.Rectangle;
  private readonly doorLabel: Phaser.GameObjects.Text;
  private readonly completeOverlay: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, levelName: string) {
    // Top-left compact HUD panel
    scene.add
      .rectangle(12, 10, 440, 56, 0xf8fafc, 0.85)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x334155)
      .setDepth(8);

    this.activeBadgeBg = scene.add
      .rectangle(20, 18, 72, 22, 0x22c55e)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x14532d)
      .setDepth(9);

    this.activeLabel = scene.add
      .text(56, 29, 'MOSS', {
        fontFamily: 'monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(9);

    this.abilityLabel = scene.add
      .text(102, 22, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#0f172a',
      })
      .setDepth(9);

    this.inactiveLabel = scene.add
      .text(20, 46, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#475569',
      })
      .setDepth(9);

    // Top-right compact Puzzle Status panel
    scene.add
      .rectangle(GAME_WIDTH - 12, 10, 232, 34, 0xf8fafc, 0.85)
      .setOrigin(1, 0)
      .setStrokeStyle(2, 0x334155)
      .setDepth(8);

    scene.add
      .text(GAME_WIDTH - 234, 20, 'Plate', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#334155',
      })
      .setDepth(9);

    this.plateDot = scene.add
      .rectangle(GAME_WIDTH - 186, 27, 10, 10, 0xef4444)
      .setStrokeStyle(1, 0x0f172a)
      .setDepth(9);

    scene.add
      .text(GAME_WIDTH - 170, 20, 'Node', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#334155',
      })
      .setDepth(9);

    this.nodeDot = scene.add
      .rectangle(GAME_WIDTH - 130, 27, 10, 10, 0xef4444)
      .setStrokeStyle(1, 0x0f172a)
      .setDepth(9);

    this.doorLabel = scene.add
      .text(GAME_WIDTH - 112, 20, 'Door: LOCKED', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#991b1b',
      })
      .setDepth(9);

    // Subtle control strip at bottom-left with dark pill backdrop for legibility
    scene.add
      .text(
        12,
        GAME_HEIGHT - 24,
        `${levelName}  |  A/D Move  •  Space Jump  •  Tab / 1-2 Switch  •  E Ability  •  R Reset`,
        {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#f8fafc',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          padding: { x: 8, y: 3 },
        },
      )
      .setDepth(9);

    // Level Complete overlay
    const box = scene.add
      .rectangle(0, 0, 460, 120, 0xdcfce7, 0.96)
      .setStrokeStyle(3, 0x14532d);
    const title = scene.add
      .text(0, -18, `${levelName.toUpperCase()} COMPLETE!`, {
        fontFamily: 'monospace',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#14532d',
      })
      .setOrigin(0.5);
    const sub = scene.add
      .text(0, 22, 'Press R to Replay', {
        fontFamily: 'monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#166534',
      })
      .setOrigin(0.5);

    this.completeOverlay = scene.add
      .container(GAME_WIDTH / 2, GAME_HEIGHT * 0.32, [box, title, sub])
      .setDepth(10)
      .setVisible(false);
  }

  update(data: HudUpdateData): void {
    const isMoss = data.active.id === CRITTER_IDS.MOSS;
    this.activeBadgeBg.setFillStyle(isMoss ? 0x22c55e : 0xeab308);
    this.activeBadgeBg.setStrokeStyle(2, isMoss ? 0x14532d : 0x854d0e);
    this.activeLabel.setText(data.active.displayName);

    const statusText =
      data.cooldownMs > 0 ? `Cooldown ${(data.cooldownMs / 1000).toFixed(1)}s` : 'Ready [E]';
    this.abilityLabel.setText(`${data.abilityName}  •  ${statusText}`);

    const switchKey = data.inactive.id === CRITTER_IDS.MOSS ? '1' : '2';
    this.inactiveLabel.setText(`Standby: [${switchKey} / Tab] ${data.inactive.displayName}`);

    this.plateDot.setFillStyle(data.plateOn ? 0x22c55e : 0xef4444);
    this.nodeDot.setFillStyle(data.nodeOn ? 0xfacc15 : 0xef4444);

    const doorOpen = data.plateOn && data.nodeOn;
    this.doorLabel.setText(doorOpen ? 'Door: OPEN' : 'Door: LOCKED');
    this.doorLabel.setColor(doorOpen ? '#15803d' : '#991b1b');
  }

  setCompleteVisible(visible: boolean): void {
    this.completeOverlay.setVisible(visible);
  }
}
