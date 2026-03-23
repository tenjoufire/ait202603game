import type { Enemy } from '../entities/enemy';
import type { Position } from '../entities/entity';
import type { Player } from '../entities/player';
import type { DungeonMap } from '../map/dungeon-generator';
import { canMoveTo, moveActor } from './movement';
import { findPath } from '../utils/pathfinding';
import { Random } from '../utils/random';

const manhattanDistance = (a: Position, b: Position): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const decideEnemyStep = (
  enemy: Enemy,
  player: Player,
  map: DungeonMap,
  blockers: Position[],
  random: Random,
): Position | null => {
  const distance = manhattanDistance(enemy, player);
  const isWalkable = (x: number, y: number): boolean =>
    canMoveTo(
      map,
      x,
      y,
      blockers.filter((blocker) => blocker.x !== enemy.x || blocker.y !== enemy.y),
    ) || (x === player.x && y === player.y);

  if ((enemy.behavior === 'chase' || enemy.behavior === 'boss' || enemy.behavior === 'ranged') && distance <= enemy.sightRange) {
    if (enemy.behavior === 'ranged' && distance <= enemy.attackRange) {
      return null;
    }
    if (enemy.behavior === 'boss' && distance <= enemy.attackRange) {
      return null;
    }
    const path = findPath(enemy, player, isWalkable);
    return path[0] ?? null;
  }

  if (enemy.behavior === 'wander' && distance <= enemy.sightRange) {
    const path = findPath(enemy, player, isWalkable);
    return path[0] ?? null;
  }

  const directions = [
    { x: enemy.x + 1, y: enemy.y },
    { x: enemy.x - 1, y: enemy.y },
    { x: enemy.x, y: enemy.y + 1 },
    { x: enemy.x, y: enemy.y - 1 },
  ];

  const candidates = directions.filter((direction) => isWalkable(direction.x, direction.y));
  return candidates.length > 0 ? random.pick(candidates) : null;
};

export const applyEnemyStep = (enemy: Enemy, step: Position | null): void => {
  if (!step) {
    return;
  }
  moveActor(enemy, step.x - enemy.x, step.y - enemy.y);
};