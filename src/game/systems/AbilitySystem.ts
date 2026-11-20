import Phaser from 'phaser';
import { CRITTER_IDS, CritterId } from '../config/constants';
import { Critter } from '../entities/critters/Critter';
import { InteractableObject } from '../entities/objects/InteractableObject';

export interface AbilityDefinition {
  name: string;
  cooldownMs: number;
  effectColor: number;
}

export const ABILITY_DEFINITIONS: Record<CritterId, AbilityDefinition> = {
  [CRITTER_IDS.MOSS]: {
    name: 'Grow Vine',
    cooldownMs: 400,
    effectColor: 0x4ade80,
  },
  [CRITTER_IDS.ZIPPY]: {
    name: 'Electric Pulse',
    cooldownMs: 600,
    effectColor: 0xfacc15,
  },
};

export interface AbilityUseResult {
  success: boolean;
  message: string;
  effectColor: number;
}

/**
 * Validates and dispatches Critter abilities against nearby InteractableObjects,
 * managing per-Critter cooldowns and deterministic target selection.
 */
export class AbilitySystem {
  private readonly interactables: InteractableObject[];
  private readonly cooldowns: Record<CritterId, number> = {
    [CRITTER_IDS.MOSS]: 0,
    [CRITTER_IDS.ZIPPY]: 0,
  };

  constructor(interactables: InteractableObject[]) {
    this.interactables = interactables;
  }

  update(deltaMs: number): void {
    for (const id of Object.values(CRITTER_IDS)) {
      if (this.cooldowns[id] > 0) {
        this.cooldowns[id] = Math.max(0, this.cooldowns[id] - deltaMs);
      }
    }
  }

  getCooldownRemainingMs(critterId: CritterId): number {
    return this.cooldowns[critterId];
  }

  getAbilityName(critterId: CritterId): string {
    return ABILITY_DEFINITIONS[critterId].name;
  }

  findNearestValidTarget(critter: Critter): InteractableObject | null {
    const candidates: Array<{ obj: InteractableObject; dist: number }> = [];

    for (const obj of this.interactables) {
      if (!obj.canActivate(critter.id)) {
        continue;
      }

      const pos = obj.getPosition();
      const dist = Phaser.Math.Distance.Between(critter.x, critter.y, pos.x, pos.y);
      if (dist <= obj.interactionRadius) {
        candidates.push({ obj, dist });
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    candidates.sort((a, b) => {
      if (Math.abs(a.dist - b.dist) > 0.001) {
        return a.dist - b.dist;
      }
      return a.obj.id.localeCompare(b.obj.id);
    });

    return candidates[0].obj;
  }

  tryUseAbility(critter: Critter): AbilityUseResult {
    const def = ABILITY_DEFINITIONS[critter.id];

    if (this.cooldowns[critter.id] > 0) {
      return {
        success: false,
        message: 'Cooldown...',
        effectColor: def.effectColor,
      };
    }

    const target = this.findNearestValidTarget(critter);
    if (target) {
      target.activate();
      this.cooldowns[critter.id] = def.cooldownMs;
      return {
        success: true,
        message: def.name,
        effectColor: def.effectColor,
      };
    }

    const blocked = this.findNearestBlockedTarget(critter);
    if (blocked) {
      return {
        success: false,
        message: blocked.reason,
        effectColor: def.effectColor,
      };
    }

    const incompatible = this.findNearestIncompatibleTarget(critter);
    if (incompatible) {
      const requiredName = incompatible.requiredCritter.toUpperCase();
      return {
        success: false,
        message: `Requires ${requiredName}`,
        effectColor: def.effectColor,
      };
    }

    return {
      success: false,
      message: 'No target in range',
      effectColor: def.effectColor,
    };
  }

  reset(): void {
    for (const id of Object.values(CRITTER_IDS)) {
      this.cooldowns[id] = 0;
    }
    for (const obj of this.interactables) {
      obj.reset();
    }
  }

  private findNearestBlockedTarget(
    critter: Critter,
  ): { obj: InteractableObject; reason: string } | null {
    for (const obj of this.interactables) {
      if (obj.requiredCritter !== critter.id || !obj.getBlockedReason) {
        continue;
      }
      const reason = obj.getBlockedReason(critter.id);
      if (!reason) {
        continue;
      }
      const pos = obj.getPosition();
      const dist = Phaser.Math.Distance.Between(critter.x, critter.y, pos.x, pos.y);
      if (dist <= obj.interactionRadius) {
        return { obj, reason };
      }
    }
    return null;
  }

  private findNearestIncompatibleTarget(critter: Critter): InteractableObject | null {
    for (const obj of this.interactables) {
      if (obj.requiredCritter === critter.id) {
        continue;
      }
      const pos = obj.getPosition();
      const dist = Phaser.Math.Distance.Between(critter.x, critter.y, pos.x, pos.y);
      if (dist <= obj.interactionRadius) {
        return obj;
      }
    }
    return null;
  }
}
