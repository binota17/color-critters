import Phaser from 'phaser';
import { TEXTURE_KEYS } from '../../config/constants';
import { Critter } from '../critters/Critter';
import { PuzzleSystem } from '../../systems/PuzzleSystem';

export interface PressurePlateOptions {
  x: number;
  y: number;
  conditionKey: string;
  puzzleSystem: PuzzleSystem;
}

/**
 * Weight-triggered Pressure Plate that sets a PuzzleSystem condition while
 * at least one Critter (active or inactive) stands on it.
 */
export class PressurePlate {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly triggerBounds: Phaser.Geom.Rectangle;
  private readonly conditionKey: string;
  private readonly puzzleSystem: PuzzleSystem;
  private isPressed = false;

  constructor(scene: Phaser.Scene, options: PressurePlateOptions) {
    this.conditionKey = options.conditionKey;
    this.puzzleSystem = options.puzzleSystem;

    this.sprite = scene.add
      .sprite(options.x, options.y, TEXTURE_KEYS.PRESSURE_PLATE, 0)
      .setDepth(1);

    // Trigger zone covers the upper button area of the 32x32 tile
    this.triggerBounds = new Phaser.Geom.Rectangle(options.x - 12, options.y + 2, 24, 14);
  }

  update(critters: readonly Critter[]): void {
    const pressedNow = critters.some((critter) =>
      Phaser.Geom.Intersects.RectangleToRectangle(critter.getBounds(), this.triggerBounds),
    );

    if (pressedNow === this.isPressed) {
      return;
    }

    this.isPressed = pressedNow;
    this.sprite.setFrame(pressedNow ? 1 : 0);
    this.puzzleSystem.setCondition(this.conditionKey, pressedNow);
  }

  reset(): void {
    this.isPressed = false;
    this.sprite.setFrame(0);
  }
}
