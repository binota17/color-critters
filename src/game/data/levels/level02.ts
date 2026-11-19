import { CRITTER_IDS } from '../../config/constants';
import { LevelDefinition } from '../../../types/level';

export const LEVEL_02: LevelDefinition = {
  id: 'level-02',
  name: 'Level 2: The Canopy Relay',
  theme: 'canopy',
  groundThicknessTiles: 2,
  pitSpans: [{ startCol: 8, endCol: 22 }],
  platforms: [
    // Section A: Canopy Entry wooden tiers
    { startCol: 5, endCol: 6, topOffsetTiles: 2 },
    { startCol: 8, endCol: 11, topOffsetTiles: 4 },
    // Section B: Center Canopy Deck after high vine bridge
    { startCol: 18, endCol: 19, topOffsetTiles: 4 },
    // Section B: Lower Canopy Island (extends past Center Canopy Deck so Critters drop right onto it)
    { startCol: 16, endCol: 21, topOffsetTiles: 2 },
    // Section C: Elevated Exit Perch behind ElectricDoor
    { startCol: 26, endCol: 29, topOffsetTiles: 2 },
  ],
  spawns: {
    [CRITTER_IDS.MOSS]: { col: 2 },
    [CRITTER_IDS.ZIPPY]: { col: 4 },
  },
  initialConditions: {
    'vine-2': false,
    'plate-2': false,
    'node-2': false,
  },
  growthPoints: [
    {
      id: 'growth-point-2',
      col: 11,
      topOffsetTiles: 4,
      bridgeStartCol: 12,
      bridgeTopOffsetTiles: 4,
      bridgeTileCount: 6,
      conditionKey: 'vine-2',
    },
  ],
  pressurePlates: [
    {
      col: 17,
      topOffsetTiles: 2,
      conditionKey: 'plate-2',
    },
  ],
  electricNodes: [
    {
      id: 'electric-node-2',
      col: 9,
      topOffsetTiles: 4,
      conditionKey: 'node-2',
    },
  ],
  electricDoors: [
    {
      col: 24,
      heightTiles: 4,
      requiredConditions: ['node-2', 'plate-2'],
    },
  ],
  exitGate: {
    col: 28,
    topOffsetTiles: 2,
    requiredConditions: ['node-2', 'plate-2'],
  },
  hints: [
    { col: 9, topOffsetTiles: 6.4, text: '1. Power Node' },
    { col: 11.5, topOffsetTiles: 5.5, text: '2. High Bridge' },
    { col: 17, topOffsetTiles: 3.5, text: '3. Hold Plate' },
    { col: 28, topOffsetTiles: 4.5, text: 'EXIT' },
  ],
};
