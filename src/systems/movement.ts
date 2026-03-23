import type { Enemy } from '../entities/enemy';
import type { Position } from '../entities/entity';
import type { Player } from '../entities/player';
import type { DungeonMap } from '../map/dungeon-generator';
import { isWalkable } from '../map/tile';

export const isInsideMap = (map: DungeonMap, x: number, y: number): boolean => x >= 0 && x < map.width && y >= 0 && y < map.height;

export const canMoveTo = (
  map: DungeonMap,
  x: number,
  y: number,
  blockers: Position[],
): boolean => isInsideMap(map, x, y) && isWalkable(map.tiles[y][x]) && !blockers.some((entity) => entity.x === x && entity.y === y);

export const moveActor = (actor: Player | Enemy, dx: number, dy: number): void => {
  actor.x += dx;
  actor.y += dy;
};