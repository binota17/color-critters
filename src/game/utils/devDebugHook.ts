/// <reference types="vite/client" />
import { CritterId } from '../config/constants';
import { CritterState, FacingDirection } from '../entities/critters/Critter';

export interface DevCritterSnapshot {
  x: number;
  y: number;
  state: CritterState;
  facing: FacingDirection;
}

export interface DevGameState {
  scene: string;
  activeCritter?: CritterId;
  moss?: DevCritterSnapshot;
  zippy?: DevCritterSnapshot;
  puzzle?: {
    vineGrown: boolean;
    plateOn: boolean;
    nodeOn: boolean;
    doorOpen: boolean;
    completed: boolean;
  };
}

declare global {
  interface Window {
    __CC_TEST_STATE__?: DevGameState;
  }
}

export function publishDevGameState(state: DevGameState): void {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    window.__CC_TEST_STATE__ = state;
  }
}
