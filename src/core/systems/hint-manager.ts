import type { BoardState, Tile } from '@/types/board';
import { findAnyValidPair } from './deadlock-detector';

export type HintResult = {
  pair: [Tile, Tile] | null;
  hintRemaining: number;
};

/**
 * Use one hint charge and return the valid pair to highlight.
 * Returns null pair if no valid pair exists or no hints remaining.
 */
export function useHint(board: BoardState, hintRemaining: number): HintResult {
  if (hintRemaining <= 0) {
    return { pair: null, hintRemaining };
  }

  const pair = findAnyValidPair(board);
  if (!pair) {
    return { pair: null, hintRemaining };
  }

  return {
    pair,
    hintRemaining: hintRemaining - 1,
  };
}

/**
 * Get a hint pair without consuming a hint charge.
 * Used by UI to display which tiles to highlight.
 */
export function getHintPair(board: BoardState): [string, string] | null {
  const pair = findAnyValidPair(board);
  if (!pair) return null;
  return [pair[0].id, pair[1].id];
}
