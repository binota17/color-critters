import { CRITTER_IDS } from '../../config/constants';
import { LevelDefinition } from '../../../types/level';

export const LEVEL_01: LevelDefinition = {
  id: 'level-01',
  name: 'Level 1: Sprout & Spark',
  groundThicknessTiles: 2,
  pitSpans: [{ startCol: 11, endCol: 16 }],
  platforms: [
    // Warmup step in Zone 1
    { startCol: 6, endCol: 7, topOffsetTiles: 1 },
    // Stepping platform after the vine bridge
    { startCol: 18, endCol: 20, topOffsetTiles: 2 },
    // High cooperative platform holding the Pressure Plate
    { startCol: 13, endCol: 16, topOffsetTiles: 4 },
  ],
  spawns: {
    [CRITTER_IDS.MOSS]: { col: 2 },
    [CRITTER_IDS.ZIPPY]: { col: 4 },
  },
  initialConditions: {
    'vine-1': false,
    'plate-1': false,
    'node-1': false,
  },
  growthPoints: [
    {
      id: 'growth-point-1',
      col: 10,
      bridgeStartCol: 11,
      bridgeTileCount: 6,
      conditionKey: 'vine-1',
    },
  ],
  pressurePlates: [
    {
      col: 14,
      topOffsetTiles: 4,
      conditionKey: 'plate-1',
    },
  ],
  electricNodes: [
    {
      id: 'electric-node-1',
      col: 21,
      conditionKey: 'node-1',
    },
  ],
  electricDoors: [
    {
      col: 24,
      heightTiles: 4,
      requiredConditions: ['plate-1', 'node-1'],
    },
  ],
  exitGate: {
    col: 27,
    requiredConditions: ['plate-1', 'node-1'],
  },
  hints: [
    { col: 10, topOffsetTiles: 2.9, text: '1. Grow Bridge' },
    { col: 14.5, topOffsetTiles: 6.2, text: '2. Hold Plate' },
    { col: 21, topOffsetTiles: 2.9, text: '3. Power Door' },
    { col: 27, topOffsetTiles: 2.9, text: 'EXIT' },
  ],
};
