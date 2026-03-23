export interface Position {
  x: number;
  y: number;
}

export interface Entity extends Position {
  id: string;
  name: string;
  char: string;
  color: string;
  blocksMovement: boolean;
}

export interface Fighter {
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
}