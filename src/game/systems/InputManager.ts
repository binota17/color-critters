import Phaser from 'phaser';

export interface InputState {
  moveX: -1 | 0 | 1;
  jumpPressed: boolean;
  abilityPressed: boolean;
  resetPressed: boolean;
  switchPressed: boolean;
  selectMossPressed: boolean;
  selectZippyPressed: boolean;
  pausePressed: boolean;
  confirmPressed: boolean;
  nextPressed: boolean;
  menuPressed: boolean;
}

/**
 * Reads raw keyboard input for movement, jump, switching, pause, and menu actions without gameplay rules.
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
  private readonly pauseKey: Phaser.Input.Keyboard.Key | null;
  private readonly confirmKey: Phaser.Input.Keyboard.Key | null;
  private readonly nextKey: Phaser.Input.Keyboard.Key | null;
  private readonly menuKey: Phaser.Input.Keyboard.Key | null;
  private readonly pending = new Set<Phaser.Input.Keyboard.Key>();

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
      this.pauseKey = null;
      this.confirmKey = null;
      this.nextKey = null;
      this.menuKey = null;
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
    this.jumpKey = this.bindPress(keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE));
    this.abilityKey = this.bindPress(keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E));
    this.resetKey = this.bindPress(keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R));
    // Capture Tab so browser focus does not leave the game canvas
    this.switchKey = this.bindPress(keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB, true));
    this.selectMossKey = this.bindPress(keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE));
    this.selectZippyKey = this.bindPress(keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO));
    this.pauseKey = this.bindPress(keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC));
    this.confirmKey = this.bindPress(keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER));
    this.nextKey = this.bindPress(keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N));
    this.menuKey = this.bindPress(keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M));
  }

  private bindPress(key: Phaser.Input.Keyboard.Key): Phaser.Input.Keyboard.Key {
    key.on('down', () => {
      this.pending.add(key);
    });
    return key;
  }

  private consumePress(key: Phaser.Input.Keyboard.Key | null): boolean {
    if (!key) {
      return false;
    }
    const justDown = Phaser.Input.Keyboard.JustDown(key);
    const latched = this.pending.delete(key);
    return justDown || latched;
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
      jumpPressed: this.consumePress(this.jumpKey),
      abilityPressed: this.consumePress(this.abilityKey),
      resetPressed: this.consumePress(this.resetKey),
      switchPressed: this.consumePress(this.switchKey),
      selectMossPressed: this.consumePress(this.selectMossKey),
      selectZippyPressed: this.consumePress(this.selectZippyKey),
      pausePressed: this.consumePress(this.pauseKey),
      confirmPressed: this.consumePress(this.confirmKey),
      nextPressed: this.consumePress(this.nextKey),
      menuPressed: this.consumePress(this.menuKey),
    };
  }
}
