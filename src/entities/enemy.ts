import type { Entity, Fighter } from './entity';

export type EnemyBehavior = 'wander' | 'chase' | 'ranged' | 'boss';

export interface Enemy extends Entity, Fighter {
  behavior: EnemyBehavior;
  expReward: number;
  sightRange: number;
  attackRange: number;
}

export interface EnemyTemplate {
  key: string;
  name: string;
  char: string;
  color: string;
  hp: number;
  attack: number;
  defense: number;
  behavior: EnemyBehavior;
  expReward: number;
  minFloor: number;
  attackRange?: number;
}

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  { key: 'slime', name: 'スライム', char: 's', color: '#34d399', hp: 12, attack: 3, defense: 0, behavior: 'wander', expReward: 8, minFloor: 1 },
  { key: 'bat', name: 'コウモリ', char: 'b', color: '#a78bfa', hp: 8, attack: 5, defense: 0, behavior: 'chase', expReward: 12, minFloor: 1 },
  { key: 'goblin', name: 'ゴブリン', char: 'g', color: '#f87171', hp: 22, attack: 7, defense: 2, behavior: 'chase', expReward: 20, minFloor: 2 },
  { key: 'orc', name: 'オーク', char: 'O', color: '#a3e635', hp: 40, attack: 9, defense: 5, behavior: 'chase', expReward: 35, minFloor: 2 },
  { key: 'skeleton', name: 'スケルトン', char: 'S', color: '#e5e7eb', hp: 30, attack: 11, defense: 3, behavior: 'chase', expReward: 40, minFloor: 3 },
  { key: 'ghost', name: 'ゴースト', char: 'G', color: '#67e8f9', hp: 18, attack: 13, defense: 1, behavior: 'ranged', expReward: 45, minFloor: 3, attackRange: 2 },
  { key: 'dark-mage', name: 'ダークメイジ', char: 'M', color: '#c084fc', hp: 22, attack: 14, defense: 2, behavior: 'ranged', expReward: 55, minFloor: 4, attackRange: 3 },
  { key: 'mimic', name: 'ミミック', char: 'C', color: '#fbbf24', hp: 35, attack: 16, defense: 4, behavior: 'chase', expReward: 60, minFloor: 4 },
  { key: 'dragon', name: 'ドラゴン', char: 'D', color: '#ef4444', hp: 100, attack: 22, defense: 8, behavior: 'boss', expReward: 250, minFloor: 5, attackRange: 2 },
];

export const getEnemyTemplatesForFloor = (floor: number): EnemyTemplate[] => ENEMY_TEMPLATES.filter((template) => template.minFloor <= floor);

export const createEnemy = (template: EnemyTemplate, x: number, y: number, suffix: string): Enemy => ({
  id: `enemy-${template.key}-${suffix}`,
  name: template.name,
  char: template.char,
  color: template.color,
  blocksMovement: true,
  x,
  y,
  maxHp: template.hp,
  hp: template.hp,
  attack: template.attack,
  defense: template.defense,
  behavior: template.behavior,
  expReward: template.expReward,
  sightRange: 8,
  attackRange: template.attackRange ?? 1,
});