import type { DifficultyConfig } from '../difficulty';
import { DIFFICULTY_PRESETS } from '../difficulty';
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
  { key: 'slime', name: 'スライム', char: 's', color: '#34d399', hp: 18, attack: 5, defense: 1, behavior: 'wander', expReward: 8, minFloor: 1 },
  { key: 'bat', name: 'コウモリ', char: 'b', color: '#a78bfa', hp: 14, attack: 7, defense: 1, behavior: 'chase', expReward: 12, minFloor: 1 },
  { key: 'goblin', name: 'ゴブリン', char: 'g', color: '#f87171', hp: 30, attack: 10, defense: 3, behavior: 'chase', expReward: 20, minFloor: 2 },
  { key: 'orc', name: 'オーク', char: 'O', color: '#a3e635', hp: 55, attack: 12, defense: 6, behavior: 'chase', expReward: 35, minFloor: 2 },
  { key: 'skeleton', name: 'スケルトン', char: 'S', color: '#e5e7eb', hp: 42, attack: 14, defense: 4, behavior: 'chase', expReward: 40, minFloor: 3 },
  { key: 'ghost', name: 'ゴースト', char: 'G', color: '#67e8f9', hp: 25, attack: 16, defense: 2, behavior: 'ranged', expReward: 45, minFloor: 3, attackRange: 2 },
  { key: 'dark-mage', name: 'ダークメイジ', char: 'M', color: '#c084fc', hp: 30, attack: 18, defense: 3, behavior: 'ranged', expReward: 55, minFloor: 4, attackRange: 3 },
  { key: 'mimic', name: 'ミミック', char: 'C', color: '#fbbf24', hp: 50, attack: 20, defense: 5, behavior: 'chase', expReward: 60, minFloor: 4 },
  { key: 'dragon', name: 'ドラゴン', char: 'D', color: '#ef4444', hp: 150, attack: 28, defense: 10, behavior: 'boss', expReward: 250, minFloor: 5, attackRange: 2 },
];

export const getEnemyTemplatesForFloor = (floor: number): EnemyTemplate[] => ENEMY_TEMPLATES.filter((template) => template.minFloor <= floor);

const scaleStat = (base: number, floorsAboveMin: number, floorScale: number, statScale: number, min = 0): number =>
  Math.max(min, Math.floor((base + Math.floor(floorsAboveMin * floorScale * base)) * statScale));

export const createEnemy = (
  template: EnemyTemplate,
  x: number,
  y: number,
  suffix: string,
  floor = 1,
  config: DifficultyConfig = DIFFICULTY_PRESETS.normal,
): Enemy => {
  const floorsAboveMin = floor - template.minFloor;
  const scaledHp = scaleStat(template.hp, floorsAboveMin, config.enemyFloorScale, config.enemyStatScale, 1);
  const scaledAttack = scaleStat(template.attack, floorsAboveMin, config.enemyFloorScale, config.enemyStatScale, 1);
  const scaledDefense = scaleStat(template.defense, floorsAboveMin, config.enemyFloorScale, config.enemyStatScale);
  return {
    id: `enemy-${template.key}-${suffix}`,
    name: template.name,
    char: template.char,
    color: template.color,
    blocksMovement: true,
    x,
    y,
    maxHp: scaledHp,
    hp: scaledHp,
    attack: scaledAttack,
    defense: scaledDefense,
    behavior: template.behavior,
    expReward: template.expReward,
    sightRange: 8,
    attackRange: template.attackRange ?? 1,
  };
};