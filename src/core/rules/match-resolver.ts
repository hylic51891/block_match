import type { BoardState, Tile } from '@/types/board';
import type { Point } from '@/types/common';
import type { MatchAttemptResult } from '@/types/game';
import { findPath } from './path-finder';

export function resolveMatch(board: BoardState, tileA: Tile, tileB: Tile): MatchAttemptResult {
  if (tileA.state !== 'active' || tileB.state !== 'active') {
    return { success: false, reason: 'not_active' };
  }

  if (tileA.type !== tileB.type) {
    return { success: false, reason: 'different_types' };
  }

  const start: Point = { x: tileA.x, y: tileA.y };
  const end: Point = { x: tileB.x, y: tileB.y };

  // Both tiles are special -> can pass through pollution and get one extra turn
  const isSpecial = tileA.special && tileB.special;
  const pathResult = findPath(board, start, end, { canPassPollution: isSpecial });

  if (pathResult.found) {
    return {
      success: true,
      path: pathResult.path,
      turns: pathResult.turns,
      tileAId: tileA.id,
      tileBId: tileB.id,
    };
  }

  return { success: false, reason: pathResult.reason };
}
