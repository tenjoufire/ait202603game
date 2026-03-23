import { COLORS } from '../constants';
import type { Enemy } from '../entities/enemy';
import type { Player } from '../entities/player';
import type { DungeonMap } from '../map/dungeon-generator';

export const drawMinimap = (
  context: CanvasRenderingContext2D,
  map: DungeonMap,
  player: Player,
  enemies: Enemy[],
  originX: number,
  originY: number,
  width: number,
  height: number,
): void => {
  const cellWidth = width / map.width;
  const cellHeight = height / map.height;

  context.fillStyle = COLORS.uiPanel;
  context.fillRect(originX, originY, width, height);

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      if (!map.explored[y][x]) {
        continue;
      }
      const tile = map.tiles[y][x];
      context.fillStyle = tile.type === 'wall' ? COLORS.fogExplored : COLORS.floor;
      context.fillRect(originX + x * cellWidth, originY + y * cellHeight, Math.ceil(cellWidth), Math.ceil(cellHeight));
    }
  }

  for (const enemy of enemies) {
    if (!map.explored[enemy.y]?.[enemy.x]) {
      continue;
    }
    context.fillStyle = enemy.color;
    context.fillRect(originX + enemy.x * cellWidth, originY + enemy.y * cellHeight, Math.ceil(cellWidth), Math.ceil(cellHeight));
  }

  context.fillStyle = COLORS.player;
  context.fillRect(originX + player.x * cellWidth, originY + player.y * cellHeight, Math.ceil(cellWidth), Math.ceil(cellHeight));
};