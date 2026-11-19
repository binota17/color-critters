import Phaser from 'phaser';

export interface InputState {
  moveX: -1 | 0 | 1;
  jumpPressed: boolean;
  abilityPressed: boolean;
  resetPressed: boolean;
  switchPressed: boolean;
  selectMossPressed: boolean;
  selectZippyPressed: boolean;
}

/**
 * Reads raw keyboard input for movement, jump, switching, and reset without gameplay rules.
 */
export class InputManager {
  private readonly leftKeys: Phaser.Input.Keyboard.Key[];
  private readonly rightKeys: Phaser.Input.Keyboard.Key[];
  private readonly jumpKey: Phaser.Input.Keyboard.Key | null;
  private readonly abilityKey: Phaser.Input.Keyboard.Key | null;
  private readonly resetKey: Phaser.Input.Keyboard.Key | null;
  private readonly switchKey: Phaser.Input.Keyboard.Key | null;
  private readonly selectMossKey: Phaser.Input.Keyboard.Key | null;
  private readonly selectZippyKey: Phaser.Input.Keyboard.Key | null;

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      this.leftKeys = [];
      this.rightKeys = [];
      this.jumpKey = null;
      this.abilityKey = null;
      this.resetKey = null;
      this.switchKey = null;
      this.selectMossKey = null;
      this.selectZippyKey = null;
      return;
    }

    this.leftKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    ];
    this.rightKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    ];
    this.jumpKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.abilityKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.resetKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    // Capture Tab so browser focus does not leave the game canvas
    this.switchKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true);
    this.selectMossKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.selectZippyKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
  }

  readInput(): InputState {
    const movingLeft = this.leftKeys.some((key) => key.isDown);
    const movingRight = this.rightKeys.some((key) => key.isDown);

    let moveX: -1 | 0 | 1 = 0;
    if (movingLeft && !movingRight) {
      moveX = -1;
    } else if (movingRight && !movingLeft) {
      moveX = 1;
    }

    return {
      moveX,
      jumpPressed: this.jumpKey ? Phaser.Input.Keyboard.JustDown(this.jumpKey) : false,
      abilityPressed: this.abilityKey ? Phaser.Input.Keyboard.JustDown(this.abilityKey) : false,
      resetPressed: this.resetKey ? Phaser.Input.Keyboard.JustDown(this.resetKey) : false,
      switchPressed: this.switchKey ? Phaser.Input.Keyboard.JustDown(this.switchKey) : false,
      selectMossPressed: this.selectMossKey
        ? Phaser.Input.Keyboard.JustDown(this.selectMossKey)
        : false,
      selectZippyPressed: this.selectZippyKey
        ? Phaser.Input.Keyboard.JustDown(this.selectZippyKey)
        : false,
    };
  }
}
