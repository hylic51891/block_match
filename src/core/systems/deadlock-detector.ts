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

function getSpecialPathOptions(a: Tile, b: Tile): { canPassPollution: boolean; extraTurns: number } {
  const isBothS = a.specialType === 'S' && b.specialType === 'S';
  const isBothT = a.specialType === 'T' && b.specialType === 'T';
  const isMixedSpecial = !!a.specialType && !!b.specialType && a.specialType !== b.specialType;

  if (isBothS) return { canPassPollution: true, extraTurns: 1 };
  if (isBothT) return { canPassPollution: false, extraTurns: 0 };
  if (isMixedSpecial) return { canPassPollution: true, extraTurns: 1 };
  return { canPassPollution: false, extraTurns: 0 };
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
        const opts = getSpecialPathOptions(a, b);
        const result = findPath(board, start, end, opts);
        if (result.found) return [a, b];
      }
    }
  }

  return null;
}
