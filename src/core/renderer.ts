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
import type { Chest } from '../entities/chest';
import type { Enemy } from '../entities/enemy';
import type { Item } from '../entities/item';
import type { Npc } from '../entities/npc';
import type { Player } from '../entities/player';
import type { Trap } from '../entities/trap';
import type { DungeonMap } from '../map/dungeon-generator';
import { drawHud } from '../ui/hud';
import { drawTitleScreen } from '../ui/title-screen';

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
}

const tileColor = (type: DungeonMap['tiles'][number][number]['type']): string => {
  switch (type) {
    case 'wall':
      return COLORS.wall;
    case 'floor':
      return COLORS.floor;
    case 'corridor':
      return COLORS.corridor;
    case 'stairs':
      return COLORS.stairs;
    case 'door':
      return COLORS.door;
  }
};

export class Renderer {
  private readonly context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('2D context not available');
    }
    this.context = context;
    this.context.font = TILE_FONT;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
  }

  render(payload: RenderPayload): void {
    if (payload.state === 'title') {
      drawTitleScreen(this.context);
      return;
    }

    this.context.fillStyle = COLORS.bg;
    this.context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cameraX = Math.max(0, Math.min(payload.player.x - Math.floor(VIEWPORT_WIDTH / 2), payload.map.width - VIEWPORT_WIDTH));
    const cameraY = Math.max(0, Math.min(payload.player.y - Math.floor(VIEWPORT_HEIGHT / 2), payload.map.height - VIEWPORT_HEIGHT));

    for (let screenY = 0; screenY < VIEWPORT_HEIGHT; screenY += 1) {
      for (let screenX = 0; screenX < VIEWPORT_WIDTH; screenX += 1) {
        const mapX = cameraX + screenX;
        const mapY = cameraY + screenY;
        const tile = payload.map.tiles[mapY]?.[mapX];
        if (!tile) {
          continue;
        }
        const key = `${mapX},${mapY}`;
        const drawX = screenX * TILE_SIZE;
        const drawY = screenY * TILE_SIZE;
        const visible = payload.visibleTiles.has(key);
        const explored = payload.map.explored[mapY][mapX];

        if (!visible && !explored) {
          this.context.fillStyle = COLORS.fogHidden;
          this.context.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
          continue;
        }

        this.context.fillStyle = visible ? COLORS.bg : COLORS.fogExplored;
        this.context.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
        this.context.fillStyle = visible ? tileColor(tile.type) : COLORS.uiMuted;
        this.context.fillText(tile.type === 'wall' ? '#' : tile.type === 'stairs' ? '>' : '.', drawX + TILE_SIZE / 2, drawY + TILE_SIZE / 2);
      }
    }

    for (const trap of payload.traps) {
      if (trap.triggered) {
        this.drawEntity(trap.x, trap.y, cameraX, cameraY, '^', '#ef4444', payload.visibleTiles);
      }
    }
    for (const chest of payload.chests) {
      this.drawEntity(chest.x, chest.y, cameraX, cameraY, chest.char, chest.color, payload.visibleTiles);
    }
    for (const item of payload.items) {
      this.drawEntity(item.x, item.y, cameraX, cameraY, item.char, item.color, payload.visibleTiles);
    }
    for (const npc of payload.npcs) {
      this.drawEntity(npc.x, npc.y, cameraX, cameraY, npc.char, npc.color, payload.visibleTiles);
    }
    for (const enemy of payload.enemies) {
      this.drawEntity(enemy.x, enemy.y, cameraX, cameraY, enemy.char, enemy.color, payload.visibleTiles);
    }
    this.drawEntity(payload.player.x, payload.player.y, cameraX, cameraY, payload.player.char, payload.player.color, payload.visibleTiles, true);

    const exploredTiles = payload.map.explored.flat().filter(Boolean).length;
    const mapExploredPercent = Math.round((exploredTiles / (payload.map.width * payload.map.height)) * 100);
    drawHud(this.context, payload.player, payload.enemies, payload.floor, mapExploredPercent, payload.map);
    this.drawLog(payload.messages);

    if (payload.state === 'inventory') {
      this.drawOverlay('Inventory', payload.player.inventory.map((item, index) => `${index + 1}. ${item.name}${item.equipped ? ' [装備中]' : ''}`));
    }
    if (payload.state === 'gameover') {
      this.drawOverlay('Game Over', [`Score: ${payload.player.score}`, 'Enter で再挑戦', ...payload.highScores.map((score, index) => `#${index + 1} ${score}`)]);
    }
    if (payload.state === 'victory') {
      this.drawOverlay('Victory', [`Score: ${payload.player.score}`, 'ドラゴンを倒して迷宮を踏破した。', 'Enter で再挑戦', ...payload.highScores.map((score, index) => `#${index + 1} ${score}`)]);
    }
  }

  private drawEntity(
    x: number,
    y: number,
    cameraX: number,
    cameraY: number,
    glyph: string,
    color: string,
    visibleTiles: Set<string>,
    force = false,
  ): void {
    if (!force && !visibleTiles.has(`${x},${y}`)) {
      return;
    }
    const screenX = x - cameraX;
    const screenY = y - cameraY;
    if (screenX < 0 || screenY < 0 || screenX >= VIEWPORT_WIDTH || screenY >= VIEWPORT_HEIGHT) {
      return;
    }
    this.context.fillStyle = color;
    this.context.fillText(glyph, screenX * TILE_SIZE + TILE_SIZE / 2, screenY * TILE_SIZE + TILE_SIZE / 2);
  }

  private drawLog(messages: string[]): void {
    const top = CANVAS_HEIGHT - LOG_HEIGHT;
    this.context.fillStyle = COLORS.uiPanel;
    this.context.fillRect(0, top, CANVAS_WIDTH, LOG_HEIGHT);
    this.context.strokeStyle = COLORS.uiMuted;
    this.context.strokeRect(0, top, CANVAS_WIDTH, LOG_HEIGHT);
    this.context.textAlign = 'left';
    this.context.textBaseline = 'top';
    this.context.font = UI_FONT;
    this.context.fillStyle = COLORS.uiText;
    this.context.fillText('LOG', 12, top + 10);
    this.context.fillStyle = COLORS.uiMuted;
    messages.slice(-4).forEach((message, index) => {
      this.context.fillText(`> ${message}`, 12, top + 34 + index * 20);
    });
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.font = TILE_FONT;
  }

  private drawOverlay(title: string, lines: string[]): void {
    this.context.fillStyle = COLORS.overlay;
    this.context.fillRect(60, 60, CANVAS_WIDTH - 120, CANVAS_HEIGHT - 120);
    this.context.strokeStyle = COLORS.uiMuted;
    this.context.strokeRect(60, 60, CANVAS_WIDTH - 120, CANVAS_HEIGHT - 120);
    this.context.textAlign = 'center';
    this.context.textBaseline = 'top';
    this.context.font = 'bold 24px monospace';
    this.context.fillStyle = COLORS.uiText;
    this.context.fillText(title, CANVAS_WIDTH / 2, 100);
    this.context.font = UI_FONT;
    lines.forEach((line, index) => {
      this.context.fillStyle = index < 3 ? COLORS.uiText : COLORS.uiMuted;
      this.context.fillText(line, CANVAS_WIDTH / 2, 150 + index * 28);
    });
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.font = TILE_FONT;
  }
}