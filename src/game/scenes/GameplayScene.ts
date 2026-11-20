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
import { getLevelById, getNextLevelId } from '../data/levels';
import { Critter } from '../entities/critters/Critter';
import { ElectricDoor } from '../entities/objects/ElectricDoor';
import { ElectricNode } from '../entities/objects/ElectricNode';
import { ExitGate } from '../entities/objects/ExitGate';
import { GrowthPoint } from '../entities/objects/GrowthPoint';
import { InteractableObject } from '../entities/objects/InteractableObject';
import { PressurePlate } from '../entities/objects/PressurePlate';
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
  private resonancePairs: Array<{
    root: ResonanceRoot;
    connection: ResonanceConnection;
    relay: ResonanceRelay;
  }> = [];
  private exitGate!: ExitGate;
  private critters!: Critter[];
  private controllers!: Record<CritterId, CritterController>;
  private clouds: Phaser.GameObjects.Image[] = [];
  private plateConduits: Phaser.GameObjects.Image[] = [];
  private nodeConduits: Phaser.GameObjects.Image[] = [];
  private activeIndicator!: Phaser.GameObjects.Image;
  private promptContainer!: Phaser.GameObjects.Container;
  private promptBg!: Phaser.GameObjects.NineSlice;
  private promptText!: Phaser.GameObjects.Text;
  private runDustTimerMs = 0;
  private wasDoorOpen = false;
  private wasPlateOn = false;
  private groundTopY = 0;
  private isPaused = false;
  private nextLevelId: string | null = null;

  constructor() {
    super({ key: SCENE_KEYS.GAMEPLAY });
  }

  init(data?: { levelId?: string }): void {
    this.level = getLevelById(data?.levelId);
    this.nextLevelId = getNextLevelId(this.level.id);
    this.isPaused = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.SKY);
    this.physics.world.resume();

    // Block horizontal screen edges while allowing falling below the bottom threshold for respawn
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT, true, true, false, false);

    this.groundTopY = GAME_HEIGHT - TILE_SIZE * this.level.groundThicknessTiles;
    this.audioManager = new AudioManager();
    this.effects = new EffectsHelper(this);

    this.createBackgroundDecor(this.groundTopY);
    this.buildPuzzleConduits(this.groundTopY);
    const platforms = this.buildLevelTerrain(this.groundTopY);

    this.puzzleSystem = new PuzzleSystem(this.level.initialConditions);
    const interactables: InteractableObject[] = [];
    this.pressurePlates = [];
    this.electricDoors = [];
    this.resonancePairs = [];
    this.wasDoorOpen = false;
    this.wasPlateOn = false;

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

    for (const pairDef of this.level.resonancePairs ?? []) {
      const rootX = pairDef.rootCol * TILE_SIZE + TILE_SIZE / 2;
      const rootY = this.groundTopY - TILE_SIZE * (pairDef.rootTopOffsetTiles ?? 0) - TILE_SIZE / 2;
      const relayX = pairDef.relayCol * TILE_SIZE + TILE_SIZE / 2;
      const relayY = this.groundTopY - TILE_SIZE * (pairDef.relayTopOffsetTiles ?? 0) - TILE_SIZE / 2;

      const connection = new ResonanceConnection(this, {
        startX: rootX,
        startY: rootY - 6,
        endX: relayX,
        endY: relayY - 6,
      });

      const root = new ResonanceRoot(this, {
        id: pairDef.rootId,
        x: rootX,
        y: rootY,
        connection,
        conditionKey: pairDef.connectedConditionKey,
        puzzleSystem: this.puzzleSystem,
      });

      const relay = new ResonanceRelay(this, {
        id: pairDef.relayId,
        x: relayX,
        y: relayY,
        connection,
        conditionKey: pairDef.poweredConditionKey,
        puzzleSystem: this.puzzleSystem,
        onPowered: () => {
          this.audioManager.playElectricPulse();
          this.effects.spawnSwitchRing(relayX, relayY, 0xfacc15);
          this.updateVisualIndicators();
        },
      });

      interactables.push(root, relay);
      this.resonancePairs.push({ root, connection, relay });
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
      this.setPaused(false);
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
      this.isPaused = false;
      this.tweens.killAll();
      this.audioManager.destroy();
    });

    this.updateVisualIndicators();
  }

  update(_time: number, delta: number): void {
    const input = this.inputManager.readInput();

    if (this.puzzleSystem.isCompleted()) {
      if (input.resetPressed) {
        this.resetLevel();
        return;
      }
      if (input.confirmPressed || input.nextPressed) {
        if (this.nextLevelId) {
          this.goToNextLevel();
        } else {
          this.goToMainMenu();
        }
        return;
      }
      if (input.menuPressed) {
        this.goToMainMenu();
        return;
      }
      return;
    }

    if (input.pausePressed) {
      this.setPaused(!this.isPaused);
      return;
    }

    if (this.isPaused) {
      if (input.resetPressed) {
        this.resetLevel();
        return;
      }
      if (input.menuPressed) {
        this.goToMainMenu();
        return;
      }
      return;
    }

    this.updateClouds(delta);

    if (input.resetPressed) {
      this.resetLevel();
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
      const switchedCritter = this.switchSystem.getActiveCritter();
      const ringColor = switchedCritter.id === CRITTER_IDS.MOSS ? 0x4ade80 : 0xfacc15;
      this.effects.spawnSwitchRing(switchedCritter.x, switchedCritter.y, ringColor);
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
      const inactiveResult = this.controllers[inactiveCritter.id].update(delta, null);
      if (inactiveResult.justLanded) {
        this.effects.spawnDustPuff(inactiveCritter.x, inactiveCritter.y + 14, 4);
      }
    }

    for (const plate of this.pressurePlates) {
      plate.update(this.critters);
    }

    const plateOnNow = this.level.pressurePlates.some((p) =>
      this.puzzleSystem.getCondition(p.conditionKey),
    );
    if (plateOnNow !== this.wasPlateOn) {
      this.wasPlateOn = plateOnNow;
      this.audioManager.playPlateToggle(plateOnNow);
    }

    const doorOpenNow = this.electricDoors[0]?.getIsOpen() ?? false;
    if (doorOpenNow !== this.wasDoorOpen) {
      this.wasDoorOpen = doorOpenNow;
      this.audioManager.playDoorToggle(doorOpenNow);
      if (doorOpenNow && this.level.electricDoors[0]) {
        const doorX = this.level.electricDoors[0].col * TILE_SIZE + TILE_SIZE / 2;
        this.effects.spawnSwitchRing(doorX, this.groundTopY - TILE_SIZE * 2, 0x38bdf8);
      }
    }

    this.exitGate.update(this.critters);
    this.updateVisualIndicators();
  }

  private resetLevel(): void {
    this.setPaused(false);
    this.controllers[CRITTER_IDS.MOSS].reset();
    this.controllers[CRITTER_IDS.ZIPPY].reset();
    this.switchSystem.reset();
    this.abilitySystem.reset();
    for (const plate of this.pressurePlates) {
      plate.reset();
    }
    this.puzzleSystem.reset();
    this.wasDoorOpen = false;
    this.wasPlateOn = false;
    this.runDustTimerMs = 0;
    this.hud.setCompleteVisible(false);
    this.updateVisualIndicators();
  }

  private setPaused(paused: boolean): void {
    if (paused && this.puzzleSystem.isCompleted()) {
      return;
    }
    if (this.isPaused === paused) {
      this.hud.setPauseVisible(paused);
      return;
    }

    this.isPaused = paused;
    this.hud.setPauseVisible(paused);

    if (paused) {
      this.physics.world.pause();
      for (const critter of this.critters) {
        critter.anims.pause();
      }
    } else {
      this.physics.world.resume();
      for (const critter of this.critters) {
        critter.anims.resume();
      }
    }

    this.publishState();
  }

  private goToNextLevel(): void {
    if (!this.nextLevelId) {
      this.goToMainMenu();
      return;
    }
    this.isPaused = false;
    this.physics.world.resume();
    this.tweens.killAll();
    this.scene.start(SCENE_KEYS.GAMEPLAY, { levelId: this.nextLevelId });
  }

  private goToMainMenu(): void {
    this.isPaused = false;
    this.physics.world.resume();
    this.tweens.killAll();
    this.scene.start(SCENE_KEYS.MAIN_MENU);
  }

  private createBackgroundDecor(groundTopY: number): void {
    if (this.level.id === 'level-01') {
      for (let x = 0; x < GAME_WIDTH; x += 320) {
        this.add.image(x + 160, groundTopY - 48, TEXTURE_KEYS.BG_HILLS).setDepth(-20);
        this.add.image(x + 160, groundTopY - 64, TEXTURE_KEYS.BG_CANOPY).setDepth(-10);
      }

      this.clouds = [
        this.createCloud(140, 110, 1),
        this.createCloud(520, 92, 1.15),
        this.createCloud(810, 128, 0.9),
      ];

      this.placeLevel1Props(groundTopY);
      return;
    }

    if (this.level.theme === 'grove') {
      for (let x = 0; x < GAME_WIDTH; x += 320) {
        this.add.image(x + 160, groundTopY - 48, TEXTURE_KEYS.BG_HILLS).setDepth(-20);
        this.add.image(x + 160, groundTopY - 64, TEXTURE_KEYS.BG_CANOPY).setDepth(-10);
      }

      // Enchanted grove L2 trees & pixel sunbeams (outline-free, subordinate)
      this.add.image(255, groundTopY, TEXTURE_KEYS.BG_GROVE_TREE).setOrigin(0.5, 1).setAlpha(0.42).setDepth(-15);
      this.add.image(535, groundTopY, TEXTURE_KEYS.BG_GROVE_TREE).setOrigin(0.5, 1).setScale(1.12).setAlpha(0.42).setDepth(-15);
      this.add.image(250, 0, TEXTURE_KEYS.BG_SUNBEAM).setOrigin(0.5, 0).setScale(1.3, 1.5).setAlpha(0.16).setDepth(-14);
      this.add.image(560, 0, TEXTURE_KEYS.BG_SUNBEAM).setOrigin(0.5, 0).setScale(1.3, 1.5).setAlpha(0.16).setDepth(-14);

      this.clouds = [
        this.createCloud(140, 110, 1),
        this.createCloud(520, 92, 1.15),
        this.createCloud(810, 128, 0.9),
      ];

      this.placeLevel3Props(groundTopY);
      return;
    }

    if (this.level.theme === 'canopy') {
      for (let x = 0; x < GAME_WIDTH; x += 320) {
        this.add.image(x + 160, groundTopY - 48, TEXTURE_KEYS.BG_HILLS).setDepth(-20);
        this.add.image(x + 160, groundTopY - 64, TEXTURE_KEYS.BG_CANOPY).setDepth(-10);
      }

      // Elevated canopy L2 pixel-art trees (outline-free, subordinate)
      const trees = [
        { x: 136, scale: 1.0 },
        { x: 345, scale: 1.15 },
        { x: 623, scale: 1.06 },
        { x: 876, scale: 1.02 },
      ];
      for (const t of trees) {
        this.add
          .image(t.x, groundTopY, TEXTURE_KEYS.BG_CANOPY_TREE)
          .setOrigin(0.5, 1)
          .setScale(t.scale)
          .setAlpha(0.45)
          .setDepth(-15);
      }

      this.clouds = [
        this.createCloud(140, 110, 1),
        this.createCloud(520, 92, 1.15),
        this.createCloud(810, 128, 0.9),
      ];

      this.placeLevel2Props(groundTopY);
      return;
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
  }

  private createCloud(x: number, y: number, scale: number): Phaser.GameObjects.Image {
    return this.add.image(x, y, TEXTURE_KEYS.CLOUD).setScale(scale).setAlpha(0.85).setDepth(-30);
  }

  private placeLevel1Props(groundTopY: number): void {
    const placeProp = (key: string, frame: number, col: number, surfaceY: number) => {
      this.add.image(Math.round(col * TILE_SIZE), surfaceY, key, frame).setOrigin(0.5, 1).setDepth(0);
    };

    // Area 1 — Starting Clearing (kept clear of spawns at col 2, 4 and GrowthPoint at col 10)
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 3, 0.75, groundTopY); // bush-sm
    placeProp(TEXTURE_KEYS.PROPS_MUSHROOMS, 0, 1.4, groundTopY); // mushroom-sm
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 0, 3.5, groundTopY); // flower-daisy
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 0, 5.3, groundTopY); // grass-tuft-sm
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 1, 9.0, groundTopY); // grass-tuft-md

    // Area 2 — Vine Crossing (kept clear of pit edges & PressurePlate at col 14)
    placeProp(TEXTURE_KEYS.PROPS_ROCKS, 0, 16.0, groundTopY - TILE_SIZE * 4); // rock-sm on high plat
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 0, 20.0, groundTopY - TILE_SIZE * 2); // grass-tuft-sm on step plat
    placeProp(TEXTURE_KEYS.PROPS_ROCKS, 3, 18.0, groundTopY); // rock-mossy
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 1, 19.6, groundTopY); // flower-rose

    // Area 3 — Power Gate (kept clear of ElectricNode col 21, ElectricDoor col 24, ExitGate col 27)
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 2, 22.8, groundTopY); // flower-twin-cyan
    placeProp(TEXTURE_KEYS.PROPS_MUSHROOMS, 2, 25.7, groundTopY); // mushroom-lg
    placeProp(TEXTURE_KEYS.PROPS_ROCKS, 2, 28.9, groundTopY); // rock-cluster
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 3, 29.4, groundTopY); // bush-sm
  }

  private placeLevel2Props(groundTopY: number): void {
    const placeProp = (key: string, frame: number, col: number, surfaceY: number) => {
      this.add.image(Math.round(col * TILE_SIZE), surfaceY, key, frame).setOrigin(0.5, 1).setDepth(0);
    };

    // Area A — Canopy Approach (spawns at col 2, 4)
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 4, 1.0, groundTopY); // bush-lg
    placeProp(TEXTURE_KEYS.PROPS_MUSHROOMS, 3, 3.3, groundTopY); // mushroom-cluster
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 2, 6.4, groundTopY); // flower-twin-cyan

    // Area B — Upper Canopy Relay (ElectricNode col 9, GrowthPoint col 11)
    const highY = groundTopY - TILE_SIZE * 4;
    placeProp(TEXTURE_KEYS.PROPS_ROCKS, 0, 8.3, highY); // rock-sm
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 0, 10.3, highY); // grass-tuft-sm
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 1, 19.4, highY); // flower-rose on Center Canopy Deck

    // Area B — Lower Canopy Island (PressurePlate col 17)
    const midY = groundTopY - TILE_SIZE * 2;
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 1, 18.6, midY); // grass-tuft-md
    placeProp(TEXTURE_KEYS.PROPS_MUSHROOMS, 0, 19.9, midY); // mushroom-sm
    placeProp(TEXTURE_KEYS.PROPS_ROCKS, 3, 21.1, midY); // rock-mossy

    // Area C — Lower Right Ground & Exit Perch (ElectricDoor col 24, ExitGate col 28)
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 3, 25.5, groundTopY); // bush-sm
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 3, 27.6, groundTopY); // flower-cluster
    placeProp(TEXTURE_KEYS.PROPS_MUSHROOMS, 2, 29.2, groundTopY); // mushroom-lg
    placeProp(TEXTURE_KEYS.PROPS_ROCKS, 0, 26.6, midY); // rock-sm on Exit Perch
  }

  private placeLevel3Props(groundTopY: number): void {
    const placeProp = (key: string, frame: number, col: number, surfaceY: number) => {
      this.add.image(Math.round(col * TILE_SIZE), surfaceY, key, frame).setOrigin(0.5, 1).setDepth(0);
    };

    // Section A — The Forgotten Root (spawns at col 1, 3; Root at col 8 topOffset 2)
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 4, 0.6, groundTopY); // bush-lg
    placeProp(TEXTURE_KEYS.PROPS_MUSHROOMS, 0, 2.3, groundTopY); // mushroom-sm
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 0, 4.3, groundTopY); // flower-daisy
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 0, 7.3, groundTopY - TILE_SIZE * 2); // grass-tuft-sm on Root Terrace

    // Section B — The Relay Passage (Relay at col 16 topOffset 4)
    placeProp(TEXTURE_KEYS.PROPS_ROCKS, 0, 12.5, groundTopY - TILE_SIZE * 2); // rock-sm on step deck
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 2, 17.7, groundTopY - TILE_SIZE * 4); // flower-twin-cyan on Relay Deck

    // Section C — The Resonant Exit (Plate at col 19, Door at col 23, ExitGate at col 27 topOffset 2)
    placeProp(TEXTURE_KEYS.PROPS_MUSHROOMS, 3, 21.0, groundTopY); // mushroom-cluster
    placeProp(TEXTURE_KEYS.PROPS_FLOWERS, 1, 22.1, groundTopY); // flower-rose
    placeProp(TEXTURE_KEYS.PROPS_ROCKS, 3, 25.6, groundTopY - TILE_SIZE * 2); // rock-mossy on Exit Sanctum
    placeProp(TEXTURE_KEYS.PROPS_FOLIAGE, 3, 29.0, groundTopY - TILE_SIZE * 2); // bush-sm
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
      const hx = hint.col * TILE_SIZE + TILE_SIZE / 2;
      const hy = groundTopY - TILE_SIZE * hint.topOffsetTiles;
      const label = this.add
        .text(hx, hy, hint.text, {
          fontFamily: 'monospace',
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#3e273b',
        })
        .setOrigin(0.5)
        .setDepth(2);

      this.add
        .nineslice(hx, hy, TEXTURE_KEYS.UI_PANEL, undefined, label.width + 14, label.height + 10, 6, 6, 6, 6)
        .setAlpha(0.92)
        .setDepth(1);
    }
  }

  private createHudElements(): void {
    this.hud = new GameplayHud(this, this.level.name, {
      isFinalLevel: this.nextLevelId === null,
      onResume: () => this.setPaused(false),
      onNextLevel: () => this.goToNextLevel(),
      onReplay: () => this.resetLevel(),
      onMainMenu: () => this.goToMainMenu(),
    });

    this.activeIndicator = this.add
      .image(0, 0, TEXTURE_KEYS.HUD_ICONS, 8)
      .setTint(0x4ade80)
      .setDepth(3);

    this.promptText = this.add
      .text(0, 0, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#3e273b',
      })
      .setOrigin(0.5);

    this.promptBg = this.add.nineslice(
      0,
      0,
      TEXTURE_KEYS.UI_TOOLTIP,
      undefined,
      80,
      24,
      6,
      6,
      6,
      6,
    );

    this.promptContainer = this.add
      .container(0, 0, [this.promptBg, this.promptText])
      .setDepth(4)
      .setVisible(false);
  }

  private updateVisualIndicators(): void {
    const active = this.switchSystem.getActiveCritter();
    const inactive = this.switchSystem.getInactiveCritters()[0];

    this.activeIndicator
      .setPosition(active.x, active.y - 25)
      .setTint(active.id === CRITTER_IDS.MOSS ? 0x4ade80 : 0xfacc15);

    const target = this.abilitySystem.findNearestValidTarget(active);
    if (target) {
      const pos = target.getPosition();
      this.promptText.setText(target.promptLabel);
      this.promptBg.setSize(this.promptText.width + 16, this.promptText.height + 10);
      this.promptContainer.setPosition(pos.x, pos.y - 32).setVisible(true);
    } else {
      this.promptContainer.setVisible(false);
    }

    const plateKey = this.level.pressurePlates[0]?.conditionKey ?? 'plate-1';
    const nodeKey =
      this.level.electricNodes[0]?.conditionKey ??
      this.level.resonancePairs?.[0]?.poweredConditionKey ??
      'node-1';
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

    this.publishState(plateOn, nodeOn, vineGrown);
  }

  private publishState(plateOn?: boolean, nodeOn?: boolean, vineGrown?: boolean): void {
    const active = this.switchSystem.getActiveCritter();
    const moss = this.critters.find((c) => c.id === CRITTER_IDS.MOSS);
    const zippy = this.critters.find((c) => c.id === CRITTER_IDS.ZIPPY);
    if (!moss || !zippy) {
      return;
    }

    const plateKey = this.level.pressurePlates[0]?.conditionKey ?? 'plate-1';
    const nodeKey =
      this.level.electricNodes[0]?.conditionKey ??
      this.level.resonancePairs?.[0]?.poweredConditionKey ??
      'node-1';
    const vineKey = this.level.growthPoints[0]?.conditionKey ?? 'vine-1';

    const resolvedPlate = plateOn ?? this.puzzleSystem.getCondition(plateKey);
    const resolvedNode = nodeOn ?? this.puzzleSystem.getCondition(nodeKey);
    const resolvedVine = vineGrown ?? this.puzzleSystem.getCondition(vineKey);

    const pair = this.resonancePairs[0];
    const powered = pair ? pair.relay.isRelayPowered() : false;

    publishDevGameState({
      scene: SCENE_KEYS.GAMEPLAY,
      levelId: this.level.id,
      isPaused: this.isPaused,
      nextLevelId: this.nextLevelId,
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
        vineGrown: resolvedVine,
        plateOn: resolvedPlate,
        nodeOn: resolvedNode,
        doorOpen: resolvedPlate && resolvedNode,
        completed: this.puzzleSystem.isCompleted(),
      },
      resonance: pair
        ? {
            rootConnected: pair.root.isRootConnected(),
            vineVisible: pair.connection.isVisible(),
            energyTransmitting: pair.connection.isTransmitting(),
            relayPowered: powered,
            gateUnlocked: resolvedPlate && powered,
            completed: this.puzzleSystem.isCompleted(),
          }
        : undefined,
    });
  }

  private buildPuzzleConduits(groundTopY: number): void {
    this.plateConduits = [];
    this.nodeConduits = [];

    const doorX = this.level.electricDoors[0]?.col * TILE_SIZE + TILE_SIZE / 2;
    const plate = this.level.pressurePlates[0];
    const node = this.level.electricNodes[0];
    const resPair = this.level.resonancePairs?.[0];

    if (!doorX || !plate || (!node && !resPair)) {
      return;
    }

    const addSegmentLine = (
      list: Phaser.GameObjects.Image[],
      x1: number,
      y1: number,
      x2: number,
      y2: number,
    ) => {
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const count = Math.max(1, Math.round(dist / 16));
      const angle = Math.atan2(y2 - y1, x2 - x1);
      for (let i = 0; i < count; i += 1) {
        const t = (i + 0.5) / count;
        const img = this.add
          .image(Phaser.Math.Linear(x1, x2, t), Phaser.Math.Linear(y1, y2, t), TEXTURE_KEYS.CONDUIT_WIRE, 0)
          .setRotation(angle)
          .setAlpha(0.5)
          .setDepth(-1);
        list.push(img);
      }
    };

    const plateX = plate.col * TILE_SIZE + TILE_SIZE / 2;
    const plateY = groundTopY - TILE_SIZE * plate.topOffsetTiles;
    addSegmentLine(this.plateConduits, plateX, plateY, doorX, plateY);
    addSegmentLine(this.plateConduits, doorX, plateY, doorX, groundTopY - TILE_SIZE * 4);

    const nodeCol = node ? node.col : resPair!.relayCol;
    const nodeTopOffset = node ? (node.topOffsetTiles ?? 0) : (resPair!.relayTopOffsetTiles ?? 0);
    const nodeX = nodeCol * TILE_SIZE + TILE_SIZE / 2;
    const nodeY = groundTopY - TILE_SIZE * nodeTopOffset - 8;
    addSegmentLine(this.nodeConduits, nodeX, nodeY, doorX, nodeY);
    addSegmentLine(this.nodeConduits, doorX, nodeY, doorX, groundTopY - TILE_SIZE * 2);
  }

  private drawPuzzleWires(plateOn: boolean, nodeOn: boolean): void {
    for (const seg of this.plateConduits) {
      seg.setFrame(plateOn ? 1 : 0).setAlpha(plateOn ? 0.95 : 0.45);
    }
    for (const seg of this.nodeConduits) {
      seg.setFrame(nodeOn ? 2 : 0).setAlpha(nodeOn ? 0.95 : 0.45);
    }
  }

  private buildLevelTerrain(groundTopY: number): Phaser.Physics.Arcade.StaticGroup {
    const platforms = this.physics.add.staticGroup();
    const totalColumns = Math.ceil(GAME_WIDTH / TILE_SIZE);
    const useLevel1Art = this.level.id === 'level-01';
    const useLevel2Art = this.level.id === 'level-02';
    const useLevel3Art = this.level.id === 'level-03';

    for (let col = 0; col < totalColumns; col += 1) {
      const inPit = this.level.pitSpans.some(
        (span) => col >= span.startCol && col <= span.endCol,
      );
      if (inPit) {
        continue;
      }

      const x = col * TILE_SIZE + TILE_SIZE / 2;
      for (let row = 0; row < this.level.groundThicknessTiles; row += 1) {
        if (useLevel1Art) {
          const frame = this.getLevel1GroundFrame(col, row);
          platforms.create(x, groundTopY + TILE_SIZE * (row + 0.5), TEXTURE_KEYS.CORE_TERRAIN, frame);
        } else if (useLevel2Art) {
          const frame = this.getLevel2GroundFrame(col, row);
          platforms.create(x, groundTopY + TILE_SIZE * (row + 0.5), TEXTURE_KEYS.CORE_TERRAIN, frame);
        } else if (useLevel3Art) {
          const frame = this.getLevel3GroundFrame(col, row);
          platforms.create(x, groundTopY + TILE_SIZE * (row + 0.5), TEXTURE_KEYS.CORE_TERRAIN, frame);
        } else {
          platforms.create(x, groundTopY + TILE_SIZE * (row + 0.5), TEXTURE_KEYS.GROUND_TILE);
        }
      }
    }

    for (const plat of this.level.platforms) {
      const y = groundTopY - TILE_SIZE * plat.topOffsetTiles + TILE_SIZE / 2;
      for (let col = plat.startCol; col <= plat.endCol; col += 1) {
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        if (useLevel1Art) {
          if (plat.topOffsetTiles === 1) {
            const frame = col === plat.startCol ? 0 : col === plat.endCol ? 2 : 1;
            platforms.create(x, y, TEXTURE_KEYS.CORE_TERRAIN, frame);
          } else {
            const frame = col === plat.startCol ? 0 : col === plat.endCol ? 2 : 1;
            platforms.create(x, y, TEXTURE_KEYS.WOOD_PLATFORM, frame);
          }
        } else if (useLevel2Art) {
          const { key, frame } = this.getLevel2PlatformTile(plat.startCol, plat.endCol, plat.topOffsetTiles, col);
          platforms.create(x, y, key, frame);
        } else if (useLevel3Art) {
          const { key, frame } = this.getLevel3PlatformTile(plat.startCol, plat.endCol, plat.topOffsetTiles, col);
          platforms.create(x, y, key, frame);
        } else {
          platforms.create(x, y, TEXTURE_KEYS.PLATFORM_TILE);
        }
      }
    }

    platforms.refresh();
    return platforms;
  }

  private getLevel2GroundFrame(col: number, row: number): number {
    // Area A: Left Canopy Ground (cols 0..7)
    if (col <= 7) {
      if (row === 0) {
        if (col === 7) return 2; // grass-top-right
        return col % 3 === 1 ? 3 : 1;
      }
      if (col === 7) return 15; // dirt-right
      return 8 + (col % 3);
    }

    // Area C: Right Mossy Stone Foundation (cols 23..29)
    if (row === 0) {
      if (col === 23) return 24; // stone-top-left (with moss)
      if (col <= 25) return 39; // grass-on-stone-mid
      return 25; // stone-top-mid
    }
    if (col === 23) return 27; // stone-left
    return col % 2 === 0 ? 33 : 28; // stone-mid-moss / stone-mid
  }

  private getLevel2PlatformTile(
    startCol: number,
    endCol: number,
    topOffsetTiles: number,
    col: number,
  ): { key: string; frame: number } {
    const isStart = col === startCol;
    const isEnd = col === endCol;

    // Area C Elevated Exit Perch (cols 26..29): Stone Platform
    if (startCol === 26) {
      return {
        key: TEXTURE_KEYS.CORE_TERRAIN,
        frame: isStart ? 36 : isEnd ? 38 : 37,
      };
    }

    // Area A Canopy Entry (cols 5..6) & Area B Center Deck (cols 18..19): Wooden Platforms
    if (startCol === 5 || (startCol === 18 && topOffsetTiles === 4)) {
      return {
        key: TEXTURE_KEYS.WOOD_PLATFORM,
        frame: isStart ? 0 : isEnd ? 2 : 1,
      };
    }

    // Area B Upper Relay (cols 8..11) & Lower Canopy Island (cols 16..21): Mossy Grass Platforms
    return {
      key: TEXTURE_KEYS.CORE_TERRAIN,
      frame: isStart ? 5 : isEnd ? 7 : 6,
    };
  }

  private getLevel3GroundFrame(col: number, row: number): number {
    // Section A: Left Grove Clearing (cols 0..8)
    if (col <= 8) {
      if (row === 0) {
        if (col === 8) return 2; // grass-top-right
        return col % 3 === 1 ? 3 : 1;
      }
      if (col === 8) return 15; // dirt-right
      return 8 + (col % 3);
    }

    // Section C: Right Grove & Stone Sanctum (cols 18..29)
    if (col === 18) return row === 0 ? 0 : 11; // grass-top-left / dirt-left
    if (col <= 21) return row === 0 ? (col % 2 === 0 ? 3 : 1) : 8 + (col % 3);
    if (col === 22) return row === 0 ? 39 : 33; // grass-on-stone transition
    return row === 0 ? 25 : col % 2 === 0 ? 34 : 28; // stone sanctum
  }

  private getLevel3PlatformTile(
    startCol: number,
    endCol: number,
    topOffsetTiles: number,
    col: number,
  ): { key: string; frame: number } {
    const isStart = col === startCol;
    const isEnd = col === endCol;

    // Warmup step (cols 5..6)
    if (topOffsetTiles === 1) {
      return { key: TEXTURE_KEYS.CORE_TERRAIN, frame: isStart ? 0 : isEnd ? 2 : 1 };
    }
    // Section C Exit Sanctum (cols 25..29): Stone Platform
    if (startCol === 25) {
      return { key: TEXTURE_KEYS.CORE_TERRAIN, frame: isStart ? 36 : isEnd ? 38 : 37 };
    }
    // Section B Stepping Deck (cols 11..13): Wooden Platform
    if (startCol === 11) {
      return { key: TEXTURE_KEYS.WOOD_PLATFORM, frame: isStart ? 0 : isEnd ? 2 : 1 };
    }
    // Root Terrace (cols 7..9) & Relay Deck (cols 15..18): Mossy Grass Platforms
    return { key: TEXTURE_KEYS.CORE_TERRAIN, frame: isStart ? 5 : isEnd ? 7 : 6 };
  }

  private getLevel1GroundFrame(col: number, row: number): number {
    // Area 3 Power Gate stone sanctum (cols 23..29) with grass-on-stone transition at col 23
    if (col === 23) {
      return row === 0 ? 39 : 33;
    }
    if (col >= 24) {
      if (row === 0) return 25;
      return col % 3 === 0 ? 34 : 28;
    }

    // Pit edges: left island ends at col 10, right island starts at col 17
    if (row === 0) {
      if (col === 10) return 2; // grass-top-right
      if (col === 17) return 0; // grass-top-left
      return col % 4 === 2 ? 3 : 1; // grass-top-mid / alt
    }
    if (col === 10) return 15; // dirt-right
    if (col === 17) return 11; // dirt-left
    return 8 + (col % 3); // dirt-mid / alt1 / alt2
  }
}
