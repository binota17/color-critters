import Phaser from 'phaser';
import { TEXTURE_KEYS, TILE_SIZE } from '../../config/constants';

export interface ResonanceConnectionOptions {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Purely visual biological Resonance Vine connection between ResonanceRoot and ResonanceRelay.
 * Contains no physics or collision bodies.
 */
export class ResonanceConnection {
  private readonly scene: Phaser.Scene;
  private readonly startX: number;
  private readonly startY: number;
  private readonly endX: number;
  private readonly endY: number;
  private readonly vineSegments: Phaser.GameObjects.Image[] = [];
  private readonly energyPacket: Phaser.GameObjects.Arc;
  private readonly glowLine: Phaser.GameObjects.Graphics;
  private connected = false;
  private transmitting = false;
  private powered = false;

  constructor(scene: Phaser.Scene, options: ResonanceConnectionOptions) {
    this.scene = scene;
    this.startX = options.startX;
    this.startY = options.startY;
    this.endX = options.endX;
    this.endY = options.endY;

    this.glowLine = scene.add.graphics().setDepth(0).setVisible(false);

    // Pre-create visual vine segments along the path (no physics bodies)
    const angle = Math.atan2(this.endY - this.startY, this.endX - this.startX);
    const distance = Math.hypot(this.endX - this.startX, this.endY - this.startY);
    const segmentCount = Math.max(2, Math.floor(distance / TILE_SIZE));
    for (let i = 0; i <= segmentCount; i += 1) {
      const t = i / segmentCount;
      const sx = Phaser.Math.Linear(this.startX, this.endX, t);
      const sy = Phaser.Math.Linear(this.startY, this.endY, t);
      const seg = scene.add
        .image(sx, sy, TEXTURE_KEYS.VINE_TILE)
        .setDisplaySize(TILE_SIZE, 10)
        .setRotation(angle)
        .setDepth(0)
        .setVisible(false);
      this.vineSegments.push(seg);
    }

    this.energyPacket = scene.add
      .circle(this.startX, this.startY, 7, 0x43defc, 1)
      .setStrokeStyle(2, 0xfacc15)
      .setDepth(2)
      .setVisible(false);
  }

  isConnected(): boolean {
    return this.connected;
  }

  isVisible(): boolean {
    return this.connected;
  }

  isTransmitting(): boolean {
    return this.transmitting;
  }

  isPowered(): boolean {
    return this.powered;
  }

  establish(): void {
    if (this.connected) {
      return;
    }
    this.connected = true;

    this.vineSegments.forEach((seg, index) => {
      this.scene.tweens.killTweensOf(seg);
      seg.setVisible(true);
      seg.setScale(0.2, 1);
      seg.setTint(0xffffff);
      this.scene.tweens.add({
        targets: seg,
        scaleX: 1,
        duration: 150,
        delay: index * 28,
        ease: 'Back.easeOut',
      });
    });
  }

  transmitEnergy(onComplete?: () => void): void {
    if (!this.connected || this.transmitting || this.powered) {
      return;
    }

    this.transmitting = true;
    this.scene.tweens.killTweensOf(this.energyPacket);
    this.energyPacket
      .setPosition(this.startX, this.startY)
      .setScale(1)
      .setVisible(true);

    this.scene.tweens.add({
      targets: this.energyPacket,
      x: this.endX,
      y: this.endY,
      duration: 260,
      ease: 'Cubic.easeInOut',
      onComplete: () => {
        this.transmitting = false;
        this.powered = true;
        this.energyPacket.setVisible(false);
        this.showPoweredGlow();
        onComplete?.();
      },
    });
  }

  private showPoweredGlow(): void {
    this.glowLine.clear();
    this.glowLine.lineStyle(4, 0xfacc15, 0.55);
    this.glowLine.lineBetween(this.startX, this.startY, this.endX, this.endY);
    this.glowLine.setVisible(true);

    for (const seg of this.vineSegments) {
      seg.setTint(0xbef264);
    }
  }

  reset(): void {
    this.connected = false;
    this.transmitting = false;
    this.powered = false;

    this.scene.tweens.killTweensOf(this.energyPacket);
    this.energyPacket.setVisible(false).setPosition(this.startX, this.startY);

    this.glowLine.clear().setVisible(false);

    for (const seg of this.vineSegments) {
      this.scene.tweens.killTweensOf(seg);
      seg.clearTint();
      seg.setScale(1, 1);
      seg.setVisible(false);
    }
  }
}

