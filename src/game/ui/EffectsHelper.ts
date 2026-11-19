import Phaser from 'phaser';

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
      const puff = this.scene.add.rectangle(x + offsetX, y, 4, 4, 0xf1f5f9, 0.85).setDepth(3);

      this.scene.tweens.add({
        targets: puff,
        x: puff.x + offsetX * 1.6,
        y: puff.y - Phaser.Math.Between(6, 14),
        alpha: 0,
        scale: 0.4,
        duration: 240,
        ease: 'Cubic.easeOut',
        onComplete: () => puff.destroy(),
      });
    }
  }

  spawnAbilityBurst(x: number, y: number, color: number): void {
    const pulse = this.scene.add.circle(x, y, 14).setStrokeStyle(3, color).setDepth(4);
    this.scene.tweens.add({
      targets: pulse,
      scale: 2.6,
      alpha: 0,
      duration: 280,
      ease: 'Cubic.easeOut',
      onComplete: () => pulse.destroy(),
    });

    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6;
      const spark = this.scene.add.rectangle(x, y, 4, 4, color).setDepth(4);
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
    const feedback = this.scene.add
      .text(x, y, message, {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: success ? '#14532d' : '#991b1b',
        backgroundColor: '#ffffff',
        padding: { x: 5, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.scene.tweens.add({
      targets: feedback,
      y: feedback.y - 18,
      alpha: 0,
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => feedback.destroy(),
    });
  }
}
