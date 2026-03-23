export type TileType = 'wall' | 'floor' | 'corridor' | 'stairs' | 'door';

export interface Tile {
  type: TileType;
  blocksMovement: boolean;
  blocksSight: boolean;
}

export const createTile = (type: TileType): Tile => {
  switch (type) {
    case 'wall':
      return { type, blocksMovement: true, blocksSight: true };
    case 'stairs':
    case 'door':
    case 'floor':
    case 'corridor':
      return { type, blocksMovement: false, blocksSight: false };
  }
};

export const isWalkable = (tile: Tile): boolean => !tile.blocksMovement;