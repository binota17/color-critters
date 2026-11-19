import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../../config/constants';
import { PuzzleConditionListener, PuzzleSystem } from '../../systems/PuzzleSystem';
import { Critter } from '../critters/Critter';

export interface ExitGateOptions {
  x: number;
  bottomY: number;
  requiredConditions: string[];
  puzzleSystem: PuzzleSystem;
}

/**
 * Exit Gate that unlocks when required puzzle conditions are met and completes
 * the puzzle when a Critter reaches it.
 */
export class ExitGate implements PuzzleConditionListener {
  private readonly scene: Phaser.Scene;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly triggerBounds: Phaser.Geom.Rectangle;
  private readonly requiredConditions: string[];
  private readonly puzzleSystem: PuzzleSystem;
  private isUnlocked = false;

  constructor(scene: Phaser.Scene, options: ExitGateOptions) {
    this.scene = scene;
    this.requiredConditions = [...options.requiredConditions];
    this.puzzleSystem = options.puzzleSystem;

    this.sprite = scene.add
      .sprite(options.x, options.bottomY - 24, TEXTURE_KEYS.EXIT_GATE, 0)
      .setDepth(1);

    this.triggerBounds = new Phaser.Geom.Rectangle(options.x - 12, options.bottomY - 44, 24, 44);
    this.puzzleSystem.registerListener(this);
  }

  onPuzzleConditionsChanged(system: PuzzleSystem): void {
    const unlockedNow = system.areConditionsMet(this.requiredConditions);
    if (unlockedNow === this.isUnlocked) {
      return;
    }

    this.isUnlocked = unlockedNow;
    this.sprite.setFrame(unlockedNow ? 1 : 0);

    this.scene.tweens.killTweensOf(this.sprite);
    if (unlockedNow) {
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 1.06,
        scaleY: 1.04,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      this.sprite.setScale(1, 1);
    }
  }

  update(critters: readonly Critter[]): void {
    if (!this.isUnlocked || this.puzzleSystem.isCompleted()) {
      return;
    }

    const reached = critters.some((critter) =>
      Phaser.Geom.Intersects.RectangleToRectangle(critter.getBounds(), this.triggerBounds),
    );

    if (reached) {
      this.puzzleSystem.markCompleted();
    }
  }

  reset(): void {
    this.isUnlocked = false;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1, 1);
    this.sprite.setFrame(0);
  }
}
