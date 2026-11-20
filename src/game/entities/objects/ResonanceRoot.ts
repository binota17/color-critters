import Phaser from 'phaser';
import { CRITTER_IDS, CritterId, TEXTURE_KEYS } from '../../config/constants';
import { PuzzleSystem } from '../../systems/PuzzleSystem';
import { InteractableObject } from './InteractableObject';
import { ResonanceConnection } from './ResonanceConnection';

export interface ResonanceRootOptions {
  id: string;
  x: number;
  y: number;
  connection: ResonanceConnection;
  conditionKey: string;
  puzzleSystem: PuzzleSystem;
}

/**
 * Resonance Root interactable for MOSS: establishes the biological Resonance Vine
 * connection to a paired ResonanceRelay.
 */
export class ResonanceRoot implements InteractableObject {
  readonly id: string;
  readonly requiredCritter: CritterId = CRITTER_IDS.MOSS;
  readonly interactionRadius = 48;
  readonly promptLabel = '[E] Connect Root';

  private readonly scene: Phaser.Scene;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly statusRing: Phaser.GameObjects.Arc;
  private readonly connection: ResonanceConnection;
  private readonly conditionKey: string;
  private readonly puzzleSystem: PuzzleSystem;
  private isConnected = false;

  constructor(scene: Phaser.Scene, options: ResonanceRootOptions) {
    this.id = options.id;
    this.scene = scene;
    this.connection = options.connection;
    this.conditionKey = options.conditionKey;
    this.puzzleSystem = options.puzzleSystem;

    this.sprite = scene.add
      .sprite(options.x, options.y, TEXTURE_KEYS.GROWTH_POINT, 0)
      .setDepth(1);

    this.statusRing = scene.add
      .circle(options.x, options.y, 18)
      .setStrokeStyle(2, 0x4ade80, 0.75)
      .setDepth(1)
      .setVisible(false);
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  canActivate(critterId: CritterId): boolean {
    return critterId === this.requiredCritter && !this.isConnected;
  }

  isRootConnected(): boolean {
    return this.isConnected;
  }

  activate(): void {
    if (this.isConnected) {
      return;
    }

    this.isConnected = true;
    this.sprite.setFrame(1);
    this.statusRing.setVisible(true);

    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1, 1);
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 1.22,
      duration: 130,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    this.connection.establish();
    this.puzzleSystem.setCondition(this.conditionKey, true);
  }

  reset(): void {
    this.isConnected = false;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1, 1);
    this.sprite.setFrame(0);
    this.statusRing.setVisible(false);
    this.connection.reset();
  }
}

