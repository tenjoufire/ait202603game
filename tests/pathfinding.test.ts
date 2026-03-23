import { findPath } from '../src/utils/pathfinding';

describe('findPath', () => {
  it('finds a path around blocked cells', () => {
    const blocked = new Set(['1,0', '1,1']);
    const path = findPath(
      { x: 0, y: 0 },
      { x: 2, y: 1 },
      (x, y) => x >= 0 && y >= 0 && x <= 2 && y <= 2 && !blocked.has(`${x},${y}`),
    );

    expect(path.length).toBeGreaterThan(0);
    expect(path[path.length - 1]).toEqual({ x: 2, y: 1 });
  });
});