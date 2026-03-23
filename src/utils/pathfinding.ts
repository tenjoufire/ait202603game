import type { Position } from '../entities/entity';

interface PathNode extends Position {
  cost: number;
  score: number;
  parent?: PathNode;
}

const keyOf = (x: number, y: number): string => `${x},${y}`;

const heuristic = (a: Position, b: Position): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const findPath = (
  start: Position,
  goal: Position,
  isWalkable: (x: number, y: number) => boolean,
): Position[] => {
  const open = new Map<string, PathNode>();
  const closed = new Set<string>();
  const startNode: PathNode = { ...start, cost: 0, score: heuristic(start, goal) };

  open.set(keyOf(start.x, start.y), startNode);

  while (open.size > 0) {
    const current = [...open.values()].reduce((best, node) => (node.score < best.score ? node : best));
    const currentKey = keyOf(current.x, current.y);

    if (current.x === goal.x && current.y === goal.y) {
      const path: Position[] = [];
      let pointer: PathNode | undefined = current;
      while (pointer?.parent) {
        path.unshift({ x: pointer.x, y: pointer.y });
        pointer = pointer.parent;
      }
      return path;
    }

    open.delete(currentKey);
    closed.add(currentKey);

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const neighbor of neighbors) {
      const neighborKey = keyOf(neighbor.x, neighbor.y);
      if (closed.has(neighborKey) || !isWalkable(neighbor.x, neighbor.y)) {
        continue;
      }

      const cost = current.cost + 1;
      const previous = open.get(neighborKey);
      if (previous && cost >= previous.cost) {
        continue;
      }

      open.set(neighborKey, {
        ...neighbor,
        cost,
        score: cost + heuristic(neighbor, goal),
        parent: current,
      });
    }
  }

  return [];
};