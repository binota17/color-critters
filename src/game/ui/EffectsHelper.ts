import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../config/constants';

/**
 * Lightweight pixel-art visual effects (dust puffs, ability bursts, floating text).
 */
export class EffectsHelper {
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  spawnDustPuff(x: number, y: number, count = 4): void {
    for (let i = 0; i < count; i += 1) {
      const offsetX = Phaser.Math.Between(-8, 8);
      const puff = this.scene.add
        .image(x + offsetX, y, TEXTURE_KEYS.FX_PARTICLES, 0)
        .setScale(0.65)
        .setAlpha(0.9)
        .setDepth(3);

      this.scene.tweens.add({
        targets: puff,
        x: puff.x + offsetX * 1.6,
        y: puff.y - Phaser.Math.Between(6, 14),
        alpha: 0,
        scale: 0.25,
        duration: 240,
        ease: 'Cubic.easeOut',
        onComplete: () => puff.destroy(),
      });
    }
  }

  spawnSwitchRing(x: number, y: number, color: number): void {
    const ring = this.scene.add
      .image(x, y, TEXTURE_KEYS.FX_PARTICLES, 3)
      .setTint(color)
      .setScale(1.2)
      .setAlpha(0.95)
      .setDepth(4);
    this.scene.tweens.add({
      targets: ring,
      scale: 2.4,
      alpha: 0,
      duration: 190,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  spawnAbilityBurst(x: number, y: number, color: number): void {
    const pulse = this.scene.add
      .image(x, y, TEXTURE_KEYS.FX_PARTICLES, 3)
      .setTint(color)
      .setScale(1.4)
      .setDepth(4);
    this.scene.tweens.add({
      targets: pulse,
      scale: 3.4,
      alpha: 0,
      duration: 280,
      ease: 'Cubic.easeOut',
      onComplete: () => pulse.destroy(),
    });

    const sparkFrame = color === 0x22c55e || color === 0x4ade80 ? 1 : 2;
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6;
      const spark = this.scene.add
        .image(x, y, TEXTURE_KEYS.FX_PARTICLES, sparkFrame)
        .setTint(color)
        .setScale(0.75)
        .setDepth(4);
      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * 26,
        y: y + Math.sin(angle) * 26,
        alpha: 0,
        duration: 300,
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
  }

  spawnFloatingText(x: number, y: number, message: string, success: boolean): void {
    const label = this.scene.add
      .text(0, 0, message, {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        color: success ? '#14532d' : '#991b1b',
      })
      .setOrigin(0.5);

    const bg = this.scene.add
      .nineslice(0, 0, TEXTURE_KEYS.UI_TOOLTIP, undefined, label.width + 16, label.height + 10, 6, 6, 6, 6)
      .setTint(success ? 0xdcfce7 : 0xfee2e2);

    const feedback = this.scene.add.container(x, y, [bg, label]).setDepth(6);

    this.scene.tweens.add({
      targets: feedback,
      y: feedback.y - 18,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => feedback.destroy(),
    });

    if (!success) {
      this.scene.tweens.add({
        targets: feedback,
        x: feedback.x + 3,
        duration: 45,
        yoyo: true,
        repeat: 2,
      });
    }
  }
}
