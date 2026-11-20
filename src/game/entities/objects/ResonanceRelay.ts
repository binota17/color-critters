import Phaser from 'phaser';
import { CRITTER_IDS, CritterId, TEXTURE_KEYS } from '../../config/constants';
import { PuzzleSystem } from '../../systems/PuzzleSystem';
import { InteractableObject } from './InteractableObject';
import { ResonanceConnection } from './ResonanceConnection';

export interface ResonanceRelayOptions {
  id: string;
  x: number;
  y: number;
  connection: ResonanceConnection;
  conditionKey: string;
  puzzleSystem: PuzzleSystem;
  onPowered?: () => void;
}

/**
 * Resonance Relay interactable for ZIPPY: requires an established ResonanceConnection
 * before ZIPPY can transmit an Electric Pulse to power the relay and unlock the target gate.
 */
export class ResonanceRelay implements InteractableObject {
  readonly id: string;
  readonly requiredCritter: CritterId = CRITTER_IDS.ZIPPY;
  readonly interactionRadius = 48;
  readonly promptLabel = '[E] Power Relay';

  private readonly scene: Phaser.Scene;
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly statusAura: Phaser.GameObjects.Image;
  private readonly connection: ResonanceConnection;
  private readonly conditionKey: string;
  private readonly puzzleSystem: PuzzleSystem;
  private readonly onPowered?: () => void;
  private isReceiving = false;
  private isPowered = false;

  constructor(scene: Phaser.Scene, options: ResonanceRelayOptions) {
    this.id = options.id;
    this.scene = scene;
    this.connection = options.connection;
    this.conditionKey = options.conditionKey;
    this.puzzleSystem = options.puzzleSystem;
    this.onPowered = options.onPowered;

    this.sprite = scene.add
      .sprite(options.x, options.y, TEXTURE_KEYS.RESONANCE_RELAY, 0)
      .setDepth(1);

    this.statusAura = scene.add
      .image(options.x, options.y, TEXTURE_KEYS.RESONANCE_AURA, 1)
      .setDepth(1)
      .setVisible(false);
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  canActivate(critterId: CritterId): boolean {
    return (
      critterId === this.requiredCritter &&
      this.connection.isConnected() &&
      !this.isReceiving &&
      !this.isPowered
    );
  }

  getBlockedReason(critterId: CritterId): string | null {
    if (critterId !== this.requiredCritter) {
      return null;
    }
    if (!this.connection.isConnected()) {
      return 'Connect Root first';
    }
    return null;
  }

  isRelayPowered(): boolean {
    return this.isPowered;
  }

  activate(): void {
    if (!this.connection.isConnected() || this.isReceiving || this.isPowered) {
      return;
    }

    this.isReceiving = true;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1, 1);
    this.scene.tweens.add({
      targets: this.sprite,
      scale: 1.15,
      duration: 120,
      yoyo: true,
      ease: 'Cubic.easeOut',
    });

    this.connection.transmitEnergy(() => {
      this.isReceiving = false;
      this.isPowered = true;
      this.sprite.setFrame(1);
      this.statusAura.setVisible(true);
      this.puzzleSystem.setCondition(this.conditionKey, true);
      this.onPowered?.();
    });
  }

  reset(): void {
    this.isReceiving = false;
    this.isPowered = false;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setScale(1, 1);
    this.sprite.setFrame(0);
    this.statusAura.setVisible(false);
  }
}

