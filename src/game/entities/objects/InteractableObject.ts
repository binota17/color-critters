import { CritterId } from '../../config/constants';

/**
 * Common contract for world objects that can be activated by a Critter ability.
 */
export interface InteractableObject {
  readonly id: string;
  readonly requiredCritter: CritterId;
  readonly interactionRadius: number;
  readonly promptLabel: string;

  getPosition(): { x: number; y: number };
  canActivate(critterId: CritterId): boolean;
  activate(): void;
  reset(): void;
}
