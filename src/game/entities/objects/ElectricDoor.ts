import Phaser from 'phaser';
import { TEXTURE_KEYS, TILE_SIZE } from '../../config/constants';
import { PuzzleConditionListener, PuzzleSystem } from '../../systems/PuzzleSystem';

export interface ElectricDoorOptions {
  x: number;
  bottomY: number;
  heightTiles: number;
  solidGroup: Phaser.Physics.Arcade.StaticGroup;
  requiredConditions: string[];
  puzzleSystem: PuzzleSystem;
}

/**
 * Condition-driven Electric Door controlled by PuzzleSystem conditions.
 */
export class ElectricDoor implements PuzzleConditionListener {
  private readonly scene: Phaser.Scene;
  private readonly tiles: Phaser.Physics.Arcade.Image[] = [];
  private readonly requiredConditions: string[];
  private isOpen = false;

  constructor(scene: Phaser.Scene, options: ElectricDoorOptions) {
    this.scene = scene;
    this.requiredConditions = [...options.requiredConditions];

    for (let i = 0; i < options.heightTiles; i += 1) {
      const tileY = options.bottomY - TILE_SIZE / 2 - i * TILE_SIZE;
      const tile = options.solidGroup.create(
        options.x,
        tileY,
        TEXTURE_KEYS.ELECTRIC_DOOR_TILE,
      ) as Phaser.Physics.Arcade.Image;
      this.tiles.push(tile);
    }

    options.puzzleSystem.registerListener(this);
  }

  onPuzzleConditionsChanged(system: PuzzleSystem): void {
    this.setOpen(system.areConditionsMet(this.requiredConditions));
  }

  setOpen(open: boolean): void {
    if (this.isOpen === open) {
      return;
    }

    this.isOpen = open;
    for (const tile of this.tiles) {
      const body = tile.body as Phaser.Physics.Arcade.StaticBody;
      body.enable = !open;
      this.scene.tweens.killTweensOf(tile);
      this.scene.tweens.add({
        targets: tile,
        alpha: open ? 0.2 : 1,
        scaleX: open ? 0.55 : 1,
        duration: 180,
        ease: 'Cubic.easeOut',
      });
    }
  }

  getIsOpen(): boolean {
    return this.isOpen;
  }

  reset(): void {
    this.isOpen = false;
    for (const tile of this.tiles) {
      this.scene.tweens.killTweensOf(tile);
      const body = tile.body as Phaser.Physics.Arcade.StaticBody;
      body.enable = true;
      tile.setAlpha(1);
      tile.setScale(1, 1);
    }
  }
}
