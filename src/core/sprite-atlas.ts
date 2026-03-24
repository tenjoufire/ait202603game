/**
 * Procedural sprite atlas — generates all game sprites at startup
 * using an off-screen canvas so we never need external image files.
 *
 * Each sprite is drawn at SPRITE_SRC_SIZE (16×16) then rendered at
 * TILE_SIZE (32×32) with image-rendering: pixelated for a crisp
 * pixel-art look.
 */
import { TILE_SIZE } from '../constants';

const SPRITE_SRC = 16;
const COLS = 16;

export type SpriteKey =
  // tiles
  | 'wall' | 'floor' | 'corridor' | 'stairs' | 'door'
  // player
  | 'player'
  // enemies
  | 'slime' | 'bat' | 'goblin' | 'orc' | 'skeleton' | 'ghost' | 'dark-mage' | 'mimic' | 'dragon'
  // items
  | 'potion' | 'greater-potion' | 'iron-sword' | 'flame-sword'
  | 'leather-armor' | 'steel-armor' | 'scroll'
  // objects
  | 'chest-closed' | 'chest-open' | 'trap-hidden' | 'trap-spike'
  // npcs
  | 'healer' | 'sage' | 'merchant'
  // ui
  | 'fog-explored' | 'fog-hidden';

const SPRITE_ORDER: SpriteKey[] = [
  'wall', 'floor', 'corridor', 'stairs', 'door',
  'player',
  'slime', 'bat', 'goblin', 'orc', 'skeleton', 'ghost', 'dark-mage', 'mimic', 'dragon',
  'potion', 'greater-potion', 'iron-sword', 'flame-sword',
  'leather-armor', 'steel-armor', 'scroll',
  'chest-closed', 'chest-open', 'trap-hidden', 'trap-spike',
  'healer', 'sage', 'merchant',
  'fog-explored', 'fog-hidden',
];

/* ── tiny pixel-art drawing helpers ─────────────────────────── */

type DrawFn = (ctx: CanvasRenderingContext2D) => void;

const px = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
};

const rect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

const fillAll = (ctx: CanvasRenderingContext2D, color: string) => rect(ctx, 0, 0, 16, 16, color);

/* ── individual sprite painters ─────────────────────────────── */

const drawWall: DrawFn = (ctx) => {
  fillAll(ctx, '#3d4559');
  // brick pattern
  for (let y = 0; y < 16; y += 4) {
    const offset = (y / 4) % 2 === 0 ? 0 : 4;
    for (let x = offset; x < 16; x += 8) {
      rect(ctx, x, y, 7, 3, '#5c677d');
      rect(ctx, x + 1, y, 5, 2, '#6b7a94');
    }
    // mortar lines
    rect(ctx, 0, y + 3, 16, 1, '#2d3445');
  }
};

const drawFloor: DrawFn = (ctx) => {
  fillAll(ctx, '#6b5634');
  // dirt texture
  const dots: [number, number, string][] = [
    [2, 3, '#7a6340'], [7, 1, '#8a7350'], [11, 5, '#5e4b2d'],
    [4, 9, '#7a6340'], [13, 12, '#8a7350'], [1, 14, '#5e4b2d'],
    [9, 11, '#6b5634'], [6, 7, '#7a6340'], [14, 3, '#5e4b2d'],
  ];
  for (const [x, y, c] of dots) px(ctx, x, y, c);
};

const drawCorridor: DrawFn = (ctx) => {
  fillAll(ctx, '#54432a');
  const dots: [number, number, string][] = [
    [3, 2, '#6b5634'], [10, 6, '#4a3c24'], [7, 12, '#6b5634'],
    [1, 8, '#4a3c24'], [14, 14, '#6b5634'],
  ];
  for (const [x, y, c] of dots) px(ctx, x, y, c);
};

const drawStairs: DrawFn = (ctx) => {
  fillAll(ctx, '#6b5634');
  // descending stairs
  for (let i = 0; i < 5; i++) {
    rect(ctx, 3 + i, 3 + i * 2, 10 - i * 2, 2, '#ffd166');
    rect(ctx, 3 + i, 3 + i * 2, 10 - i * 2, 1, '#ffe599');
  }
};

const drawDoor: DrawFn = (ctx) => {
  fillAll(ctx, '#3d4559');
  rect(ctx, 4, 2, 8, 14, '#a67c4e');
  rect(ctx, 5, 3, 6, 12, '#c49a6c');
  rect(ctx, 5, 3, 6, 1, '#d6a369');
  // handle
  px(ctx, 10, 9, '#ffd166');
  px(ctx, 10, 10, '#ffd166');
};

const drawPlayer: DrawFn = (ctx) => {
  fillAll(ctx, 'transparent');
  ctx.clearRect(0, 0, 16, 16);
  // head
  rect(ctx, 6, 2, 4, 4, '#73fbd3');
  // eyes
  px(ctx, 7, 4, '#050816');
  px(ctx, 9, 4, '#050816');
  // body
  rect(ctx, 5, 6, 6, 5, '#3dd6a7');
  // arms
  rect(ctx, 3, 7, 2, 3, '#3dd6a7');
  rect(ctx, 11, 7, 2, 3, '#3dd6a7');
  // legs
  rect(ctx, 6, 11, 2, 3, '#2eb88c');
  rect(ctx, 8, 11, 2, 3, '#2eb88c');
  // sword
  rect(ctx, 12, 3, 1, 5, '#ffd166');
  px(ctx, 12, 2, '#ffe599');
};

const drawSlime: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // body blob
  rect(ctx, 4, 8, 8, 6, '#34d399');
  rect(ctx, 3, 10, 10, 3, '#34d399');
  rect(ctx, 5, 7, 6, 1, '#5de8b8');
  // eyes
  px(ctx, 6, 10, '#050816');
  px(ctx, 9, 10, '#050816');
  // highlight
  px(ctx, 5, 8, '#a7f3d0');
};

const drawBat: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // body
  rect(ctx, 6, 6, 4, 4, '#7c3aed');
  rect(ctx, 7, 5, 2, 1, '#8b5cf6');
  // eyes
  px(ctx, 7, 7, '#fef08a');
  px(ctx, 8, 7, '#fef08a');
  // fangs
  px(ctx, 7, 10, '#e5e7eb');
  px(ctx, 8, 10, '#e5e7eb');
  // left wing
  rect(ctx, 1, 5, 5, 3, '#6d28d9');
  px(ctx, 0, 4, '#6d28d9');
  px(ctx, 1, 4, '#7c3aed');
  px(ctx, 0, 8, '#6d28d9');
  // right wing
  rect(ctx, 10, 5, 5, 3, '#6d28d9');
  px(ctx, 15, 4, '#6d28d9');
  px(ctx, 14, 4, '#7c3aed');
  px(ctx, 15, 8, '#6d28d9');
  // ears
  px(ctx, 6, 4, '#8b5cf6');
  px(ctx, 9, 4, '#8b5cf6');
};

const drawGoblin: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // head
  rect(ctx, 5, 2, 6, 5, '#f87171');
  // ears
  px(ctx, 4, 3, '#f87171');
  px(ctx, 11, 3, '#f87171');
  // eyes
  px(ctx, 6, 4, '#fef08a');
  px(ctx, 9, 4, '#fef08a');
  // body
  rect(ctx, 5, 7, 6, 4, '#b45309');
  // arms & weapon
  rect(ctx, 3, 8, 2, 3, '#b45309');
  rect(ctx, 11, 8, 2, 2, '#b45309');
  rect(ctx, 12, 5, 1, 4, '#94a3b8');
  // legs
  rect(ctx, 6, 11, 2, 3, '#92400e');
  rect(ctx, 8, 11, 2, 3, '#92400e');
};

const drawOrc: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // head
  rect(ctx, 4, 1, 8, 6, '#65a30d');
  rect(ctx, 5, 2, 6, 4, '#84cc16');
  // eyes
  px(ctx, 6, 3, '#fef08a');
  px(ctx, 9, 3, '#fef08a');
  // tusks
  px(ctx, 5, 6, '#e5e7eb');
  px(ctx, 10, 6, '#e5e7eb');
  // body (large)
  rect(ctx, 3, 7, 10, 5, '#78716c');
  rect(ctx, 4, 8, 8, 3, '#a8a29e');
  // arms
  rect(ctx, 1, 8, 2, 4, '#65a30d');
  rect(ctx, 13, 8, 2, 4, '#65a30d');
  // axe
  rect(ctx, 14, 4, 1, 5, '#92400e');
  rect(ctx, 13, 3, 3, 2, '#94a3b8');
  // legs
  rect(ctx, 5, 12, 2, 3, '#4d7c0f');
  rect(ctx, 9, 12, 2, 3, '#4d7c0f');
};

const drawSkeleton: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // skull
  rect(ctx, 5, 1, 6, 5, '#e5e7eb');
  px(ctx, 6, 3, '#1e293b');
  px(ctx, 9, 3, '#1e293b');
  px(ctx, 7, 5, '#1e293b'); // nose
  // spine
  rect(ctx, 7, 6, 2, 5, '#d1d5db');
  // ribs
  rect(ctx, 4, 7, 8, 1, '#d1d5db');
  rect(ctx, 5, 9, 6, 1, '#d1d5db');
  // arms
  rect(ctx, 2, 7, 2, 1, '#d1d5db');
  rect(ctx, 12, 7, 2, 1, '#d1d5db');
  rect(ctx, 2, 7, 1, 3, '#d1d5db');
  rect(ctx, 13, 7, 1, 3, '#d1d5db');
  // legs
  rect(ctx, 6, 11, 1, 4, '#d1d5db');
  rect(ctx, 9, 11, 1, 4, '#d1d5db');
};

const drawGhost: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // translucent body
  rect(ctx, 4, 3, 8, 9, 'rgba(103, 232, 249, 0.7)');
  rect(ctx, 3, 5, 10, 5, 'rgba(103, 232, 249, 0.6)');
  // head
  rect(ctx, 5, 2, 6, 4, 'rgba(165, 243, 252, 0.8)');
  // eyes
  px(ctx, 6, 4, '#0c0a09');
  px(ctx, 9, 4, '#0c0a09');
  // mouth
  px(ctx, 7, 6, '#0c0a09');
  px(ctx, 8, 6, '#0c0a09');
  // wavy bottom
  px(ctx, 4, 12, 'rgba(103, 232, 249, 0.5)');
  px(ctx, 6, 13, 'rgba(103, 232, 249, 0.4)');
  px(ctx, 8, 12, 'rgba(103, 232, 249, 0.5)');
  px(ctx, 10, 13, 'rgba(103, 232, 249, 0.4)');
  px(ctx, 11, 12, 'rgba(103, 232, 249, 0.3)');
  // glow
  px(ctx, 5, 3, 'rgba(236, 254, 255, 0.5)');
};

const drawDarkMage: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // hat
  rect(ctx, 6, 0, 4, 2, '#7c3aed');
  rect(ctx, 4, 2, 8, 2, '#7c3aed');
  // face
  rect(ctx, 5, 4, 6, 4, '#c084fc');
  px(ctx, 6, 5, '#fef08a');
  px(ctx, 9, 5, '#fef08a');
  // robe
  rect(ctx, 4, 8, 8, 6, '#6d28d9');
  rect(ctx, 3, 10, 10, 3, '#6d28d9');
  // staff
  rect(ctx, 2, 3, 1, 11, '#a78bfa');
  px(ctx, 2, 2, '#fcd34d');
  px(ctx, 1, 2, '#fcd34d');
  px(ctx, 3, 2, '#fcd34d');
};

const drawMimic: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // chest body (looks like a chest but with teeth)
  rect(ctx, 2, 6, 12, 8, '#b45309');
  rect(ctx, 3, 7, 10, 6, '#d97706');
  // open lid with teeth
  rect(ctx, 2, 3, 12, 4, '#92400e');
  rect(ctx, 3, 4, 10, 2, '#b45309');
  // teeth
  px(ctx, 4, 6, '#e5e7eb');
  px(ctx, 6, 7, '#e5e7eb');
  px(ctx, 8, 6, '#e5e7eb');
  px(ctx, 10, 7, '#e5e7eb');
  px(ctx, 11, 6, '#e5e7eb');
  // evil eyes
  px(ctx, 5, 4, '#ef4444');
  px(ctx, 10, 4, '#ef4444');
  // tongue
  rect(ctx, 7, 7, 2, 2, '#f87171');
  px(ctx, 7, 9, '#f87171');
};

const drawDragon: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // body
  rect(ctx, 3, 6, 10, 7, '#dc2626');
  rect(ctx, 2, 8, 12, 4, '#ef4444');
  // head
  rect(ctx, 5, 2, 6, 5, '#ef4444');
  px(ctx, 6, 3, '#fef08a');
  px(ctx, 9, 3, '#fef08a');
  // mouth
  rect(ctx, 6, 6, 4, 1, '#fca5a5');
  // wings
  rect(ctx, 0, 5, 3, 5, '#b91c1c');
  rect(ctx, 13, 5, 3, 5, '#b91c1c');
  px(ctx, 0, 4, '#b91c1c');
  px(ctx, 15, 4, '#b91c1c');
  // tail
  rect(ctx, 12, 12, 3, 1, '#dc2626');
  px(ctx, 15, 13, '#dc2626');
  // belly
  rect(ctx, 5, 9, 6, 3, '#fca5a5');
  // legs
  rect(ctx, 4, 13, 2, 2, '#b91c1c');
  rect(ctx, 9, 13, 2, 2, '#b91c1c');
};

const drawPotion: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  rect(ctx, 6, 3, 4, 2, '#94a3b8');
  rect(ctx, 4, 5, 8, 8, '#f87171');
  rect(ctx, 5, 6, 6, 6, '#fca5a5');
  rect(ctx, 4, 13, 8, 1, '#f87171');
  // highlight
  px(ctx, 6, 7, '#fecaca');
};

const drawGreaterPotion: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  rect(ctx, 6, 3, 4, 2, '#94a3b8');
  rect(ctx, 4, 5, 8, 8, '#f9a8d4');
  rect(ctx, 5, 6, 6, 6, '#fbcfe8');
  rect(ctx, 4, 13, 8, 1, '#f9a8d4');
  px(ctx, 6, 7, '#fce7f3');
  // sparkle
  px(ctx, 9, 8, '#fef08a');
};

const drawIronSword: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // blade
  for (let i = 0; i < 8; i++) px(ctx, 11 - i, 2 + i, '#cbd5e1');
  for (let i = 0; i < 8; i++) px(ctx, 12 - i, 2 + i, '#94a3b8');
  // guard
  rect(ctx, 2, 10, 6, 1, '#a16207');
  // handle
  rect(ctx, 4, 11, 2, 3, '#92400e');
};

const drawFlameSword: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  for (let i = 0; i < 8; i++) px(ctx, 11 - i, 2 + i, '#fb7185');
  for (let i = 0; i < 8; i++) px(ctx, 12 - i, 2 + i, '#f43f5e');
  // flame tip
  px(ctx, 12, 1, '#fcd34d');
  px(ctx, 11, 1, '#fb923c');
  px(ctx, 13, 2, '#fcd34d');
  // guard
  rect(ctx, 2, 10, 6, 1, '#a16207');
  rect(ctx, 4, 11, 2, 3, '#92400e');
};

const drawLeatherArmor: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  rect(ctx, 4, 3, 8, 10, '#d6a369');
  rect(ctx, 5, 4, 6, 8, '#c49a6c');
  // shoulders
  rect(ctx, 2, 3, 3, 3, '#d6a369');
  rect(ctx, 11, 3, 3, 3, '#d6a369');
  // belt
  rect(ctx, 4, 9, 8, 1, '#92400e');
  px(ctx, 8, 9, '#fcd34d');
};

const drawSteelArmor: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  rect(ctx, 4, 3, 8, 10, '#94a3b8');
  rect(ctx, 5, 4, 6, 8, '#cbd5e1');
  rect(ctx, 2, 3, 3, 3, '#94a3b8');
  rect(ctx, 11, 3, 3, 3, '#94a3b8');
  rect(ctx, 4, 9, 8, 1, '#64748b');
  px(ctx, 8, 9, '#fcd34d');
  // shine
  px(ctx, 6, 5, '#e2e8f0');
  px(ctx, 7, 5, '#e2e8f0');
};

const drawScroll: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // roll ends
  rect(ctx, 4, 2, 8, 2, '#dbeafe');
  rect(ctx, 4, 12, 8, 2, '#dbeafe');
  // paper
  rect(ctx, 5, 4, 6, 8, '#eff6ff');
  // text lines
  rect(ctx, 6, 5, 4, 1, '#3b82f6');
  rect(ctx, 6, 7, 3, 1, '#3b82f6');
  rect(ctx, 6, 9, 4, 1, '#3b82f6');
  // lightning symbol
  px(ctx, 7, 6, '#fcd34d');
  px(ctx, 8, 8, '#fcd34d');
};

const drawChestClosed: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  rect(ctx, 2, 5, 12, 9, '#b45309');
  rect(ctx, 3, 6, 10, 7, '#d97706');
  // lid
  rect(ctx, 2, 5, 12, 3, '#92400e');
  rect(ctx, 3, 5, 10, 2, '#b45309');
  // lock
  rect(ctx, 7, 7, 2, 3, '#fcd34d');
  px(ctx, 7, 9, '#fbbf24');
  px(ctx, 8, 9, '#fbbf24');
};

const drawChestOpen: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  rect(ctx, 2, 8, 12, 6, '#78716c');
  rect(ctx, 3, 9, 10, 4, '#a8a29e');
  // lid open
  rect(ctx, 2, 3, 12, 5, '#78716c');
  rect(ctx, 3, 4, 10, 3, '#a8a29e');
  // sparkle
  px(ctx, 5, 10, '#fcd34d');
  px(ctx, 10, 11, '#fcd34d');
};

const drawTrapHidden: DrawFn = (ctx) => {
  // Look exactly like floor
  drawFloor(ctx);
};

const drawTrapSpike: DrawFn = (ctx) => {
  drawFloor(ctx);
  // spikes
  const spike = '#ef4444';
  for (let i = 0; i < 4; i++) {
    const x = 3 + i * 3;
    px(ctx, x, 6, spike);
    px(ctx, x, 5, spike);
    px(ctx, x, 4, '#fca5a5');
  }
  for (let i = 0; i < 3; i++) {
    const x = 5 + i * 3;
    px(ctx, x, 10, spike);
    px(ctx, x, 9, spike);
    px(ctx, x, 8, '#fca5a5');
  }
};

const drawHealer: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // glow aura
  rect(ctx, 3, 3, 10, 11, 'rgba(74, 222, 128, 0.15)');
  // head
  rect(ctx, 6, 2, 4, 4, '#bbf7d0');
  px(ctx, 7, 4, '#166534');
  px(ctx, 9, 4, '#166534');
  // body
  rect(ctx, 5, 6, 6, 5, '#4ade80');
  // cross
  rect(ctx, 7, 7, 2, 3, '#f0fdf4');
  rect(ctx, 6, 8, 4, 1, '#f0fdf4');
  // legs
  rect(ctx, 6, 11, 2, 3, '#22c55e');
  rect(ctx, 8, 11, 2, 3, '#22c55e');
};

const drawSage: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // hat
  rect(ctx, 5, 0, 6, 3, '#7c3aed');
  px(ctx, 8, 0, '#a78bfa');
  // head
  rect(ctx, 5, 3, 6, 4, '#ddd6fe');
  px(ctx, 6, 4, '#4c1d95');
  px(ctx, 9, 4, '#4c1d95');
  // beard
  rect(ctx, 6, 6, 4, 2, '#e5e7eb');
  // robe
  rect(ctx, 4, 8, 8, 5, '#8b5cf6');
  rect(ctx, 5, 9, 6, 3, '#a78bfa');
  // staff star
  px(ctx, 2, 4, '#fcd34d');
  px(ctx, 2, 5, '#a78bfa');
  rect(ctx, 2, 6, 1, 8, '#a78bfa');
  // legs
  rect(ctx, 5, 13, 3, 2, '#6d28d9');
  rect(ctx, 8, 13, 3, 2, '#6d28d9');
};

const drawMerchant: DrawFn = (ctx) => {
  ctx.clearRect(0, 0, 16, 16);
  // head
  rect(ctx, 5, 1, 6, 5, '#fde68a');
  px(ctx, 6, 3, '#78350f');
  px(ctx, 9, 3, '#78350f');
  // smile
  px(ctx, 7, 4, '#78350f');
  px(ctx, 8, 4, '#78350f');
  // hat
  rect(ctx, 4, 0, 8, 2, '#b91c1c');
  // body
  rect(ctx, 4, 6, 8, 5, '#1d4ed8');
  rect(ctx, 5, 7, 6, 3, '#2563eb');
  // money bag
  rect(ctx, 10, 7, 3, 3, '#fbbf24');
  px(ctx, 11, 8, '#78350f');
  // legs
  rect(ctx, 5, 11, 2, 3, '#1e3a5f');
  rect(ctx, 9, 11, 2, 3, '#1e3a5f');
};

const drawFogExplored: DrawFn = (ctx) => {
  fillAll(ctx, '#131b2e');
};

const drawFogHidden: DrawFn = (ctx) => {
  fillAll(ctx, '#02040a');
};

/* ── painter map ────────────────────────────────────────────── */

const PAINTERS: Record<SpriteKey, DrawFn> = {
  wall: drawWall,
  floor: drawFloor,
  corridor: drawCorridor,
  stairs: drawStairs,
  door: drawDoor,
  player: drawPlayer,
  slime: drawSlime,
  bat: drawBat,
  goblin: drawGoblin,
  orc: drawOrc,
  skeleton: drawSkeleton,
  ghost: drawGhost,
  'dark-mage': drawDarkMage,
  mimic: drawMimic,
  dragon: drawDragon,
  potion: drawPotion,
  'greater-potion': drawGreaterPotion,
  'iron-sword': drawIronSword,
  'flame-sword': drawFlameSword,
  'leather-armor': drawLeatherArmor,
  'steel-armor': drawSteelArmor,
  scroll: drawScroll,
  'chest-closed': drawChestClosed,
  'chest-open': drawChestOpen,
  'trap-hidden': drawTrapHidden,
  'trap-spike': drawTrapSpike,
  healer: drawHealer,
  sage: drawSage,
  merchant: drawMerchant,
  'fog-explored': drawFogExplored,
  'fog-hidden': drawFogHidden,
};

/* ── atlas class ────────────────────────────────────────────── */

export class SpriteAtlas {
  private readonly atlas: HTMLCanvasElement;
  private readonly positions: Map<SpriteKey, { x: number; y: number }>;

  constructor() {
    const count = SPRITE_ORDER.length;
    const rows = Math.ceil(count / COLS);
    this.atlas = document.createElement('canvas');
    this.atlas.width = COLS * SPRITE_SRC;
    this.atlas.height = rows * SPRITE_SRC;
    this.positions = new Map();

    const atlasCtx = this.atlas.getContext('2d')!;
    // Use a temporary small canvas for each sprite
    const tmp = document.createElement('canvas');
    tmp.width = SPRITE_SRC;
    tmp.height = SPRITE_SRC;
    const tmpCtx = tmp.getContext('2d')!;

    SPRITE_ORDER.forEach((key, index) => {
      const col = index % COLS;
      const row = Math.floor(index / COLS);
      tmpCtx.clearRect(0, 0, SPRITE_SRC, SPRITE_SRC);
      PAINTERS[key](tmpCtx);
      atlasCtx.drawImage(tmp, col * SPRITE_SRC, row * SPRITE_SRC);
      this.positions.set(key, { x: col * SPRITE_SRC, y: row * SPRITE_SRC });
    });
  }

  draw(
    ctx: CanvasRenderingContext2D,
    key: SpriteKey,
    destX: number,
    destY: number,
    destSize: number = TILE_SIZE,
  ): void {
    const pos = this.positions.get(key);
    if (!pos) return;
    ctx.drawImage(
      this.atlas,
      pos.x, pos.y, SPRITE_SRC, SPRITE_SRC,
      destX, destY, destSize, destSize,
    );
  }

  /** Draw with a color tint overlay (for fog-explored tiles) */
  drawDim(
    ctx: CanvasRenderingContext2D,
    key: SpriteKey,
    destX: number,
    destY: number,
    destSize: number = TILE_SIZE,
    alpha: number = 0.35,
  ): void {
    ctx.globalAlpha = alpha;
    this.draw(ctx, key, destX, destY, destSize);
    ctx.globalAlpha = 1;
  }
}
