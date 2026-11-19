import { CritterId } from '../game/config/constants';

export interface GridSpan {
  startCol: number;
  endCol: number;
}

export interface PlatformDef {
  startCol: number;
  endCol: number;
  topOffsetTiles: number;
}

export interface GrowthPointDef {
  id: string;
  col: number;
  topOffsetTiles?: number;
  bridgeStartCol: number;
  bridgeTopOffsetTiles?: number;
  bridgeTileCount: number;
  conditionKey: string;
}

export interface PressurePlateDef {
  col: number;
  topOffsetTiles: number;
  conditionKey: string;
}

export interface ElectricNodeDef {
  id: string;
  col: number;
  topOffsetTiles?: number;
  conditionKey: string;
}

export interface ElectricDoorDef {
  col: number;
  heightTiles: number;
  requiredConditions: string[];
}

export interface ExitGateDef {
  col: number;
  topOffsetTiles?: number;
  requiredConditions: string[];
}

export interface WorldHintDef {
  col: number;
  topOffsetTiles: number;
  text: string;
}

export interface LevelDefinition {
  id: string;
  name: string;
  theme?: 'meadow' | 'canopy';
  groundThicknessTiles: number;
  pitSpans: GridSpan[];
  platforms: PlatformDef[];
  spawns: Record<CritterId, { col: number }>;
  initialConditions: Record<string, boolean>;
  growthPoints: GrowthPointDef[];
  pressurePlates: PressurePlateDef[];
  electricNodes: ElectricNodeDef[];
  electricDoors: ElectricDoorDef[];
  exitGate: ExitGateDef;
  hints: WorldHintDef[];
}
