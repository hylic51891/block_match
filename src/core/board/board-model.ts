import type { BoardState, Cell, CellKind, Tile } from '@/types/board';

export function createEmptyBoard(width: number, height: number): BoardState {
  const cells: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ x, y, kind: 'empty' });
    }
    cells.push(row);
  }
  return { width, height, cells, tiles: {} };
}

export function getCell(board: BoardState, x: number, y: number): Cell | undefined {
  if (x < 0 || x >= board.width || y < 0 || y >= board.height) return undefined;
  return board.cells[y]?.[x];
}

export function setCell(board: BoardState, x: number, y: number, cell: Cell): BoardState {
  const newCells = board.cells.map((row) => [...row]);
  newCells[y]![x] = cell;
  return { ...board, cells: newCells };
}

export function getActiveTiles(board: BoardState): Tile[] {
  return Object.values(board.tiles).filter((t) => t.state === 'active');
}

export function getTileAt(board: BoardState, x: number, y: number): Tile | undefined {
  const cell = getCell(board, x, y);
  if (!cell || cell.kind !== 'tile' || !cell.tileId) return undefined;
  return board.tiles[cell.tileId];
}

export function removeTile(board: BoardState, tileId: string): BoardState {
  const tile = board.tiles[tileId];
  if (!tile) return board;

  const newTiles = { ...board.tiles };
  delete newTiles[tileId];

  const newCells = board.cells.map((row) => [...row]);
  newCells[tile.y]![tile.x] = { x: tile.x, y: tile.y, kind: 'empty' };

  return { ...board, cells: newCells, tiles: newTiles };
}

export function setTileState(board: BoardState, tileId: string, state: Tile['state']): BoardState {
  const tile = board.tiles[tileId];
  if (!tile) return board;
  return {
    ...board,
    tiles: { ...board.tiles, [tileId]: { ...tile, state } },
  };
}

export function isCellPassable(board: BoardState, x: number, y: number): boolean {
  const cell = getCell(board, x, y);
  if (!cell) return false;
  return cell.kind === 'empty';
}

export function isInBounds(board: BoardState, x: number, y: number): boolean {
  return x >= 0 && x < board.width && y >= 0 && y < board.height;
}

export function setCellKind(board: BoardState, x: number, y: number, kind: CellKind, extra?: Partial<Cell>): BoardState {
  const cell = getCell(board, x, y);
  if (!cell) return board;
  const newCell: Cell = { x, y, kind, ...extra };
  return setCell(board, x, y, newCell);
}
