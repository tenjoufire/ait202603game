import { FOV_RADIUS } from '../constants';
import type { DifficultyConfig } from '../difficulty';
import { DIFFICULTY_PRESETS } from '../difficulty';
import type { Fighter } from './entity';
import type { Item } from './item';
import type { Entity } from './entity';

export interface Player extends Entity, Fighter {
  level: number;
  exp: number;
  expToNext: number;
  inventory: Item[];
  equippedWeapon: Item | null;
  equippedArmor: Item | null;
  score: number;
  fovRadius: number;
}

export const createPlayer = (x: number, y: number, config: DifficultyConfig = DIFFICULTY_PRESETS.normal): Player => ({
  id: 'player',
  name: 'プレイヤー',
  char: '@',
  color: '#73fbd3',
  blocksMovement: true,
  x,
  y,
  maxHp: config.playerHp,
  hp: config.playerHp,
  attack: config.playerAtk,
  defense: config.playerDef,
  level: 1,
  exp: 0,
  expToNext: config.playerExpToNext,
  inventory: [],
  equippedWeapon: null,
  equippedArmor: null,
  score: 0,
  fovRadius: FOV_RADIUS,
});