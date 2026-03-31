/**
 * Difficulty presets for the game.
 *
 * Easy   – 小学生でもできるレベル (sub-issue #2)
 * Normal – 高校生がクリアできるレベル (sub-issue #3)
 * Hard   – AGDQで盛り上がるようなギリギリの戦い (sub-issue #4)
 */

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  /** Display label shown on the title screen */
  label: string;
  /** Description shown on the title screen */
  description: string;

  // ── Player stats ──
  playerHp: number;
  playerAtk: number;
  playerDef: number;
  playerExpToNext: number;

  // ── Level-up gains ──
  levelUpHp: number;
  levelUpAtk: number;
  levelUpDef: number;
  /** Coefficients for expToNext = level * a + level² * b */
  expCurveLinear: number;
  expCurveSq: number;

  // ── Enemy scaling ──
  /** Multiplied to enemy HP/ATK/DEF after per-floor scaling */
  enemyStatScale: number;
  /** Per-floor scaling rate (0.1 = +10% per floor above minFloor) */
  enemyFloorScale: number;

  // ── Spawn rates ──
  /** [minEnemies, maxEnemiesFloor1, maxEnemiesFloor2, maxEnemiesFloor4] */
  enemyCountMin: number;
  enemyCountMaxFloor1: number;
  enemyCountMaxFloor2: number;
  enemyCountMaxFloor4: number;
  /** Probability of spawning an item per room */
  itemSpawnChance: number;
  /** Probability of spawning a chest per room */
  chestSpawnChance: number;
  /** Probability of spawning a trap per room */
  trapSpawnChance: number;

  // ── Healing / traps ──
  /** Multiplied against trap damage */
  trapDamageScale: number;
  /** Potion heal power */
  potionPower: number;
  /** Greater potion heal power */
  greaterPotionPower: number;
  /** NPC healer: fraction of maxHp to restore */
  healerFraction: number;
}

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    label: 'Easy',
    description: '小学生でもできるレベル',
    playerHp: 120,
    playerAtk: 10,
    playerDef: 4,
    playerExpToNext: 40,
    levelUpHp: 15,
    levelUpAtk: 3,
    levelUpDef: 2,
    expCurveLinear: 30,
    expCurveSq: 1,
    enemyStatScale: 0.7,
    enemyFloorScale: 0.05,
    enemyCountMin: 0,
    enemyCountMaxFloor1: 1,
    enemyCountMaxFloor2: 2,
    enemyCountMaxFloor4: 3,
    itemSpawnChance: 0.6,
    chestSpawnChance: 0.4,
    trapSpawnChance: 0.15,
    trapDamageScale: 0.6,
    potionPower: 35,
    greaterPotionPower: 70,
    healerFraction: 1.0,
  },
  normal: {
    label: 'Normal',
    description: '高校生がクリアできるレベル',
    playerHp: 80,
    playerAtk: 7,
    playerDef: 2,
    playerExpToNext: 60,
    levelUpHp: 8,
    levelUpAtk: 1,
    levelUpDef: 1,
    expCurveLinear: 50,
    expCurveSq: 3,
    enemyStatScale: 1.0,
    enemyFloorScale: 0.1,
    enemyCountMin: 1,
    enemyCountMaxFloor1: 2,
    enemyCountMaxFloor2: 3,
    enemyCountMaxFloor4: 4,
    itemSpawnChance: 0.4,
    chestSpawnChance: 0.25,
    trapSpawnChance: 0.4,
    trapDamageScale: 1.0,
    potionPower: 20,
    greaterPotionPower: 40,
    healerFraction: 0.5,
  },
  hard: {
    label: 'Hard',
    description: 'AGDQで盛り上がるギリギリの戦い',
    playerHp: 60,
    playerAtk: 6,
    playerDef: 1,
    playerExpToNext: 80,
    levelUpHp: 5,
    levelUpAtk: 1,
    levelUpDef: 0,
    expCurveLinear: 60,
    expCurveSq: 5,
    enemyStatScale: 1.3,
    enemyFloorScale: 0.15,
    enemyCountMin: 1,
    enemyCountMaxFloor1: 3,
    enemyCountMaxFloor2: 4,
    enemyCountMaxFloor4: 5,
    itemSpawnChance: 0.25,
    chestSpawnChance: 0.15,
    trapSpawnChance: 0.5,
    trapDamageScale: 1.4,
    potionPower: 15,
    greaterPotionPower: 30,
    healerFraction: 0.3,
  },
};

export const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];
