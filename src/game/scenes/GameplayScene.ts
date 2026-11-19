import Phaser from 'phaser';
import {
  COLORS,
  CRITTER_IDS,
  CritterId,
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENE_KEYS,
  TEXTURE_KEYS,
  TILE_SIZE,
} from '../config/constants';
import { getLevelById } from '../data/levels';
import { Critter } from '../entities/critters/Critter';
import { ElectricDoor } from '../entities/objects/ElectricDoor';
import { ElectricNode } from '../entities/objects/ElectricNode';
import { ExitGate } from '../entities/objects/ExitGate';
import { GrowthPoint } from '../entities/objects/GrowthPoint';
import { InteractableObject } from '../entities/objects/InteractableObject';
import { PressurePlate } from '../entities/objects/PressurePlate';
import { AudioManager } from '../managers/AudioManager';
import { AbilitySystem } from '../systems/AbilitySystem';
import { CritterController } from '../systems/CritterController';
import { CritterSwitchSystem } from '../systems/CritterSwitchSystem';
import { InputManager } from '../systems/InputManager';
import { PuzzleSystem } from '../systems/PuzzleSystem';
import { EffectsHelper } from '../ui/EffectsHelper';
import { GameplayHud } from '../ui/GameplayHud';
import { publishDevGameState } from '../utils/devDebugHook';
import { LevelDefinition } from '../../types/level';

/**
 * Gameplay scene for CC-007: coordinates Level 01, procedural animations,
 * visual effects, polished HUD, and procedural Web Audio SFX.
 */
export class GameplayScene extends Phaser.Scene {
  private level!: LevelDefinition;
  private inputManager!: InputManager;
  private switchSystem!: CritterSwitchSystem;
  private abilitySystem!: AbilitySystem;
  private puzzleSystem!: PuzzleSystem;
  private audioManager!: AudioManager;
  private effects!: EffectsHelper;
  private hud!: GameplayHud;
  private pressurePlates: PressurePlate[] = [];
  private electricDoors: ElectricDoor[] = [];
  private exitGate!: ExitGate;
  private critters!: Critter[];
  private controllers!: Record<CritterId, CritterController>;
  private clouds: Phaser.GameObjects.Image[] = [];
  private wireGraphics!: Phaser.GameObjects.Graphics;
  private activeIndicator!: Phaser.GameObjects.Triangle;
  private promptText!: Phaser.GameObjects.Text;
  private runDustTimerMs = 0;
  private wasDoorOpen = false;
  private groundTopY = 0;

  constructor() {
    super({ key: SCENE_KEYS.GAMEPLAY });
  }

  init(data?: { levelId?: string }): void {
    this.level = getLevelById(data?.levelId);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.SKY);

    // Block horizontal screen edges while allowing falling below the bottom threshold for respawn
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT, true, true, false, false);

    this.groundTopY = GAME_HEIGHT - TILE_SIZE * this.level.groundThicknessTiles;
    this.audioManager = new AudioManager();
    this.effects = new EffectsHelper(this);

    this.createBackgroundDecor(this.groundTopY);
    const platforms = this.buildLevelTerrain(this.groundTopY);

    this.puzzleSystem = new PuzzleSystem(this.level.initialConditions);
    const interactables: InteractableObject[] = [];
    this.pressurePlates = [];
    this.electricDoors = [];
    this.wasDoorOpen = false;

    for (const gpDef of this.level.growthPoints) {
      const gpTopOffset = gpDef.topOffsetTiles ?? 0;
      const bridgeTopOffset = gpDef.bridgeTopOffsetTiles ?? gpTopOffset;
      interactables.push(
        new GrowthPoint(this, {
          id: gpDef.id,
          x: gpDef.col * TILE_SIZE + TILE_SIZE / 2,
          y: this.groundTopY - TILE_SIZE * gpTopOffset - TILE_SIZE / 2,
          bridgeStartX: gpDef.bridgeStartCol * TILE_SIZE + TILE_SIZE / 2,
          bridgeY: this.groundTopY - TILE_SIZE * bridgeTopOffset + TILE_SIZE / 2,
          bridgeTileCount: gpDef.bridgeTileCount,
          solidGroup: platforms,
          conditionKey: gpDef.conditionKey,
          puzzleSystem: this.puzzleSystem,
        }),
      );
    }

    for (const plateDef of this.level.pressurePlates) {
      const plateTopY = this.groundTopY - TILE_SIZE * plateDef.topOffsetTiles;
      this.pressurePlates.push(
        new PressurePlate(this, {
          x: plateDef.col * TILE_SIZE + TILE_SIZE / 2,
          y: plateTopY - TILE_SIZE / 2,
          conditionKey: plateDef.conditionKey,
          puzzleSystem: this.puzzleSystem,
        }),
      );
    }

    for (const doorDef of this.level.electricDoors) {
      this.electricDoors.push(
        new ElectricDoor(this, {
          x: doorDef.col * TILE_SIZE + TILE_SIZE / 2,
          bottomY: this.groundTopY,
          heightTiles: doorDef.heightTiles,
          solidGroup: platforms,
          requiredConditions: doorDef.requiredConditions,
          puzzleSystem: this.puzzleSystem,
        }),
      );
    }

    for (const nodeDef of this.level.electricNodes) {
      const nodeTopOffset = nodeDef.topOffsetTiles ?? 0;
      interactables.push(
        new ElectricNode(this, {
          id: nodeDef.id,
          x: nodeDef.col * TILE_SIZE + TILE_SIZE / 2,
          y: this.groundTopY - TILE_SIZE * nodeTopOffset - TILE_SIZE / 2,
          conditionKey: nodeDef.conditionKey,
          puzzleSystem: this.puzzleSystem,
        }),
      );
    }

    this.exitGate = new ExitGate(this, {
      x: this.level.exitGate.col * TILE_SIZE + TILE_SIZE / 2,
      bottomY: this.groundTopY - TILE_SIZE * (this.level.exitGate.topOffsetTiles ?? 0),
      requiredConditions: this.level.exitGate.requiredConditions,
      puzzleSystem: this.puzzleSystem,
    });

    this.abilitySystem = new AbilitySystem(interactables);

    const moss = new Critter(this, {
      id: CRITTER_IDS.MOSS,
      displayName: 'MOSS',
      spawnPoint: {
        x: this.level.spawns[CRITTER_IDS.MOSS].col * TILE_SIZE + TILE_SIZE / 2,
        y: this.groundTopY - TILE_SIZE / 2,
      },
      textureKey: TEXTURE_KEYS.MOSS_SHEET,
    });

    const zippy = new Critter(this, {
      id: CRITTER_IDS.ZIPPY,
      displayName: 'ZIPPY',
      spawnPoint: {
        x: this.level.spawns[CRITTER_IDS.ZIPPY].col * TILE_SIZE + TILE_SIZE / 2,
        y: this.groundTopY - TILE_SIZE / 2,
      },
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

    this.createWorldHints(this.groundTopY);
    this.createHudElements();

    this.puzzleSystem.onComplete(() => {
      for (const critter of this.critters) {
        critter.setVelocity(0, 0);
      }
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
    this.updateClouds(delta);

    const input = this.inputManager.readInput();

    if (input.resetPressed) {
      this.resetLevel();
      return;
    }

    if (this.puzzleSystem.isCompleted()) {
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
      const inactiveResult = this.controllers[inactiveCritter.id].update(delta, null);
      if (inactiveResult.justLanded) {
        this.effects.spawnDustPuff(inactiveCritter.x, inactiveCritter.y + 14, 4);
      }
    }

    for (const plate of this.pressurePlates) {
      plate.update(this.critters);
    }

    const doorOpenNow = this.electricDoors[0]?.getIsOpen() ?? false;
    if (doorOpenNow !== this.wasDoorOpen) {
      this.wasDoorOpen = doorOpenNow;
      this.audioManager.playDoorToggle(doorOpenNow);
    }

    this.exitGate.update(this.critters);
    this.updateVisualIndicators();
  }

  private resetLevel(): void {
    this.controllers[CRITTER_IDS.MOSS].reset();
    this.controllers[CRITTER_IDS.ZIPPY].reset();
    this.switchSystem.reset();
    this.abilitySystem.reset();
    for (const plate of this.pressurePlates) {
      plate.reset();
    }
    this.puzzleSystem.reset();
    this.wasDoorOpen = false;
    this.runDustTimerMs = 0;
    this.hud.setCompleteVisible(false);
    this.updateVisualIndicators();
  }

  private createBackgroundDecor(groundTopY: number): void {
    if (this.level.theme === 'canopy') {
      const canopy = this.add.graphics().setDepth(-1);
      // Distant forest canopy trunks & foliage silhouettes
      canopy.fillStyle(0x166534, 0.25);
      canopy.fillRect(90, 80, 44, groundTopY - 80);
      canopy.fillRect(360, 40, 56, GAME_HEIGHT - 40);
      canopy.fillRect(680, 60, 48, GAME_HEIGHT - 60);
      canopy.fillStyle(0x22c55e, 0.22);
      canopy.fillRect(40, 50, 150, 56);
      canopy.fillRect(310, 20, 160, 64);
      canopy.fillRect(620, 35, 170, 58);
    }

    this.clouds = [
      this.createCloud(140, 110, 1),
      this.createCloud(520, 92, 1.15),
      this.createCloud(810, 128, 0.9),
    ];

    // Small decorative grass tufts on ground tiles
    const totalColumns = Math.ceil(GAME_WIDTH / TILE_SIZE);
    for (let col = 0; col < totalColumns; col += 3) {
      const inPit = this.level.pitSpans.some(
        (span) => col >= span.startCol && col <= span.endCol,
      );
      if (inPit) {
        continue;
      }
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      this.add.image(x, groundTopY - 8, TEXTURE_KEYS.GRASS_TUFT).setDepth(0);
    }

    this.wireGraphics = this.add.graphics().setDepth(0);
  }

  private createCloud(x: number, y: number, scale: number): Phaser.GameObjects.Image {
    return this.add.image(x, y, TEXTURE_KEYS.CLOUD).setScale(scale).setAlpha(0.85).setDepth(0);
  }

  private updateClouds(deltaMs: number): void {
    for (let i = 0; i < this.clouds.length; i += 1) {
      const cloud = this.clouds[i];
      cloud.x += (0.012 + i * 0.004) * deltaMs;
      if (cloud.x > GAME_WIDTH + 60) {
        cloud.x = -60;
      }
    }
  }

  private createWorldHints(groundTopY: number): void {
    for (const hint of this.level.hints) {
      this.add
        .text(
          hint.col * TILE_SIZE + TILE_SIZE / 2,
          groundTopY - TILE_SIZE * hint.topOffsetTiles,
          hint.text,
          {
            fontFamily: 'monospace',
            fontSize: '11px',
            fontStyle: 'bold',
            color: '#1e293b',
            backgroundColor: '#e0f2fe',
            padding: { x: 5, y: 2 },
          },
        )
        .setOrigin(0.5)
        .setDepth(1);
    }
  }

  private createHudElements(): void {
    this.hud = new GameplayHud(this, this.level.name);

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
    const inactive = this.switchSystem.getInactiveCritters()[0];

    this.activeIndicator.setPosition(active.x, active.y - 25);

    const target = this.abilitySystem.findNearestValidTarget(active);
    if (target) {
      const pos = target.getPosition();
      this.promptText.setText(target.promptLabel);
      this.promptText.setPosition(pos.x, pos.y - 30);
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    const plateKey = this.level.pressurePlates[0]?.conditionKey ?? 'plate-1';
    const nodeKey = this.level.electricNodes[0]?.conditionKey ?? 'node-1';
    const vineKey = this.level.growthPoints[0]?.conditionKey ?? 'vine-1';

    const plateOn = this.puzzleSystem.getCondition(plateKey);
    const nodeOn = this.puzzleSystem.getCondition(nodeKey);
    const vineGrown = this.puzzleSystem.getCondition(vineKey);

    this.drawPuzzleWires(plateOn, nodeOn);

    this.hud.update({
      active,
      inactive,
      abilityName: this.abilitySystem.getAbilityName(active.id),
      cooldownMs: this.abilitySystem.getCooldownRemainingMs(active.id),
      plateOn,
      nodeOn,
    });

    const moss = this.critters.find((c) => c.id === CRITTER_IDS.MOSS);
    const zippy = this.critters.find((c) => c.id === CRITTER_IDS.ZIPPY);
    if (moss && zippy) {
      publishDevGameState({
        scene: SCENE_KEYS.GAMEPLAY,
        activeCritter: active.id,
        moss: {
          x: Math.round(moss.x),
          y: Math.round(moss.y),
          state: moss.critterState,
          facing: moss.facing,
        },
        zippy: {
          x: Math.round(zippy.x),
          y: Math.round(zippy.y),
          state: zippy.critterState,
          facing: zippy.facing,
        },
        puzzle: {
          vineGrown,
          plateOn,
          nodeOn,
          doorOpen: plateOn && nodeOn,
          completed: this.puzzleSystem.isCompleted(),
        },
      });
    }
  }

  private drawPuzzleWires(plateOn: boolean, nodeOn: boolean): void {
    this.wireGraphics.clear();

    const doorX = this.level.electricDoors[0]?.col * TILE_SIZE + TILE_SIZE / 2;
    const plate = this.level.pressurePlates[0];
    const node = this.level.electricNodes[0];

    if (!doorX || !plate || !node) {
      return;
    }

    const plateX = plate.col * TILE_SIZE + TILE_SIZE / 2;
    const plateY = this.groundTopY - TILE_SIZE * plate.topOffsetTiles;
    this.wireGraphics.lineStyle(2, plateOn ? 0x22c55e : 0x475569, plateOn ? 0.85 : 0.35);
    this.wireGraphics.lineBetween(plateX, plateY, doorX, plateY);
    this.wireGraphics.lineBetween(doorX, plateY, doorX, this.groundTopY - TILE_SIZE * 4);

    const nodeX = node.col * TILE_SIZE + TILE_SIZE / 2;
    const nodeY = this.groundTopY - TILE_SIZE * (node.topOffsetTiles ?? 0) - 8;
    this.wireGraphics.lineStyle(2, nodeOn ? 0xfacc15 : 0x475569, nodeOn ? 0.9 : 0.35);
    this.wireGraphics.lineBetween(nodeX, nodeY, doorX, nodeY);
    this.wireGraphics.lineBetween(doorX, nodeY, doorX, this.groundTopY - TILE_SIZE * 2);
  }

  private buildLevelTerrain(groundTopY: number): Phaser.Physics.Arcade.StaticGroup {
    const platforms = this.physics.add.staticGroup();
    const totalColumns = Math.ceil(GAME_WIDTH / TILE_SIZE);

    for (let col = 0; col < totalColumns; col += 1) {
      const inPit = this.level.pitSpans.some(
        (span) => col >= span.startCol && col <= span.endCol,
      );
      if (inPit) {
        continue;
      }

      const x = col * TILE_SIZE + TILE_SIZE / 2;
      for (let row = 0; row < this.level.groundThicknessTiles; row += 1) {
        platforms.create(x, groundTopY + TILE_SIZE * (row + 0.5), TEXTURE_KEYS.GROUND_TILE);
      }
    }

    for (const plat of this.level.platforms) {
      const y = groundTopY - TILE_SIZE * plat.topOffsetTiles + TILE_SIZE / 2;
      for (let col = plat.startCol; col <= plat.endCol; col += 1) {
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        platforms.create(x, y, TEXTURE_KEYS.PLATFORM_TILE);
      }
    }

    platforms.refresh();
    return platforms;
  }
}
