import Phaser from 'phaser';
import { CRITTER_IDS, CritterId, TEXTURE_KEYS, TILE_SIZE } from '../../config/constants';
import { PuzzleSystem } from '../../systems/PuzzleSystem';
import { InteractableObject } from './InteractableObject';

export interface GrowthPointOptions {
  id: string;
  x: number;
  y: number;
  bridgeStartX: number;
  bridgeY: number;
  bridgeTileCount: number;
  solidGroup: Phaser.Physics.Arcade.StaticGroup;
  conditionKey?: string;
  puzzleSystem?: PuzzleSystem;
}

/**
 * Growth Point interactable for MOSS: grows a solid vine bridge across a gap.
 */
export class GrowthPoint implements InteractableObject {
  readonly id: string;
  readonly requiredCritter: CritterId = CRITTER_IDS.MOSS;
  readonly interactionRadius = 48;
  readonly promptLabel = '[E] Grow Vine';

  private readonly scene: Phaser.Scene;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly vineTiles: Phaser.Physics.Arcade.Image[] = [];
  private readonly conditionKey?: string;
  private readonly puzzleSystem?: PuzzleSystem;
  private isActivated = false;

  constructor(scene: Phaser.Scene, options: GrowthPointOptions) {
    this.id = options.id;
    this.scene = scene;
    this.conditionKey = options.conditionKey;
    this.puzzleSystem = options.puzzleSystem;

    this.sprite = scene.add
      .sprite(options.x, options.y, TEXTURE_KEYS.GROWTH_POINT, 0)
      .setDepth(1);

    for (let i = 0; i < options.bridgeTileCount; i += 1) {
      const tileX = options.bridgeStartX + i * TILE_SIZE;
      const tile = options.solidGroup.create(
        tileX,
        options.bridgeY,
        TEXTURE_KEYS.VINE_TILE,
      ) as Phaser.Physics.Arcade.Image;
      tile.disableBody(true, true);
      this.vineTiles.push(tile);
    }
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  canActivate(critterId: CritterId): boolean {
    return critterId === this.requiredCritter && !this.isActivated;
  }

  activate(): void {
    if (this.isActivated) {
      return;
    }

    this.isActivated = true;
    this.sprite.setFrame(1);
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 1.22,
      duration: 130,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    if (this.conditionKey && this.puzzleSystem) {
      this.puzzleSystem.setCondition(this.conditionKey, true);
    }

    this.vineTiles.forEach((tile, index) => {
      tile.enableBody(false, tile.x, tile.y, true, true);
      tile.setScale(1, 0.2);
      this.scene.tweens.add({
        targets: tile,
        scaleY: 1,
        duration: 180,
        delay: index * 45,
        ease: 'Back.easeOut',
      });
    });
  }

  reset(): void {
    this.isActivated = false;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1, 1);
    this.sprite.setFrame(0);

    for (const tile of this.vineTiles) {
      this.scene.tweens.killTweensOf(tile);
      tile.setScale(1, 1);
      tile.disableBody(true, true);
    }
  }
}
