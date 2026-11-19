import Phaser from 'phaser';
import { CRITTER_IDS, CritterId, TEXTURE_KEYS } from '../../config/constants';
import { PuzzleSystem } from '../../systems/PuzzleSystem';
import { InteractableObject } from './InteractableObject';

export interface ElectricNodeOptions {
  id: string;
  x: number;
  y: number;
  conditionKey: string;
  puzzleSystem: PuzzleSystem;
}

/**
 * Electric Node interactable for ZIPPY: toggles a PuzzleSystem condition flag.
 */
export class ElectricNode implements InteractableObject {
  readonly id: string;
  readonly requiredCritter: CritterId = CRITTER_IDS.ZIPPY;
  readonly interactionRadius = 48;
  readonly promptLabel = '[E] Electric Pulse';

  private readonly scene: Phaser.Scene;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly conditionKey: string;
  private readonly puzzleSystem: PuzzleSystem;
  private isPowered = false;

  constructor(scene: Phaser.Scene, options: ElectricNodeOptions) {
    this.id = options.id;
    this.scene = scene;
    this.conditionKey = options.conditionKey;
    this.puzzleSystem = options.puzzleSystem;
    this.sprite = scene.add
      .sprite(options.x, options.y, TEXTURE_KEYS.ELECTRIC_NODE, 0)
      .setDepth(1);
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  canActivate(critterId: CritterId): boolean {
    return critterId === this.requiredCritter;
  }

  activate(): void {
    this.isPowered = !this.isPowered;
    this.sprite.setFrame(this.isPowered ? 1 : 0);
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 1.2,
      duration: 110,
      yoyo: true,
      ease: 'Cubic.easeOut',
    });
    this.puzzleSystem.setCondition(this.conditionKey, this.isPowered);
  }

  reset(): void {
    this.isPowered = false;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1, 1);
    this.sprite.setFrame(0);
  }
}
