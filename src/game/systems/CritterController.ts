import Phaser from 'phaser';
import { PHYSICS_CONFIG } from '../config/physicsConfig';
import { Critter } from '../entities/critters/Critter';
import { InputState } from './InputManager';

export type MovementInput = Pick<InputState, 'moveX' | 'jumpPressed'>;

export interface ControllerStepResult {
  justJumped: boolean;
  justLanded: boolean;
  isRunningOnGround: boolean;
}

/**
 * Controls Critter horizontal movement, single jump with coyote time and jump buffer,
 * max fall speed, state transitions, reset, and respawn.
 */
export class CritterController {
  private readonly critter: Critter;
  private coyoteTimerMs = 0;
  private jumpBufferTimerMs = 0;
  private wasGrounded = false;
  private airborneMs = 0;

  constructor(critter: Critter) {
    this.critter = critter;
  }

  update(deltaMs: number, input: MovementInput | null): ControllerStepResult {
    const body = this.critter.body as Phaser.Physics.Arcade.Body;
    const isGrounded = body.blocked.down;
    const justLanded = isGrounded && !this.wasGrounded && this.airborneMs >= 90;

    if (isGrounded) {
      this.airborneMs = 0;
    } else {
      this.airborneMs += deltaMs;
    }

    let didJump = false;

    if (input) {
      if (isGrounded) {
        this.coyoteTimerMs = PHYSICS_CONFIG.COYOTE_TIME_MS;
      } else {
        this.coyoteTimerMs = Math.max(0, this.coyoteTimerMs - deltaMs);
      }

      if (input.jumpPressed) {
        this.jumpBufferTimerMs = PHYSICS_CONFIG.JUMP_BUFFER_MS;
      } else {
        this.jumpBufferTimerMs = Math.max(0, this.jumpBufferTimerMs - deltaMs);
      }

      this.critter.setVelocityX(input.moveX * PHYSICS_CONFIG.MOVE_SPEED);

      if (input.moveX < 0) {
        this.critter.setFacing('left');
      } else if (input.moveX > 0) {
        this.critter.setFacing('right');
      }

      if (this.jumpBufferTimerMs > 0 && this.coyoteTimerMs > 0) {
        this.critter.setVelocityY(PHYSICS_CONFIG.JUMP_VELOCITY);
        this.jumpBufferTimerMs = 0;
        this.coyoteTimerMs = 0;
        didJump = true;
      }
    } else {
      this.coyoteTimerMs = 0;
      this.jumpBufferTimerMs = 0;
      this.critter.setVelocityX(0);
    }

    if (body.velocity.y > PHYSICS_CONFIG.MAX_FALL_SPEED) {
      body.setVelocityY(PHYSICS_CONFIG.MAX_FALL_SPEED);
    }

    if (this.critter.y > PHYSICS_CONFIG.RESPAWN_Y_THRESHOLD) {
      this.reset();
      return { justJumped: false, justLanded: false, isRunningOnGround: false };
    }

    const groundedAfterAction = isGrounded && !didJump;
    if (groundedAfterAction) {
      const moveX = input?.moveX ?? 0;
      this.critter.critterState = moveX !== 0 ? 'RUNNING' : 'IDLE';
    } else {
      this.critter.critterState = body.velocity.y < 0 ? 'JUMPING' : 'FALLING';
    }

    this.wasGrounded = groundedAfterAction;
    this.critter.updateVisualAnimation(deltaMs, didJump, justLanded);

    return {
      justJumped: didJump,
      justLanded,
      isRunningOnGround: this.critter.critterState === 'RUNNING',
    };
  }

  reset(): void {
    this.coyoteTimerMs = 0;
    this.jumpBufferTimerMs = 0;
    this.wasGrounded = false;
    this.airborneMs = 0;
    this.critter.resetToSpawn();
  }
}
