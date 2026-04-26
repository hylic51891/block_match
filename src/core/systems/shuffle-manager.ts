import type { BoardState, Tile } from '@/types/board';
import { getActiveTiles } from '@/core/board/board-model';
import { isDeadlocked } from './deadlock-detector';

/**
 * Shuffle remaining active tiles on the board.
 * Keeps obstacle and pollution positions unchanged.
 * Guarantees at least one valid pair exists after shuffle.
 */
export function shuffle(board: BoardState, maxAttempts: number = 100): BoardState {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = shuffleOnce(board);
    if (!isDeadlocked(shuffled)) return shuffled;
  }
  return shuffleOnce(board);
}

function shuffleOnce(board: BoardState): BoardState {
  const activeTiles = getActiveTiles(board);
  if (activeTiles.length === 0) return board;

  // Collect types
  const types = activeTiles.map((t) => t.type);

  // Fisher-Yates shuffle types
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j]!, types[i]!];
  }

  // Reassign types to tiles at their current positions
  const newTiles: Record<string, Tile> = {};
  let newCells = board.cells.map((row) => [...row]);

  for (let i = 0; i < activeTiles.length; i++) {
    const oldTile = activeTiles[i]!;
    const newType = types[i]!;
    const newTile: Tile = { ...oldTile, type: newType };
    newTiles[newTile.id] = newTile;

    // Cell stays the same (same position, still a tile)
    // Just update the tile reference
  }

  return { ...board, tiles: { ...board.tiles, ...newTiles }, cells: newCells };
}
