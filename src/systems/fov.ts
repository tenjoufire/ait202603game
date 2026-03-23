import type { Position } from '../entities/entity';

const linePoints = (from: Position, to: Position): Position[] => {
  const points: Position[] = [];
  let x0 = from.x;
  let y0 = from.y;
  const x1 = to.x;
  const y1 = to.y;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) {
      break;
    }
    const twice = err * 2;
    if (twice > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (twice < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return points;
};

export const computeVisibleTiles = (
  origin: Position,
  radius: number,
  isBlockingSight: (x: number, y: number) => boolean,
): Set<string> => {
  const visible = new Set<string>();
  for (let y = origin.y - radius; y <= origin.y + radius; y += 1) {
    for (let x = origin.x - radius; x <= origin.x + radius; x += 1) {
      const distance = Math.abs(x - origin.x) + Math.abs(y - origin.y);
      if (distance > radius) {
        continue;
      }
      const line = linePoints(origin, { x, y });
      for (const point of line) {
        visible.add(`${point.x},${point.y}`);
        if ((point.x !== origin.x || point.y !== origin.y) && isBlockingSight(point.x, point.y)) {
          break;
        }
      }
    }
  }
  return visible;
};