import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLORS,
  LOG_HEIGHT,
  SIDEBAR_WIDTH,
  TILE_FONT,
  TILE_SIZE,
  UI_FONT,
  VIEWPORT_HEIGHT,
  VIEWPORT_WIDTH,
} from '../constants';
import type { Difficulty } from '../difficulty';
import type { Chest } from '../entities/chest';
import type { Enemy } from '../entities/enemy';
import type { Item } from '../entities/item';
import type { Npc } from '../entities/npc';
import type { Player } from '../entities/player';
import type { Trap } from '../entities/trap';
import type { DungeonMap } from '../map/dungeon-generator';
import type { TileType } from '../map/tile';
import { drawHud } from '../ui/hud';
import { drawTitleScreen } from '../ui/title-screen';
import type { VisualEffect } from '../systems/effects';
import { SpriteAtlas, type SpriteKey } from './sprite-atlas';

export type RenderState = 'title' | 'playing' | 'inventory' | 'gameover' | 'victory';

export interface RenderPayload {
  state: RenderState;
  floor: number;
  player: Player;
  enemies: Enemy[];
  items: Item[];
  chests: Chest[];
  traps: Trap[];
  npcs: Npc[];
  map: DungeonMap;
  messages: string[];
  visibleTiles: Set<string>;
  highScores: number[];
  effects: readonly VisualEffect[];
  screenOffset: { x: number; y: number };
  selectedDifficulty: Difficulty;
}

const tileToSprite = (type: TileType): SpriteKey => {
  switch (type) {
    case 'wall': return 'wall';
    case 'floor': return 'floor';
    case 'corridor': return 'corridor';
    case 'stairs': return 'stairs';
    case 'door': return 'door';
  }
};

const enemyKeyToSprite: Record<string, SpriteKey> = {
  slime: 'slime',
  bat: 'bat',
  goblin: 'goblin',
  orc: 'orc',
  skeleton: 'skeleton',
  ghost: 'ghost',
  'dark-mage': 'dark-mage',
  mimic: 'mimic',
  dragon: 'dragon',
};

const itemKeyToSprite: Record<string, SpriteKey> = {
  potion: 'potion',
  'greater-potion': 'greater-potion',
  'iron-sword': 'iron-sword',
  'flame-sword': 'flame-sword',
  'leather-armor': 'leather-armor',
  'steel-armor': 'steel-armor',
  scroll: 'scroll',
};

const npcRoleToSprite: Record<string, SpriteKey> = {
  healer: 'healer',
  sage: 'sage',
  merchant: 'merchant',
};

export class Renderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly atlas: SpriteAtlas;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('2D context not available');
    }
    this.context = context;
    this.context.imageSmoothingEnabled = false;
    this.atlas = new SpriteAtlas();
  }

  render(payload: RenderPayload): void {
    if (payload.state === 'title') {
      drawTitleScreen(this.context, this.atlas, payload.selectedDifficulty);
      return;
    }

    this.context.fillStyle = COLORS.bg;
    this.context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply screen shake offset
    const shakeX = payload.screenOffset.x;
    const shakeY = payload.screenOffset.y;
    if (shakeX !== 0 || shakeY !== 0) {
      this.context.save();
      this.context.translate(shakeX, shakeY);
    }

    const cameraX = Math.max(0, Math.min(payload.player.x - Math.floor(VIEWPORT_WIDTH / 2), payload.map.width - VIEWPORT_WIDTH));
    const cameraY = Math.max(0, Math.min(payload.player.y - Math.floor(VIEWPORT_HEIGHT / 2), payload.map.height - VIEWPORT_HEIGHT));

    // Draw tiles
    for (let screenY = 0; screenY < VIEWPORT_HEIGHT; screenY += 1) {
      for (let screenX = 0; screenX < VIEWPORT_WIDTH; screenX += 1) {
        const mapX = cameraX + screenX;
        const mapY = cameraY + screenY;
        const tile = payload.map.tiles[mapY]?.[mapX];
        if (!tile) continue;
        const key = `${mapX},${mapY}`;
        const drawX = screenX * TILE_SIZE;
        const drawY = screenY * TILE_SIZE;
        const visible = payload.visibleTiles.has(key);
        const explored = payload.map.explored[mapY][mapX];

        if (!visible && !explored) {
          this.atlas.draw(this.context, 'fog-hidden', drawX, drawY);
          continue;
        }

        if (visible) {
          this.atlas.draw(this.context, tileToSprite(tile.type), drawX, drawY);
        } else {
          this.atlas.draw(this.context, 'fog-hidden', drawX, drawY);
          this.atlas.drawDim(this.context, tileToSprite(tile.type), drawX, drawY, TILE_SIZE, 0.35);
        }
      }
    }

    // Draw traps
    for (const trap of payload.traps) {
      if (trap.triggered) {
        this.drawSprite(trap.x, trap.y, cameraX, cameraY, 'trap-spike', payload.visibleTiles);
      }
    }
    // Draw chests
    for (const chest of payload.chests) {
      this.drawSprite(chest.x, chest.y, cameraX, cameraY, chest.opened ? 'chest-open' : 'chest-closed', payload.visibleTiles);
    }
    // Draw items
    for (const item of payload.items) {
      const spriteKey = itemKeyToSprite[item.id.split('-')[1]] ?? this.itemKindToSprite(item);
      this.drawSprite(item.x, item.y, cameraX, cameraY, spriteKey, payload.visibleTiles);
    }
    // Draw NPCs
    for (const npc of payload.npcs) {
      this.drawSprite(npc.x, npc.y, cameraX, cameraY, npcRoleToSprite[npc.role] ?? 'sage', payload.visibleTiles);
    }
    // Draw enemies
    for (const enemy of payload.enemies) {
      const spriteKey = enemyKeyToSprite[enemy.id.split('-')[1]] ?? 'slime';
      this.drawSprite(enemy.x, enemy.y, cameraX, cameraY, spriteKey, payload.visibleTiles);
    }
    // Draw player (always visible)
    this.drawSpriteForce(payload.player.x, payload.player.y, cameraX, cameraY, 'player');

    // Draw visual effects (hit sparks, damage numbers)
    this.drawEffects(payload.effects, cameraX, cameraY);

    // Restore screen shake translation
    if (shakeX !== 0 || shakeY !== 0) {
      this.context.restore();
    }

    // HUD
    const exploredTiles = payload.map.explored.flat().filter(Boolean).length;
    const mapExploredPercent = Math.round((exploredTiles / (payload.map.width * payload.map.height)) * 100);
    drawHud(this.context, payload.player, payload.enemies, payload.floor, mapExploredPercent, payload.map);
    this.drawLog(payload.messages);

    // Overlays
    if (payload.state === 'inventory') {
      this.drawOverlay('⚔ Inventory', payload.player.inventory.map((item, index) => `${index + 1}. ${item.name}${item.equipped ? ' [装備中]' : ''}`));
    }
    if (payload.state === 'gameover') {
      this.drawOverlay('💀 Game Over', [`Score: ${payload.player.score}`, 'Enter で再挑戦', '', '— High Scores —', ...payload.highScores.map((score, index) => `#${index + 1}  ${score}`)]);
    }
    if (payload.state === 'victory') {
      this.drawOverlay('🏆 Victory!', [`Score: ${payload.player.score}`, 'ドラゴンを倒して迷宮を踏破した。', 'Enter で再挑戦', '', '— High Scores —', ...payload.highScores.map((score, index) => `#${index + 1}  ${score}`)]);
    }

    // Screen flash overlay (drawn on top of everything)
    for (const effect of payload.effects) {
      if (effect.type === 'flash') {
        const progress = effect.elapsed / effect.duration;
        const alpha = effect.alpha * (1 - progress);
        this.context.globalAlpha = alpha;
        this.context.fillStyle = effect.color;
        this.context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.context.globalAlpha = 1;
      }
    }
  }

  private itemKindToSprite(item: { kind: string }): SpriteKey {
    switch (item.kind) {
      case 'heal': return 'potion';
      case 'weapon': return 'iron-sword';
      case 'armor': return 'leather-armor';
      case 'scroll': return 'scroll';
      default: return 'potion';
    }
  }

  private drawSprite(
    x: number,
    y: number,
    cameraX: number,
    cameraY: number,
    spriteKey: SpriteKey,
    visibleTiles: Set<string>,
  ): void {
    if (!visibleTiles.has(`${x},${y}`)) return;
    const screenX = x - cameraX;
    const screenY = y - cameraY;
    if (screenX < 0 || screenY < 0 || screenX >= VIEWPORT_WIDTH || screenY >= VIEWPORT_HEIGHT) return;
    this.atlas.draw(this.context, spriteKey, screenX * TILE_SIZE, screenY * TILE_SIZE);
  }

  private drawSpriteForce(
    x: number,
    y: number,
    cameraX: number,
    cameraY: number,
    spriteKey: SpriteKey,
  ): void {
    const screenX = x - cameraX;
    const screenY = y - cameraY;
    if (screenX < 0 || screenY < 0 || screenX >= VIEWPORT_WIDTH || screenY >= VIEWPORT_HEIGHT) return;
    this.atlas.draw(this.context, spriteKey, screenX * TILE_SIZE, screenY * TILE_SIZE);
  }

  private drawEffects(effects: readonly VisualEffect[], cameraX: number, cameraY: number): void {
    for (const effect of effects) {
      if (effect.type === 'hit-spark') {
        const progress = effect.elapsed / effect.duration;
        const alpha = 1 - progress;
        const screenX = (effect.x - cameraX) * TILE_SIZE + TILE_SIZE / 2;
        const screenY = (effect.y - cameraY) * TILE_SIZE + TILE_SIZE / 2;
        if (screenX < 0 || screenY < 0 || screenX > VIEWPORT_WIDTH * TILE_SIZE || screenY > VIEWPORT_HEIGHT * TILE_SIZE) continue;
        this.context.globalAlpha = alpha;
        for (const p of effect.particles) {
          const px = screenX + p.dx * progress * 16;
          const py = screenY + p.dy * progress * 16;
          const size = p.size * (1 - progress * 0.5);
          this.context.fillStyle = effect.color;
          this.context.fillRect(px - size / 2, py - size / 2, size, size);
        }
        this.context.globalAlpha = 1;
      }

      if (effect.type === 'damage-number') {
        const progress = effect.elapsed / effect.duration;
        const alpha = 1 - progress;
        const screenX = (effect.x - cameraX) * TILE_SIZE + TILE_SIZE / 2;
        const screenY = (effect.y - cameraY) * TILE_SIZE - progress * 24;
        if (screenX < 0 || screenY < -30 || screenX > VIEWPORT_WIDTH * TILE_SIZE || screenY > VIEWPORT_HEIGHT * TILE_SIZE) continue;
        this.context.globalAlpha = alpha;
        this.context.font = 'bold 16px monospace';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        // Shadow
        this.context.fillStyle = '#000000';
        this.context.fillText(`${effect.value}`, screenX + 1, screenY + 1);
        // Number
        this.context.fillStyle = effect.color;
        this.context.fillText(`${effect.value}`, screenX, screenY);
        this.context.globalAlpha = 1;
      }
    }
    // Reset text alignment
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
  }

  private drawLog(messages: string[]): void {
    const top = CANVAS_HEIGHT - LOG_HEIGHT;
    // Panel background with gradient
    const grad = this.context.createLinearGradient(0, top, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, '#0d1525');
    grad.addColorStop(1, '#070d1a');
    this.context.fillStyle = grad;
    this.context.fillRect(0, top, CANVAS_WIDTH, LOG_HEIGHT);
    // Top border accent
    this.context.fillStyle = '#1e3a5f';
    this.context.fillRect(0, top, CANVAS_WIDTH, 1);
    this.context.textAlign = 'left';
    this.context.textBaseline = 'top';
    this.context.font = 'bold 13px monospace';
    this.context.fillStyle = '#60a5fa';
    this.context.fillText('▸ LOG', 12, top + 10);
    this.context.font = '14px monospace';
    messages.slice(-4).forEach((message, index) => {
      this.context.fillStyle = index === messages.slice(-4).length - 1 ? '#e5e7eb' : '#64748b';
      this.context.fillText(`  ${message}`, 12, top + 32 + index * 20);
    });
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
  }

  private drawOverlay(title: string, lines: string[]): void {
    // Full-screen dim
    this.context.fillStyle = 'rgba(2, 4, 15, 0.85)';
    this.context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Panel
    const panelX = 80;
    const panelY = 70;
    const panelW = CANVAS_WIDTH - 160;
    const panelH = CANVAS_HEIGHT - 140;
    // Border glow
    this.context.shadowColor = '#3b82f6';
    this.context.shadowBlur = 20;
    this.context.fillStyle = '#0f172a';
    this.roundRect(panelX, panelY, panelW, panelH, 12);
    this.context.fill();
    this.context.shadowBlur = 0;
    // Border
    this.context.strokeStyle = '#1e3a5f';
    this.context.lineWidth = 2;
    this.roundRect(panelX, panelY, panelW, panelH, 12);
    this.context.stroke();
    this.context.lineWidth = 1;
    // Title
    this.context.textAlign = 'center';
    this.context.textBaseline = 'top';
    this.context.font = 'bold 26px monospace';
    this.context.fillStyle = '#f8fafc';
    this.context.fillText(title, CANVAS_WIDTH / 2, panelY + 28);
    // Divider
    this.context.fillStyle = '#1e3a5f';
    this.context.fillRect(panelX + 30, panelY + 65, panelW - 60, 1);
    // Lines
    this.context.font = '15px monospace';
    lines.forEach((line, index) => {
      this.context.fillStyle = index < 2 ? '#e5e7eb' : '#64748b';
      this.context.fillText(line, CANVAS_WIDTH / 2, panelY + 82 + index * 28);
    });
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    this.context.beginPath();
    this.context.moveTo(x + r, y);
    this.context.lineTo(x + w - r, y);
    this.context.quadraticCurveTo(x + w, y, x + w, y + r);
    this.context.lineTo(x + w, y + h - r);
    this.context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.context.lineTo(x + r, y + h);
    this.context.quadraticCurveTo(x, y + h, x, y + h - r);
    this.context.lineTo(x, y + r);
    this.context.quadraticCurveTo(x, y, x + r, y);
    this.context.closePath();
  }
}