import Phaser from 'phaser';
import {
  COLORS,
  CRITTER_IDS,
  CritterId,
  GAME_HEIGHT,
  GAME_WIDTH,
  TEXTURE_KEYS,
  TILE_SIZE,
} from '../config/constants';
import { Critter } from '../entities/critters/Critter';
import { ExitGate } from '../entities/objects/ExitGate';
import { ResonanceConnection } from '../entities/objects/ResonanceConnection';
import { ResonanceRelay } from '../entities/objects/ResonanceRelay';
import { ResonanceRoot } from '../entities/objects/ResonanceRoot';
import { AudioManager } from '../managers/AudioManager';
import { AbilitySystem } from '../systems/AbilitySystem';
import { CritterController } from '../systems/CritterController';
import { CritterSwitchSystem } from '../systems/CritterSwitchSystem';
import { InputManager } from '../systems/InputManager';
import { PuzzleSystem } from '../systems/PuzzleSystem';
import { EffectsHelper } from '../ui/EffectsHelper';
import { GameplayHud } from '../ui/GameplayHud';
import { publishDevGameState } from '../utils/devDebugHook';

const PROTOTYPE_TITLE = 'Twin Resonance Prototype';

/**
 * CC-017 Standalone Twin Resonance Prototype Scene.
 * Demonstrates MOSS establishing a biological Resonance Vine connection at ResonanceRoot,
 * followed by ZIPPY transmitting an Electric Pulse through ResonanceRelay to unlock the Gate.
 * Accessible via ?scene=TwinResonanceScene.
 */
export class TwinResonanceScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private switchSystem!: CritterSwitchSystem;
  private abilitySystem!: AbilitySystem;
  private puzzleSystem!: PuzzleSystem;
  private audioManager!: AudioManager;
  private effects!: EffectsHelper;
  private hud!: GameplayHud;
  private critters!: Critter[];
  private controllers!: Record<CritterId, CritterController>;
  private resonanceRoot!: ResonanceRoot;
  private resonanceConnection!: ResonanceConnection;
  private resonanceRelay!: ResonanceRelay;
  private activeIndicator!: Phaser.GameObjects.Triangle;
  private promptText!: Phaser.GameObjects.Text;
  private runDustTimerMs = 0;
  private groundTopY = 0;

  constructor() {
    super({ key: 'TwinResonanceScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.SKY);
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT, true, true, false, false);

    this.groundTopY = GAME_HEIGHT - TILE_SIZE * 2; // 476
    this.audioManager = new AudioManager();
    this.effects = new EffectsHelper(this);

    this.createBackdrop(this.groundTopY);
    const platforms = this.createGround(this.groundTopY);

    this.puzzleSystem = new PuzzleSystem({
      'resonance-connected': false,
      'resonance-powered': false,
    });

    const rootX = 9 * TILE_SIZE + TILE_SIZE / 2;
    const relayX = 19 * TILE_SIZE + TILE_SIZE / 2;
    const nodeY = this.groundTopY - TILE_SIZE / 2;
    const gateX = 25 * TILE_SIZE + TILE_SIZE / 2;

    this.resonanceConnection = new ResonanceConnection(this, {
      startX: rootX,
      startY: nodeY - 6,
      endX: relayX,
      endY: nodeY - 6,
    });

    this.resonanceRoot = new ResonanceRoot(this, {
      id: 'resonance-root-1',
      x: rootX,
      y: nodeY,
      connection: this.resonanceConnection,
      conditionKey: 'resonance-connected',
      puzzleSystem: this.puzzleSystem,
    });

    this.resonanceRelay = new ResonanceRelay(this, {
      id: 'resonance-relay-1',
      x: relayX,
      y: nodeY,
      connection: this.resonanceConnection,
      conditionKey: 'resonance-powered',
      puzzleSystem: this.puzzleSystem,
      onPowered: () => {
        this.audioManager.playDoorToggle(true);
        this.effects.spawnSwitchRing(gateX, this.groundTopY - 24, 0x38bdf8);
        this.puzzleSystem.markCompleted();
      },
    });

    new ExitGate(this, {
      x: gateX,
      bottomY: this.groundTopY,
      requiredConditions: ['resonance-powered'],
      puzzleSystem: this.puzzleSystem,
    });

    this.abilitySystem = new AbilitySystem([this.resonanceRoot, this.resonanceRelay]);

    const moss = new Critter(this, {
      id: CRITTER_IDS.MOSS,
      displayName: 'MOSS',
      spawnPoint: { x: 3 * TILE_SIZE + TILE_SIZE / 2, y: this.groundTopY - TILE_SIZE / 2 },
      textureKey: TEXTURE_KEYS.MOSS_SHEET,
    });

    const zippy = new Critter(this, {
      id: CRITTER_IDS.ZIPPY,
      displayName: 'ZIPPY',
      spawnPoint: { x: 5 * TILE_SIZE + TILE_SIZE / 2, y: this.groundTopY - TILE_SIZE / 2 },
      textureKey: TEXTURE_KEYS.ZIPPY_SHEET,
    });

    this.critters = [moss, zippy];
    this.physics.add.collider(this.critters, platforms);

    this.controllers = {
      [CRITTER_IDS.MOSS]: new CritterController(moss),
      [CRITTER_IDS.ZIPPY]: new CritterController(zippy),
    };

    this.switchSystem = new CritterSwitchSystem(this.critters, CRITTER_IDS.MOSS);
    this.inputManager = new InputManager(this);

    this.createHints(rootX, relayX, gateX);
    this.createHud();

    this.puzzleSystem.onComplete(() => {
      for (const critter of this.critters) {
        critter.setVelocity(0, 0);
      }
      const active = this.switchSystem.getActiveCritter();
      this.effects.spawnAbilityBurst(active.x, active.y, 0x22c55e);
      this.hud.setCompleteVisible(true);
      this.audioManager.playComplete();
      this.updateVisualIndicators();
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.audioManager.destroy();
    });

    this.updateVisualIndicators();
  }

  update(_time: number, delta: number): void {
    const input = this.inputManager.readInput();

    if (input.resetPressed) {
      this.resetPrototype();
      return;
    }

    if (this.puzzleSystem.isCompleted()) {
      this.publishState();
      return;
    }

    let switched = false;
    if (input.selectMossPressed) {
      switched = this.switchSystem.select(CRITTER_IDS.MOSS);
    } else if (input.selectZippyPressed) {
      switched = this.switchSystem.select(CRITTER_IDS.ZIPPY);
    } else if (input.switchPressed) {
      this.switchSystem.switchNext();
      switched = true;
    }

    if (switched) {
      this.audioManager.playSwitch();
      const active = this.switchSystem.getActiveCritter();
      this.effects.spawnSwitchRing(
        active.x,
        active.y,
        active.id === CRITTER_IDS.MOSS ? 0x4ade80 : 0xfacc15,
      );
    }

    this.abilitySystem.update(delta);
    const activeCritter = this.switchSystem.getActiveCritter();

    if (input.abilityPressed) {
      const result = this.abilitySystem.tryUseAbility(activeCritter);
      if (result.success) {
        this.effects.spawnAbilityBurst(activeCritter.x, activeCritter.y, result.effectColor);
        if (activeCritter.id === CRITTER_IDS.MOSS) {
          this.audioManager.playGrowVine();
        } else {
          this.audioManager.playElectricPulse();
        }
      } else {
        this.audioManager.playAbilityFail();
      }
      this.effects.spawnFloatingText(
        activeCritter.x,
        activeCritter.y - 34,
        result.message,
        result.success,
      );
    }

    const activeResult = this.controllers[activeCritter.id].update(delta, input);
    if (activeResult.justJumped) {
      this.audioManager.playJump();
      this.effects.spawnDustPuff(activeCritter.x, activeCritter.y + 14, 4);
    } else if (activeResult.justLanded) {
      this.audioManager.playLand();
      this.effects.spawnDustPuff(activeCritter.x, activeCritter.y + 14, 5);
    }

    if (activeResult.isRunningOnGround) {
      this.runDustTimerMs += delta;
      if (this.runDustTimerMs >= 160) {
        this.runDustTimerMs = 0;
        this.effects.spawnDustPuff(activeCritter.x, activeCritter.y + 14, 2);
      }
    } else {
      this.runDustTimerMs = 0;
    }

    for (const inactiveCritter of this.switchSystem.getInactiveCritters()) {
      this.controllers[inactiveCritter.id].update(delta, null);
    }

    this.updateVisualIndicators();
  }

  private resetPrototype(): void {
    this.controllers[CRITTER_IDS.MOSS].reset();
    this.controllers[CRITTER_IDS.ZIPPY].reset();
    this.switchSystem.reset();
    this.abilitySystem.reset();
    this.puzzleSystem.reset();
    this.runDustTimerMs = 0;
    this.hud.setCompleteVisible(false);
    this.updateVisualIndicators();
  }

  private createBackdrop(groundTopY: number): void {
    this.add.image(140, 110, TEXTURE_KEYS.CLOUD).setAlpha(0.85).setDepth(-30);
    this.add.image(520, 92, TEXTURE_KEYS.CLOUD).setScale(1.15).setAlpha(0.85).setDepth(-30);
    this.add.image(810, 128, TEXTURE_KEYS.CLOUD).setScale(0.9).setAlpha(0.85).setDepth(-30);

    for (let x = 0; x < GAME_WIDTH; x += 320) {
      this.add.image(x + 160, groundTopY - 48, TEXTURE_KEYS.BG_HILLS).setDepth(-20);
      this.add.image(x + 160, groundTopY - 64, TEXTURE_KEYS.BG_CANOPY).setDepth(-10);
    }

    const placeProp = (key: string, frame: number, col: number) => {
      this.add
        .image(Math.round(col * TILE_SIZE), groundTopY, key, frame)
        .setOrigin(0.5, 1)
        .setDepth(0);
    };
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 3, 1.0);
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 0, 7.2);
    placeProp(TEXTURE_KEYS.PROPS_ROCKS, 3, 14.5);
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 2, 21.8);
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 3, 28.5);
  }

  private createGround(groundTopY: number): Phaser.Physics.Arcade.StaticGroup {
    const platforms = this.physics.add.staticGroup();
    const totalColumns = Math.ceil(GAME_WIDTH / TILE_SIZE);

    for (let col = 0; col < totalColumns; col += 1) {
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      const topFrame = col >= 23 ? (col === 23 ? 39 : 25) : col % 4 === 2 ? 3 : 1;
      const botFrame = col >= 23 ? 28 : 8 + (col % 3);
      platforms.create(x, groundTopY + TILE_SIZE * 0.5, TEXTURE_KEYS.CORE_TERRAIN, topFrame);
      platforms.create(x, groundTopY + TILE_SIZE * 1.5, TEXTURE_KEYS.CORE_TERRAIN, botFrame);
    }

    platforms.refresh();
    return platforms;
  }

  private createHints(rootX: number, relayX: number, gateX: number): void {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#1e293b',
      backgroundColor: '#e0f2fe',
      padding: { x: 5, y: 2 },
    };
    this.add.text(rootX, this.groundTopY - 78, '1. MOSS: Connect Root [E]', style).setOrigin(0.5).setDepth(1);
    this.add.text(relayX, this.groundTopY - 78, '2. ZIPPY: Power Relay [E]', style).setOrigin(0.5).setDepth(1);
    this.add.text(gateX, this.groundTopY - 78, 'RESONANCE GATE', style).setOrigin(0.5).setDepth(1);
  }

  private createHud(): void {
    this.hud = new GameplayHud(this, PROTOTYPE_TITLE);

    this.activeIndicator = this.add
      .triangle(0, 0, 0, 0, 10, 0, 5, 7, 0xffffff)
      .setStrokeStyle(2, 0x0f172a)
      .setDepth(3);

    this.promptText = this.add
      .text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#0f172a',
        backgroundColor: '#fef9c3',
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(4)
      .setVisible(false);
  }

  private updateVisualIndicators(): void {
    const active = this.switchSystem.getActiveCritter();
    const inactive = this.switchSystem.getInactiveCritters()[0] ?? active;

    this.activeIndicator.setPosition(active.x, active.y - 24);
    this.activeIndicator.setFillStyle(active.id === CRITTER_IDS.MOSS ? 0x4ade80 : 0xfacc15);

    const nearby = this.abilitySystem.findNearestValidTarget(active);
    if (nearby && !this.puzzleSystem.isCompleted()) {
      this.promptText.setText(nearby.promptLabel);
      this.promptText.setPosition(active.x, active.y - 42);
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    const connected = this.resonanceRoot.isRootConnected();
    const powered = this.resonanceRelay.isRelayPowered();

    this.hud.update({
      active,
      inactive,
      abilityName: this.abilitySystem.getAbilityName(active.id),
      cooldownMs: this.abilitySystem.getCooldownRemainingMs(active.id),
      plateOn: connected,
      nodeOn: powered,
    });

    this.publishState();
  }

  private publishState(): void {
    const moss = this.critters.find((c) => c.id === CRITTER_IDS.MOSS);
    const zippy = this.critters.find((c) => c.id === CRITTER_IDS.ZIPPY);
    const active = this.switchSystem.getActiveCritter();
    const powered = this.resonanceRelay.isRelayPowered();

    publishDevGameState({
      scene: 'TwinResonanceScene',
      activeCritter: active.id,
      moss: moss
        ? { x: Math.round(moss.x), y: Math.round(moss.y), state: moss.critterState, facing: moss.facing }
        : undefined,
      zippy: zippy
        ? { x: Math.round(zippy.x), y: Math.round(zippy.y), state: zippy.critterState, facing: zippy.facing }
        : undefined,
      resonance: {
        rootConnected: this.resonanceRoot.isRootConnected(),
        vineVisible: this.resonanceConnection.isVisible(),
        energyTransmitting: this.resonanceConnection.isTransmitting(),
        relayPowered: powered,
        gateUnlocked: powered,
        completed: this.puzzleSystem.isCompleted(),
      },
    });
  }
}
