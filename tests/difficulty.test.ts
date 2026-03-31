import { ENEMY_TEMPLATES, createEnemy, getEnemyTemplatesForFloor } from '../src/entities/enemy';
import { ITEM_TEMPLATES } from '../src/entities/item';
import { TRAP_TEMPLATES } from '../src/entities/trap';
import { PLAYER_INITIAL_HP, PLAYER_INITIAL_ATK, PLAYER_INITIAL_DEF } from '../src/constants';
import { grantExperience } from '../src/systems/combat';
import { createPlayer } from '../src/entities/player';
import { generateDungeon } from '../src/map/dungeon-generator';

describe('difficulty adjustments', () => {
  describe('enemy stats', () => {
    it('slime has increased base stats', () => {
      const slime = ENEMY_TEMPLATES.find((e) => e.key === 'slime')!;
      expect(slime.hp).toBeGreaterThanOrEqual(18);
      expect(slime.attack).toBeGreaterThanOrEqual(5);
      expect(slime.defense).toBeGreaterThanOrEqual(1);
    });

    it('dragon has increased base stats', () => {
      const dragon = ENEMY_TEMPLATES.find((e) => e.key === 'dragon')!;
      expect(dragon.hp).toBeGreaterThanOrEqual(150);
      expect(dragon.attack).toBeGreaterThanOrEqual(28);
      expect(dragon.defense).toBeGreaterThanOrEqual(10);
    });
  });

  describe('per-floor enemy scaling', () => {
    it('enemies gain bonus stats on floors above their minFloor', () => {
      const slimeTemplate = ENEMY_TEMPLATES.find((e) => e.key === 'slime')!;
      const slimeFloor1 = createEnemy(slimeTemplate, 0, 0, 'test', 1);
      const slimeFloor5 = createEnemy(slimeTemplate, 0, 0, 'test', 5);
      expect(slimeFloor5.maxHp).toBeGreaterThan(slimeFloor1.maxHp);
      expect(slimeFloor5.attack).toBeGreaterThan(slimeFloor1.attack);
      // Verify 10% per-floor scaling: floor 5 slime (minFloor=1) should gain 40% bonus
      const expectedHp = slimeTemplate.hp + Math.floor(4 * 0.1 * slimeTemplate.hp);
      const expectedAtk = slimeTemplate.attack + Math.floor(4 * 0.1 * slimeTemplate.attack);
      expect(slimeFloor5.maxHp).toBe(expectedHp);
      expect(slimeFloor5.attack).toBe(expectedAtk);
    });

    it('enemies on their minFloor have base stats', () => {
      const goblinTemplate = ENEMY_TEMPLATES.find((e) => e.key === 'goblin')!;
      const goblin = createEnemy(goblinTemplate, 0, 0, 'test', 2);
      expect(goblin.maxHp).toBe(goblinTemplate.hp);
      expect(goblin.attack).toBe(goblinTemplate.attack);
      expect(goblin.defense).toBe(goblinTemplate.defense);
    });
  });

  describe('spawn rates', () => {
    it('floor 1 spawns at least 1 enemy per room', () => {
      const { enemies } = generateDungeon(1, 1234);
      expect(enemies.length).toBeGreaterThan(0);
    });

    it('higher floors spawn more enemies', () => {
      // Run several seeds and average to account for RNG
      let floor1Total = 0;
      let floor4Total = 0;
      for (let seed = 0; seed < 5; seed += 1) {
        floor1Total += generateDungeon(1, seed * 100).enemies.length;
        floor4Total += generateDungeon(4, seed * 100).enemies.length;
      }
      expect(floor4Total).toBeGreaterThan(floor1Total);
    });
  });

  describe('player stats', () => {
    it('player starts with reduced stats', () => {
      expect(PLAYER_INITIAL_HP).toBe(80);
      expect(PLAYER_INITIAL_ATK).toBe(7);
      expect(PLAYER_INITIAL_DEF).toBe(2);
    });

    it('player gains less HP and ATK per level', () => {
      const player = createPlayer(0, 0);
      const enemy = {
        id: 'e', name: 'test', char: 'x', color: '#fff', blocksMovement: true,
        x: 0, y: 0, maxHp: 0, hp: 0, attack: 0, defense: 0,
        behavior: 'wander' as const, expReward: 60, sightRange: 8, attackRange: 1,
      };
      grantExperience(player, enemy);
      // After one level up, player should gain +8 HP and +1 ATK
      expect(player.level).toBe(2);
      expect(player.maxHp).toBe(80 + 8);
      expect(player.attack).toBe(7 + 1);
    });
  });

  describe('item balancing', () => {
    it('potions heal less', () => {
      const potion = ITEM_TEMPLATES.find((i) => i.key === 'potion')!;
      const greaterPotion = ITEM_TEMPLATES.find((i) => i.key === 'greater-potion')!;
      expect(potion.power).toBe(20);
      expect(greaterPotion.power).toBe(40);
    });
  });

  describe('trap damage', () => {
    it('spike trap deals increased damage', () => {
      const spike = TRAP_TEMPLATES.find((t) => t.key === 'spike')!;
      expect(spike.damage).toBe(25);
    });

    it('poison trap deals increased damage', () => {
      const poison = TRAP_TEMPLATES.find((t) => t.key === 'poison')!;
      expect(poison.damage).toBe(15);
    });
  });
});
