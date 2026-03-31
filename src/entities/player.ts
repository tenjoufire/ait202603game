import { FOV_RADIUS, PLAYER_INITIAL_ATK, PLAYER_INITIAL_DEF, PLAYER_INITIAL_HP } from '../constants';
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

export const createPlayer = (x: number, y: number): Player => ({
  id: 'player',
  name: 'プレイヤー',
  char: '@',
  color: '#73fbd3',
  blocksMovement: true,
  x,
  y,
  maxHp: PLAYER_INITIAL_HP,
  hp: PLAYER_INITIAL_HP,
  attack: PLAYER_INITIAL_ATK,
  defense: PLAYER_INITIAL_DEF,
  level: 1,
  exp: 0,
  expToNext: 60,
  inventory: [],
  equippedWeapon: null,
  equippedArmor: null,
  score: 0,
  fovRadius: FOV_RADIUS,
});