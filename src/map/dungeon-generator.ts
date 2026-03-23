import { BSP_DEPTH, BSP_MAX_ROOM_SIZE, BSP_MIN_ROOM_SIZE, MAP_HEIGHT, MAP_WIDTH } from '../constants';
import { createEnemy, getEnemyTemplatesForFloor, type Enemy } from '../entities/enemy';
import { createItem, ITEM_TEMPLATES, type Item } from '../entities/item';
import { Random } from '../utils/random';
import { Room } from './room';
import { createTile, type Tile } from './tile';

interface Leaf {
  x: number;
  y: number;
  width: number;
  height: number;
  depth: number;
}

export interface DungeonMap {
  width: number;
  height: number;
  tiles: Tile[][];
  rooms: Room[];
  explored: boolean[][];
  stairs: { x: number; y: number };
}

export interface FloorContent {
  map: DungeonMap;
  start: { x: number; y: number };
  enemies: Enemy[];
  items: Item[];
}

const createExplored = (width: number, height: number): boolean[][] => Array.from({ length: height }, () => Array.from({ length: width }, () => false));

const carveRoom = (tiles: Tile[][], room: Room): void => {
  for (let y = room.y; y < room.y + room.height; y += 1) {
    for (let x = room.x; x < room.x + room.width; x += 1) {
      tiles[y][x] = createTile('floor');
    }
  }
};

const carveHorizontalTunnel = (tiles: Tile[][], x1: number, x2: number, y: number): void => {
  for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x += 1) {
    tiles[y][x] = createTile('corridor');
  }
};

const carveVerticalTunnel = (tiles: Tile[][], y1: number, y2: number, x: number): void => {
  for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y += 1) {
    tiles[y][x] = createTile('corridor');
  }
};

const splitLeaf = (leaf: Leaf, random: Random): [Leaf, Leaf] | null => {
  if (leaf.depth >= BSP_DEPTH) {
    return null;
  }

  const splitHorizontally = leaf.width < leaf.height ? true : leaf.width > leaf.height ? false : random.chance(0.5);

  if (splitHorizontally) {
    const minSplit = BSP_MIN_ROOM_SIZE + 2;
    const maxSplit = leaf.height - BSP_MIN_ROOM_SIZE - 2;
    if (maxSplit <= minSplit) {
      return null;
    }
    const split = random.int(minSplit, maxSplit);
    return [
      { x: leaf.x, y: leaf.y, width: leaf.width, height: split, depth: leaf.depth + 1 },
      { x: leaf.x, y: leaf.y + split, width: leaf.width, height: leaf.height - split, depth: leaf.depth + 1 },
    ];
  }

  const minSplit = BSP_MIN_ROOM_SIZE + 2;
  const maxSplit = leaf.width - BSP_MIN_ROOM_SIZE - 2;
  if (maxSplit <= minSplit) {
    return null;
  }
  const split = random.int(minSplit, maxSplit);
  return [
    { x: leaf.x, y: leaf.y, width: split, height: leaf.height, depth: leaf.depth + 1 },
    { x: leaf.x + split, y: leaf.y, width: leaf.width - split, height: leaf.height, depth: leaf.depth + 1 },
  ];
};

const generateLeaves = (random: Random): Leaf[] => {
  const leaves: Leaf[] = [{ x: 1, y: 1, width: MAP_WIDTH - 2, height: MAP_HEIGHT - 2, depth: 0 }];
  for (let index = 0; index < leaves.length; index += 1) {
    const split = splitLeaf(leaves[index], random);
    if (!split) {
      continue;
    }
    leaves.splice(index, 1, split[0], split[1]);
    index -= 1;
  }
  return leaves;
};

const createRoomInLeaf = (leaf: Leaf, random: Random): Room => {
  const width = random.int(BSP_MIN_ROOM_SIZE, Math.min(BSP_MAX_ROOM_SIZE, leaf.width - 2));
  const height = random.int(BSP_MIN_ROOM_SIZE, Math.min(BSP_MAX_ROOM_SIZE, leaf.height - 2));
  const x = random.int(leaf.x + 1, leaf.x + leaf.width - width - 1);
  const y = random.int(leaf.y + 1, leaf.y + leaf.height - height - 1);
  return new Room(x, y, width, height);
};

const randomOpenPosition = (room: Room, random: Random): { x: number; y: number } => ({
  x: random.int(room.x + 1, room.x + room.width - 2),
  y: random.int(room.y + 1, room.y + room.height - 2),
});

export const generateDungeon = (floor: number, seed = Date.now()): FloorContent => {
  const random = new Random(seed + floor * 9973);
  const tiles = Array.from({ length: MAP_HEIGHT }, () => Array.from({ length: MAP_WIDTH }, () => createTile('wall')));
  const leaves = generateLeaves(random);
  const rooms = leaves.map((leaf) => createRoomInLeaf(leaf, random));

  for (const room of rooms) {
    carveRoom(tiles, room);
  }

  for (let index = 1; index < rooms.length; index += 1) {
    const prev = rooms[index - 1].center;
    const next = rooms[index].center;
    if (random.chance(0.5)) {
      carveHorizontalTunnel(tiles, prev.x, next.x, prev.y);
      carveVerticalTunnel(tiles, prev.y, next.y, next.x);
    } else {
      carveVerticalTunnel(tiles, prev.y, next.y, prev.x);
      carveHorizontalTunnel(tiles, prev.x, next.x, next.y);
    }
  }

  const start = rooms[0].center;
  const stairs = rooms[rooms.length - 1].center;
  tiles[stairs.y][stairs.x] = createTile('stairs');

  const enemies: Enemy[] = [];
  const items: Item[] = [];
  const enemyTemplates = getEnemyTemplatesForFloor(floor);
  const itemPool = ITEM_TEMPLATES.filter((item) => floor >= 3 || item.key !== 'flame-sword');

  rooms.slice(1).forEach((room, index) => {
    const enemyCount = random.int(0, floor >= 4 ? 3 : 2);
    for (let count = 0; count < enemyCount; count += 1) {
      const position = randomOpenPosition(room, random);
      if ((position.x === stairs.x && position.y === stairs.y) || enemies.some((enemy) => enemy.x === position.x && enemy.y === position.y)) {
        continue;
      }
      const template = floor >= 5 && index === rooms.length - 2 ? enemyTemplates[enemyTemplates.length - 1] : random.pick(enemyTemplates);
      enemies.push(createEnemy(template, position.x, position.y, `${floor}-${index}-${count}`));
    }

    if (random.chance(0.55)) {
      const position = randomOpenPosition(room, random);
      if ((position.x === stairs.x && position.y === stairs.y) || items.some((item) => item.x === position.x && item.y === position.y)) {
        return;
      }
      items.push(createItem(random.pick(itemPool), position.x, position.y, `${floor}-${index}`));
    }
  });

  return {
    map: {
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      tiles,
      rooms,
      explored: createExplored(MAP_WIDTH, MAP_HEIGHT),
      stairs,
    },
    start,
    enemies,
    items,
  };
};