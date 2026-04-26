import type { BoardState, Tile } from '@/types/board';
import type { Point } from '@/types/common';
import { getActiveTiles } from '@/core/board/board-model';
import { findPath } from '@/core/rules/path-finder';

export function isDeadlocked(board: BoardState): boolean {
  // No active tiles means board is cleared (win), not deadlocked
  const activeTiles = getActiveTiles(board);
  if (activeTiles.length === 0) return false;
  return findAnyValidPair(board) === null;
}

export function findAnyValidPair(board: BoardState): [Tile, Tile] | null {
  const activeTiles = getActiveTiles(board);

  // Group by type
  const groups: Record<string, Tile[]> = {};
  for (const tile of activeTiles) {
    if (!groups[tile.type]) groups[tile.type] = [];
    groups[tile.type]!.push(tile);
  }

  // Check each type group for a connectable pair
  for (const tiles of Object.values(groups)) {
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        const a = tiles[i]!;
        const b = tiles[j]!;
        const start: Point = { x: a.x, y: a.y };
        const end: Point = { x: b.x, y: b.y };
        const isSpecial = a.special && b.special;
        const result = findPath(board, start, end, { canPassPollution: isSpecial });
        if (result.found) return [a, b];
      }
    }
  }

  return null;
}
