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
  { key: 'slime', name: 'スライム', char: 's', color: '#34d399', hp: 15, attack: 4, defense: 1, behavior: 'wander', expReward: 10, minFloor: 1 },
  { key: 'goblin', name: 'ゴブリン', char: 'g', color: '#f87171', hp: 25, attack: 7, defense: 2, behavior: 'chase', expReward: 25, minFloor: 2 },
  { key: 'skeleton', name: 'スケルトン', char: 'S', color: '#e5e7eb', hp: 35, attack: 10, defense: 4, behavior: 'chase', expReward: 40, minFloor: 3 },
  { key: 'dark-mage', name: 'ダークメイジ', char: 'M', color: '#c084fc', hp: 20, attack: 15, defense: 2, behavior: 'ranged', expReward: 55, minFloor: 4, attackRange: 3 },
  { key: 'dragon', name: 'ドラゴン', char: 'D', color: '#ef4444', hp: 80, attack: 20, defense: 8, behavior: 'boss', expReward: 200, minFloor: 5, attackRange: 2 },
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