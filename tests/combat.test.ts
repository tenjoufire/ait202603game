import { attackTarget, computeDamage } from '../src/systems/combat';
import { Random } from '../src/utils/random';

describe('combat', () => {
  it('deals at least 1 damage', () => {
    const random = new Random(7);
    const damage = computeDamage({ hp: 10, maxHp: 10, attack: 1, defense: 0 }, { hp: 10, maxHp: 10, attack: 0, defense: 99 }, random);
    expect(damage).toBe(1);
  });

  it('reduces defender hp', () => {
    const random = new Random(9);
    const attacker = { hp: 10, maxHp: 10, attack: 8, defense: 1 };
    const defender = { hp: 12, maxHp: 12, attack: 4, defense: 2 };
    attackTarget(attacker, defender, random);
    expect(defender.hp).toBeLessThan(12);
  });
});