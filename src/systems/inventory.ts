import { INVENTORY_MAX } from '../constants';
import type { Enemy } from '../entities/enemy';
import type { Item } from '../entities/item';
import type { Player } from '../entities/player';

export const tryAddItem = (player: Player, item: Item): boolean => {
  if (player.inventory.length >= INVENTORY_MAX) {
    return false;
  }
  player.inventory.push(item);
  return true;
};

export const useInventoryItem = (
  player: Player,
  index: number,
  enemies: Enemy[],
): { consumed: boolean; messages: string[] } => {
  const item = player.inventory[index];
  if (!item) {
    return { consumed: false, messages: ['そのスロットには何もない。'] };
  }

  if (item.kind === 'heal') {
    const before = player.hp;
    player.hp = Math.min(player.maxHp, player.hp + item.power);
    player.inventory.splice(index, 1);
    return { consumed: true, messages: [`${item.name}を使った。HP+${player.hp - before}`] };
  }

  if (item.kind === 'scroll') {
    const hitEnemies = enemies.filter((enemy) => Math.abs(enemy.x - player.x) <= 2 && Math.abs(enemy.y - player.y) <= 2);
    for (const enemy of hitEnemies) {
      enemy.hp = Math.max(0, enemy.hp - item.power);
    }
    player.inventory.splice(index, 1);
    return {
      consumed: true,
      messages: hitEnemies.length > 0 ? [`${item.name}を使った。周囲の敵に${item.power}ダメージ。`] : [`${item.name}を使ったが、何も起きなかった。`],
    };
  }

  if (item.kind === 'weapon') {
    if (player.equippedWeapon) {
      player.equippedWeapon.equipped = false;
      player.attack -= player.equippedWeapon.power;
    }
    player.equippedWeapon = item;
    item.equipped = true;
    player.attack += item.power;
    return { consumed: false, messages: [`${item.name}を装備した。ATK+${item.power}`] };
  }

  if (player.equippedArmor) {
    player.equippedArmor.equipped = false;
    player.defense -= player.equippedArmor.power;
  }
  player.equippedArmor = item;
  item.equipped = true;
  player.defense += item.power;
  return { consumed: false, messages: [`${item.name}を装備した。DEF+${item.power}`] };
};