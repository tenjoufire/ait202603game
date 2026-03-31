import { ENEMY_TEMPLATES, createEnemy } from '../src/entities/enemy';
import { TRAP_TEMPLATES } from '../src/entities/trap';
import { DIFFICULTY_PRESETS, DIFFICULTIES } from '../src/difficulty';
import { grantExperience } from '../src/systems/combat';
import { createPlayer } from '../src/entities/player';
import { generateDungeon } from '../src/map/dungeon-generator';

describe('difficulty presets', () => {
  it('has exactly 3 difficulties: easy, normal, hard', () => {
    expect(DIFFICULTIES).toEqual(['easy', 'normal', 'hard']);
    expect(Object.keys(DIFFICULTY_PRESETS)).toHaveLength(3);
  });

  it('easy has highest player stats', () => {
    const { easy, normal, hard } = DIFFICULTY_PRESETS;
    expect(easy.playerHp).toBeGreaterThan(normal.playerHp);
    expect(normal.playerHp).toBeGreaterThan(hard.playerHp);
    expect(easy.playerAtk).toBeGreaterThan(normal.playerAtk);
    expect(normal.playerAtk).toBeGreaterThan(hard.playerAtk);
  });

  it('hard has highest enemy stat scale', () => {
    const { easy, normal, hard } = DIFFICULTY_PRESETS;
    expect(hard.enemyStatScale).toBeGreaterThan(normal.enemyStatScale);
    expect(normal.enemyStatScale).toBeGreaterThan(easy.enemyStatScale);
  });

  it('easy has more items and fewer traps', () => {
    const { easy, hard } = DIFFICULTY_PRESETS;
    expect(easy.itemSpawnChance).toBeGreaterThan(hard.itemSpawnChance);
    expect(easy.chestSpawnChance).toBeGreaterThan(hard.chestSpawnChance);
    expect(easy.trapSpawnChance).toBeLessThan(hard.trapSpawnChance);
  });

  it('easy has better healing', () => {
    const { easy, hard } = DIFFICULTY_PRESETS;
    expect(easy.potionPower).toBeGreaterThan(hard.potionPower);
    expect(easy.greaterPotionPower).toBeGreaterThan(hard.greaterPotionPower);
    expect(easy.healerFraction).toBeGreaterThan(hard.healerFraction);
  });
});

describe('difficulty-aware enemy creation', () => {
  it('easy enemies have lower stats than hard enemies', () => {
    const slime = ENEMY_TEMPLATES.find((e) => e.key === 'slime')!;
    const easy = createEnemy(slime, 0, 0, 'test', 1, DIFFICULTY_PRESETS.easy);
    const hard = createEnemy(slime, 0, 0, 'test', 1, DIFFICULTY_PRESETS.hard);
    expect(easy.maxHp).toBeLessThan(hard.maxHp);
    expect(easy.attack).toBeLessThan(hard.attack);
  });

  it('normal enemies match base template stats', () => {
    const slime = ENEMY_TEMPLATES.find((e) => e.key === 'slime')!;
    const normal = createEnemy(slime, 0, 0, 'test', 1, DIFFICULTY_PRESETS.normal);
    expect(normal.maxHp).toBe(slime.hp);
    expect(normal.attack).toBe(slime.attack);
  });

  it('per-floor scaling applies with difficulty', () => {
    const slime = ENEMY_TEMPLATES.find((e) => e.key === 'slime')!;
    const floor1 = createEnemy(slime, 0, 0, 'test', 1, DIFFICULTY_PRESETS.normal);
    const floor5 = createEnemy(slime, 0, 0, 'test', 5, DIFFICULTY_PRESETS.normal);
    expect(floor5.maxHp).toBeGreaterThan(floor1.maxHp);
  });

  it('hard mode per-floor scaling is steeper', () => {
    const slime = ENEMY_TEMPLATES.find((e) => e.key === 'slime')!;
    const normalFloor5 = createEnemy(slime, 0, 0, 'test', 5, DIFFICULTY_PRESETS.normal);
    const hardFloor5 = createEnemy(slime, 0, 0, 'test', 5, DIFFICULTY_PRESETS.hard);
    expect(hardFloor5.maxHp).toBeGreaterThan(normalFloor5.maxHp);
  });
});

describe('difficulty-aware player creation', () => {
  it('creates player with easy stats', () => {
    const player = createPlayer(0, 0, DIFFICULTY_PRESETS.easy);
    expect(player.hp).toBe(DIFFICULTY_PRESETS.easy.playerHp);
    expect(player.attack).toBe(DIFFICULTY_PRESETS.easy.playerAtk);
    expect(player.defense).toBe(DIFFICULTY_PRESETS.easy.playerDef);
  });

  it('creates player with hard stats', () => {
    const player = createPlayer(0, 0, DIFFICULTY_PRESETS.hard);
    expect(player.hp).toBe(DIFFICULTY_PRESETS.hard.playerHp);
    expect(player.attack).toBe(DIFFICULTY_PRESETS.hard.playerAtk);
    expect(player.defense).toBe(DIFFICULTY_PRESETS.hard.playerDef);
  });
});

describe('difficulty-aware leveling', () => {
  it('easy gives more stats per level', () => {
    const easy = DIFFICULTY_PRESETS.easy;
    const hard = DIFFICULTY_PRESETS.hard;
    const easyPlayer = createPlayer(0, 0, easy);
    const hardPlayer = createPlayer(0, 0, hard);
    const enemy = {
      id: 'e', name: 'test', char: 'x', color: '#fff', blocksMovement: true,
      x: 0, y: 0, maxHp: 0, hp: 0, attack: 0, defense: 0,
      behavior: 'wander' as const, expReward: 999, sightRange: 8, attackRange: 1,
    };
    grantExperience(easyPlayer, enemy, easy);
    grantExperience(hardPlayer, enemy, hard);
    // Both should have leveled up at least once
    expect(easyPlayer.level).toBeGreaterThanOrEqual(2);
    expect(hardPlayer.level).toBeGreaterThanOrEqual(2);
    // Easy player gains more HP per level
    expect(easy.levelUpHp).toBeGreaterThan(hard.levelUpHp);
  });

  it('normal uses correct exp curve', () => {
    const config = DIFFICULTY_PRESETS.normal;
    const player = createPlayer(0, 0, config);
    const enemy = {
      id: 'e', name: 'test', char: 'x', color: '#fff', blocksMovement: true,
      x: 0, y: 0, maxHp: 0, hp: 0, attack: 0, defense: 0,
      behavior: 'wander' as const, expReward: config.playerExpToNext, sightRange: 8, attackRange: 1,
    };
    grantExperience(player, enemy, config);
    expect(player.level).toBe(2);
    expect(player.maxHp).toBe(config.playerHp + config.levelUpHp);
    expect(player.attack).toBe(config.playerAtk + config.levelUpAtk);
  });
});

describe('difficulty-aware dungeon generation', () => {
  it('easy dungeons may have fewer enemies per room', () => {
    let easyTotal = 0;
    let hardTotal = 0;
    for (let seed = 0; seed < 5; seed += 1) {
      easyTotal += generateDungeon(1, seed * 100, DIFFICULTY_PRESETS.easy).enemies.length;
      hardTotal += generateDungeon(1, seed * 100, DIFFICULTY_PRESETS.hard).enemies.length;
    }
    expect(hardTotal).toBeGreaterThan(easyTotal);
  });

  it('easy dungeons have more items', () => {
    let easyTotal = 0;
    let hardTotal = 0;
    for (let seed = 0; seed < 10; seed += 1) {
      easyTotal += generateDungeon(2, seed * 100, DIFFICULTY_PRESETS.easy).items.length;
      hardTotal += generateDungeon(2, seed * 100, DIFFICULTY_PRESETS.hard).items.length;
    }
    expect(easyTotal).toBeGreaterThan(hardTotal);
  });

  it('generates valid dungeon for all difficulties', () => {
    for (const difficulty of DIFFICULTIES) {
      const config = DIFFICULTY_PRESETS[difficulty];
      const { map, start } = generateDungeon(1, 1234, config);
      expect(map.rooms.length).toBeGreaterThan(3);
      expect(map.tiles[start.y][start.x].blocksMovement).toBe(false);
      expect(map.tiles[map.stairs.y][map.stairs.x].type).toBe('stairs');
    }
  });
});
