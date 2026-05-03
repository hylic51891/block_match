export type CellKind = 'empty' | 'tile' | 'obstacle' | 'pollution';

export type Cell = {
  x: number;
  y: number;
  kind: CellKind;
  tileId?: string;
  obstacleType?: 'rock';
  pollutionExpireTurn?: number;
};

export type TileState = 'active' | 'selected' | 'removing' | 'removed';

export type SpecialType = 'S' | 'T';

export type Tile = {
  id: string;
  type: string;
  x: number;
  y: number;
  state: TileState;
  /** Special tile type: S = phase (pass pollution + extra turn), T = purify (clear pollution around path) */
  specialType?: SpecialType;
};

export type BoardState = {
  width: number;
  height: number;
  cells: Cell[][];
  tiles: Record<string, Tile>;
};
