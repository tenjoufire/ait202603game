import { generateDungeon } from '../src/map/dungeon-generator';

describe('chests, traps, and NPCs generation', () => {
  it('generates chests, traps, and NPCs on higher floors', () => {
    // Use a fixed seed and run multiple floors to ensure at least some of each appear
    let totalChests = 0;
    let totalTraps = 0;
    let totalNpcs = 0;

    for (let floor = 1; floor <= 5; floor += 1) {
      const { chests, traps, npcs } = generateDungeon(floor, 42);
      totalChests += chests.length;
      totalTraps += traps.length;
      totalNpcs += npcs.length;
    }

    expect(totalChests).toBeGreaterThan(0);
    expect(totalTraps).toBeGreaterThan(0);
    expect(totalNpcs).toBeGreaterThan(0);
  });

  it('chests are not opened when generated', () => {
    const { chests } = generateDungeon(1, 99);
    for (const chest of chests) {
      expect(chest.opened).toBe(false);
    }
  });

  it('traps are not triggered when generated', () => {
    const { traps } = generateDungeon(2, 99);
    for (const trap of traps) {
      expect(trap.triggered).toBe(false);
    }
  });
});
