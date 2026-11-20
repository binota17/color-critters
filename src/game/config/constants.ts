export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const TILE_SIZE = 32;

export const SCENE_KEYS = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MAIN_MENU: 'MainMenuScene',
  GAMEPLAY: 'GameplayScene',
} as const;

export const CRITTER_IDS = {
  MOSS: 'moss',
  ZIPPY: 'zippy',
} as const;

export type CritterId = (typeof CRITTER_IDS)[keyof typeof CRITTER_IDS];

export const TEXTURE_KEYS = {
  MOSS_SHEET: 'moss-sheet',
  ZIPPY_SHEET: 'zippy-sheet',
  GROUND_TILE: 'ground-tile',
  PLATFORM_TILE: 'platform-tile',
  VINE_TILE: 'vine-tile',
  GROWTH_POINT: 'growth-point',
  ELECTRIC_NODE: 'electric-node',
  ELECTRIC_DOOR_TILE: 'electric-door',
  PRESSURE_PLATE: 'pressure-plate',
  EXIT_GATE: 'exit-gate',
  RESONANCE_ROOT: 'resonance-root',
  RESONANCE_RELAY: 'resonance-relay',
  RESONANCE_VINE: 'resonance-vine',
  RESONANCE_ORB: 'resonance-orb',
  RESONANCE_AURA: 'resonance-aura',
  CONDUIT_WIRE: 'conduit-wire',
  CLOUD: 'cloud',
  GRASS_TUFT: 'grass-tuft',
  CORE_TERRAIN: 'core-terrain-sheet',
  WOOD_PLATFORM: 'wood-platform-sheet',
  PROPS_FOLIAGE: 'props-foliage',
  PROPS_MUSHROOMS: 'props-mushrooms',
  PROPS_ROCKS: 'props-rocks',
  PROPS_FLOWERS: 'props-flowers',
  BG_HILLS: 'bg-hills',
  BG_CANOPY: 'bg-canopy',
  BG_CANOPY_TREE: 'bg-canopy-tree',
  BG_GROVE_TREE: 'bg-grove-tree',
  BG_SUNBEAM: 'bg-sunbeam',
  UI_PANEL: 'ui-panel',
  UI_PANEL_COMPLETE: 'ui-panel-complete',
  UI_BAR: 'ui-bar',
  UI_TOOLTIP: 'ui-tooltip',
  UI_BUTTON_GREEN: 'ui-button-green',
  UI_BUTTON_GREEN_HOVER: 'ui-button-green-hover',
  UI_BUTTON_WOOD: 'ui-button-wood',
  UI_BUTTON_WOOD_HOVER: 'ui-button-wood-hover',
  TITLE_BANNER: 'title-banner',
  CRITTER_PORTRAITS: 'critter-portraits',
  HUD_ICONS: 'hud-icons',
  FX_PARTICLES: 'fx-particles',
} as const;

export const COLORS = {
  SKY: '#87ceeb',
  TITLE_TEXT: '#14532d',
  SUBTITLE_TEXT: '#166534',
  BUTTON_BG: 0x22c55e,
  BUTTON_BG_HOVER: 0x16a34a,
  BUTTON_BORDER: 0x14532d,
  BUTTON_TEXT: '#ffffff',
  HUD_TEXT: '#0f172a',
} as const;
