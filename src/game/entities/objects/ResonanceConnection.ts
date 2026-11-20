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
  private readonly vineSegments: Phaser.GameObjects.Sprite[] = [];
  private readonly energyPacket: Phaser.GameObjects.Image;
  private connected = false;
  private transmitting = false;
  private powered = false;

  constructor(scene: Phaser.Scene, options: ResonanceConnectionOptions) {
    this.scene = scene;
    this.startX = options.startX;
    this.startY = options.startY;
    this.endX = options.endX;
    this.endY = options.endY;

    // Pre-create visual resonance vine segments along the path (no physics bodies)
    const angle = Math.atan2(this.endY - this.startY, this.endX - this.startX);
    const distance = Math.hypot(this.endX - this.startX, this.endY - this.startY);
    const segmentCount = Math.max(2, Math.floor(distance / TILE_SIZE));
    for (let i = 0; i <= segmentCount; i += 1) {
      const t = i / segmentCount;
      const sx = Phaser.Math.Linear(this.startX, this.endX, t);
      const sy = Phaser.Math.Linear(this.startY, this.endY, t);
      const seg = scene.add
        .sprite(sx, sy, TEXTURE_KEYS.RESONANCE_VINE, 0)
        .setRotation(angle)
        .setDepth(0)
        .setVisible(false);
      this.vineSegments.push(seg);
    }

    this.energyPacket = scene.add
      .image(this.startX, this.startY, TEXTURE_KEYS.RESONANCE_ORB)
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
      seg.setFrame(0);
      seg.setVisible(true);
      seg.setScale(0.2, 1);
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
    for (const seg of this.vineSegments) {
      seg.setFrame(1);
    }
  }

  reset(): void {
    this.connected = false;
    this.transmitting = false;
    this.powered = false;

    this.scene.tweens.killTweensOf(this.energyPacket);
    this.energyPacket.setVisible(false).setPosition(this.startX, this.startY);

    for (const seg of this.vineSegments) {
      this.scene.tweens.killTweensOf(seg);
      seg.setFrame(0);
      seg.setScale(1, 1);
      seg.setVisible(false);
    }
  }
}

