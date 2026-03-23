import type { Enemy } from '../entities/enemy';
import type { Fighter } from '../entities/entity';
import type { Player } from '../entities/player';
import { Random } from '../utils/random';

export interface AttackResult {
  damage: number;
  defeated: boolean;
}

export const computeDamage = (attacker: Fighter, defender: Fighter, random: Random): number =>
  Math.max(1, attacker.attack - defender.defense + random.int(-2, 2));

export const attackTarget = (attacker: Fighter, defender: Fighter, random: Random): AttackResult => {
  const damage = computeDamage(attacker, defender, random);
  defender.hp = Math.max(0, defender.hp - damage);
  return { damage, defeated: defender.hp === 0 };
};

export const grantExperience = (player: Player, enemy: Enemy): string[] => {
  const messages: string[] = [];
  player.exp += enemy.expReward;
  player.score += enemy.expReward;
  messages.push(`${enemy.name}を倒した。EXP+${enemy.expReward}`);

  while (player.exp >= player.expToNext) {
    player.exp -= player.expToNext;
    player.level += 1;
    player.expToNext = player.level * 50;
    player.maxHp += 15;
    player.attack += 2;
    player.defense += 1;
    player.hp = player.maxHp;
    messages.push(`レベルアップ！ Lv.${player.level} になった。`);
  }

  return messages;
};