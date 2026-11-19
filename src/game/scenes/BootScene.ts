import Phaser from 'phaser';
import { SCENE_KEYS } from '../config/constants';

/**
 * Initial boot scene responsible for basic setup before asset loading.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  create(): void {
    this.scene.start(SCENE_KEYS.PRELOAD);
  }
}
