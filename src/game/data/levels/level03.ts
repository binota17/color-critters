import { CRITTER_IDS } from '../../config/constants';
import { LevelDefinition } from '../../../types/level';

export const LEVEL_03: LevelDefinition = {
  id: 'level-03',
  name: 'Level 3: The Resonant Grove',
  theme: 'grove',
  groundThicknessTiles: 2,
  pitSpans: [{ startCol: 9, endCol: 17 }],
  platforms: [
    // Section A: Warmup step & Root Terrace
    { startCol: 5, endCol: 6, topOffsetTiles: 1 },
    { startCol: 7, endCol: 9, topOffsetTiles: 2 },
    // Section B: Relay Passage stepping deck & upper Relay Deck
    { startCol: 11, endCol: 13, topOffsetTiles: 2 },
    { startCol: 15, endCol: 18, topOffsetTiles: 4 },
    // Section C: Elevated Exit Sanctum behind ElectricDoor
    { startCol: 25, endCol: 29, topOffsetTiles: 2 },
  ],
  spawns: {
    [CRITTER_IDS.MOSS]: { col: 1 },
    [CRITTER_IDS.ZIPPY]: { col: 3 },
  },
  initialConditions: {
    'resonance-connected-3': false,
    'resonance-powered-3': false,
    'plate-3': false,
  },
  growthPoints: [],
  pressurePlates: [
    {
      col: 19,
      topOffsetTiles: 0,
      conditionKey: 'plate-3',
    },
  ],
  electricNodes: [],
  resonancePairs: [
    {
      rootId: 'resonance-root-3',
      rootCol: 8,
      rootTopOffsetTiles: 2,
      relayId: 'resonance-relay-3',
      relayCol: 16,
      relayTopOffsetTiles: 4,
      connectedConditionKey: 'resonance-connected-3',
      poweredConditionKey: 'resonance-powered-3',
    },
  ],
  electricDoors: [
    {
      col: 23,
      heightTiles: 4,
      requiredConditions: ['resonance-powered-3', 'plate-3'],
    },
  ],
  exitGate: {
    col: 27,
    topOffsetTiles: 2,
    requiredConditions: ['resonance-powered-3', 'plate-3'],
  },
  hints: [
    { col: 8, topOffsetTiles: 4.1, text: '1. Connect Root' },
    { col: 16.5, topOffsetTiles: 6.1, text: '2. Power Relay' },
    { col: 19, topOffsetTiles: 1.9, text: '3. Hold Plate' },
    { col: 27, topOffsetTiles: 4.5, text: 'EXIT' },
  ],
};

