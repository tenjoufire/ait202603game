export const TILE_SIZE = 32;
export const MAP_WIDTH = 50;
export const MAP_HEIGHT = 40;
export const VIEWPORT_WIDTH = 20;
export const VIEWPORT_HEIGHT = 15;
export const SIDEBAR_WIDTH = 200;
export const LOG_HEIGHT = 120;
export const CANVAS_WIDTH = VIEWPORT_WIDTH * TILE_SIZE + SIDEBAR_WIDTH;
export const CANVAS_HEIGHT = VIEWPORT_HEIGHT * TILE_SIZE + LOG_HEIGHT;
export const BSP_MIN_ROOM_SIZE = 5;
export const BSP_MAX_ROOM_SIZE = 11;
export const BSP_DEPTH = 4;
export const FOV_RADIUS = 6;
export const INVENTORY_MAX = 10;
export const MESSAGE_LOG_MAX = 20;
export const MAX_HIGH_SCORES = 5;

export const COLORS = {
  bg: '#050816',
  wall: '#5c677d',
  floor: '#9c7b4f',
  corridor: '#7f5d39',
  stairs: '#ffd166',
  door: '#c49a6c',
  player: '#73fbd3',
  enemy: '#ff6b6b',
  boss: '#f94144',
  item: '#90e0ef',
  fogExplored: '#1f2533',
  fogHidden: '#02040a',
  uiBg: '#0f172a',
  uiPanel: '#111827',
  uiText: '#e5e7eb',
  uiMuted: '#94a3b8',
  hpBar: '#ef4444',
  hpBarBg: '#3f1a1a',
  expBar: '#38bdf8',
  expBarBg: '#122638',
  overlay: 'rgba(2, 6, 23, 0.88)',
} as const;

export const TILE_FONT = '24px monospace';
export const UI_FONT = '16px monospace';
export const TITLE_FONT = 'bold 28px monospace';