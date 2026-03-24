import type { Entity } from './entity';
import type { Item } from './item';
import { createItem, ITEM_TEMPLATES, type ItemTemplate } from './item';
import type { Random } from '../utils/random';

export interface Chest extends Entity {
  opened: boolean;
  lootTemplate: ItemTemplate;
}

export const createChest = (x: number, y: number, random: Random, suffix: string): Chest => {
  const lootTemplate = random.pick(ITEM_TEMPLATES);
  return {
    id: `chest-${suffix}`,
    name: '宝箱',
    char: '◇',
    color: '#fbbf24',
    blocksMovement: false,
    x,
    y,
    opened: false,
    lootTemplate,
  };
};

export const openChest = (chest: Chest, random: Random): Item => {
  chest.opened = true;
  chest.char = '◆';
  chest.color = '#78716c';
  chest.name = '空の宝箱';
  return createItem(chest.lootTemplate, chest.x, chest.y, `chest-${chest.id}-${random.int(0, 9999)}`);
};
