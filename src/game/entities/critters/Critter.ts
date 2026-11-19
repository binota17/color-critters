import Phaser from 'phaser';
import { CritterId } from '../../config/constants';

export type CritterState = 'IDLE' | 'RUNNING' | 'JUMPING' | 'FALLING';
export type FacingDirection = 'left' | 'right';

export interface SpawnPoint {
  x: number;
  y: number;
}

export interface CritterOptions {
  id: CritterId;
  displayName: string;
  spawnPoint: SpawnPoint;
  textureKey: string;
}

/**
 * Base playable Critter entity with Arcade Physics body, state, facing direction,
 * and active/inactive visual state.
 */
export class Critter extends Phaser.Physics.Arcade.Sprite {
  readonly id: CritterId;
  readonly displayName: string;
  readonly spawnPoint: SpawnPoint;
  critterState: CritterState = 'IDLE';
  facing: FacingDirection = 'right';
  isActive = false;
  private animPhase = 0;
  private squashTimerMs = 0;
  private currentScaleX = 1;
  private currentScaleY = 1;

  constructor(scene: Phaser.Scene, options: CritterOptions) {
    super(scene, options.spawnPoint.x, options.spawnPoint.y, options.textureKey);
    this.id = options.id;
    this.displayName = options.displayName;
    this.spawnPoint = { ...options.spawnPoint };

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(22, 22);
    body.setOffset(5, 8);

    this.play(`${this.id}-idle`);
  }

  setActiveState(active: boolean): void {
    this.isActive = active;
    this.setAlpha(active ? 1 : 0.75);
    this.setDepth(active ? 2 : 1);
  }

  setFacing(direction: FacingDirection): void {
    this.facing = direction;
    this.setFlipX(direction === 'left');
  }

  resetToSpawn(): void {
    this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.setVelocity(0, 0);
    this.critterState = 'IDLE';
    this.setFacing('right');
    this.animPhase = 0;
    this.squashTimerMs = 0;
    this.currentScaleX = 1;
    this.currentScaleY = 1;
    this.setScale(1, 1);
    this.setAngle(0);
    this.play(`${this.id}-idle`, true);
  }

  /**
   * Plays sprite-sheet animation for current state and applies subtle squash/stretch
   * without affecting physics hitbox.
   */
  updateVisualAnimation(deltaMs: number, justJumped: boolean, justLanded: boolean): void {
    const animKey =
      this.critterState === 'RUNNING'
        ? `${this.id}-run`
        : this.critterState === 'JUMPING'
          ? `${this.id}-jump`
          : this.critterState === 'FALLING'
            ? `${this.id}-fall`
            : `${this.id}-idle`;
    this.play(animKey, true);

    this.animPhase += deltaMs * 0.008;

    if (justJumped) {
      this.currentScaleX = 0.84;
      this.currentScaleY = 1.18;
      this.squashTimerMs = 110;
    } else if (justLanded) {
      this.currentScaleX = 1.2;
      this.currentScaleY = 0.8;
      this.squashTimerMs = 110;
    }

    let targetScaleX = 1;
    let targetScaleY = 1;
    let targetAngle = 0;

    if (this.squashTimerMs > 0) {
      this.squashTimerMs = Math.max(0, this.squashTimerMs - deltaMs);
      const t = 1 - this.squashTimerMs / 110;
      this.setScale(
        Phaser.Math.Linear(this.currentScaleX, 1, t),
        Phaser.Math.Linear(this.currentScaleY, 1, t),
      );
      this.setAngle(0);
      return;
    }

    switch (this.critterState) {
      case 'IDLE': {
        const breath = Math.sin(this.animPhase * 0.65) * 0.03;
        targetScaleX = 1 - breath;
        targetScaleY = 1 + breath;
        break;
      }
      case 'RUNNING': {
        const stride = Math.sin(this.animPhase * 2.2);
        targetScaleX = 1 - Math.abs(stride) * 0.06;
        targetScaleY = 1 + Math.abs(stride) * 0.08;
        targetAngle = stride * 5;
        break;
      }
      case 'JUMPING': {
        targetScaleX = 0.92;
        targetScaleY = 1.1;
        break;
      }
      case 'FALLING': {
        targetScaleX = 0.94;
        targetScaleY = 1.07;
        break;
      }
    }

    this.setScale(targetScaleX, targetScaleY);
    this.setAngle(targetAngle);
  }
}
