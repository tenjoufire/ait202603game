import type { Entity } from './entity';

export type ItemKind = 'heal' | 'weapon' | 'armor' | 'scroll';

export interface Item extends Entity {
  kind: ItemKind;
  power: number;
  consumable: boolean;
  equipped?: boolean;
}

export interface ItemTemplate {
  key: string;
  name: string;
  char: string;
  color: string;
  kind: ItemKind;
  power: number;
  consumable: boolean;
}

export const ITEM_TEMPLATES: ItemTemplate[] = [
  { key: 'potion', name: '回復ポーション', char: '!', color: '#f87171', kind: 'heal', power: 25, consumable: true },
  { key: 'greater-potion', name: '大回復ポーション', char: '!', color: '#f9a8d4', kind: 'heal', power: 50, consumable: true },
  { key: 'iron-sword', name: '鉄の剣', char: '/', color: '#cbd5e1', kind: 'weapon', power: 3, consumable: false },
  { key: 'flame-sword', name: '炎の剣', char: '/', color: '#fb7185', kind: 'weapon', power: 7, consumable: false },
  { key: 'leather-armor', name: '革の鎧', char: '[', color: '#d6a369', kind: 'armor', power: 2, consumable: false },
  { key: 'steel-armor', name: '鋼の鎧', char: '[', color: '#94a3b8', kind: 'armor', power: 5, consumable: false },
  { key: 'scroll', name: '電撃スクロール', char: '?', color: '#60a5fa', kind: 'scroll', power: 15, consumable: true },
];

export const createItem = (template: ItemTemplate, x: number, y: number, suffix: string): Item => ({
  id: `item-${template.key}-${suffix}`,
  name: template.name,
  char: template.char,
  color: template.color,
  blocksMovement: false,
  kind: template.kind,
  power: template.power,
  consumable: template.consumable,
  x,
  y,
});