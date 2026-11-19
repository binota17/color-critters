import { CritterId } from '../config/constants';
import { Critter } from '../entities/critters/Critter';

/**
 * Manages active Critter selection and switching between MOSS and ZIPPY.
 */
export class CritterSwitchSystem {
  private readonly critters: Critter[];
  private readonly defaultId: CritterId;
  private activeId: CritterId;

  constructor(critters: Critter[], defaultId: CritterId) {
    this.critters = critters;
    this.defaultId = defaultId;
    this.activeId = defaultId;
    this.applyActiveState();
  }

  getActiveCritter(): Critter {
    const active = this.critters.find((critter) => critter.id === this.activeId);
    return active ?? this.critters[0];
  }

  getInactiveCritters(): Critter[] {
    return this.critters.filter((critter) => critter.id !== this.activeId);
  }

  select(id: CritterId): boolean {
    if (id === this.activeId) {
      return false;
    }

    const exists = this.critters.some((critter) => critter.id === id);
    if (!exists) {
      return false;
    }

    this.activeId = id;
    this.applyActiveState();
    return true;
  }

  switchNext(): CritterId {
    const currentIndex = this.critters.findIndex((critter) => critter.id === this.activeId);
    const nextIndex = (currentIndex + 1) % this.critters.length;
    const nextCritter = this.critters[nextIndex];
    this.select(nextCritter.id);
    return this.activeId;
  }

  reset(): void {
    this.activeId = this.defaultId;
    this.applyActiveState();
  }

  private applyActiveState(): void {
    for (const critter of this.critters) {
      critter.setActiveState(critter.id === this.activeId);
    }
  }
}
