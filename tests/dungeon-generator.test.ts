import { generateDungeon } from '../src/map/dungeon-generator';

describe('generateDungeon', () => {
  it('creates rooms, a start position, and stairs', () => {
    const { map, start } = generateDungeon(1, 1234);

    expect(map.rooms.length).toBeGreaterThan(3);
    expect(map.tiles[start.y][start.x].blocksMovement).toBe(false);
    expect(map.tiles[map.stairs.y][map.stairs.x].type).toBe('stairs');
  });
});