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

  // S (phase): can pass pollution + extra 1 turn (any side has S)
  // T (purify): can pass pollution, no extra turn (any side has T)
  const hasPhaseTile = tileA.specialType === 'S' || tileB.specialType === 'S';
  const hasPurifyTile = tileA.specialType === 'T' || tileB.specialType === 'T';

  const canPassPollution = hasPhaseTile || hasPurifyTile;
  const extraTurns = hasPhaseTile ? 1 : 0;

  const pathResult = findPath(board, start, end, { canPassPollution, extraTurns });

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
