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

  // Determine path options based on special types
  // S (phase): can pass pollution + extra 1 turn
  // T (purify): normal path rules (no pollution pass, no extra turn)
  // Both special: use S's ability (canPassPollution + extraTurns)
  const isBothS = tileA.specialType === 'S' && tileB.specialType === 'S';
  const isBothT = tileA.specialType === 'T' && tileB.specialType === 'T';
  const isMixedSpecial = !!tileA.specialType && !!tileB.specialType && tileA.specialType !== tileB.specialType;

  let canPassPollution = false;
  let extraTurns = 0;

  if (isBothS) {
    canPassPollution = true;
    extraTurns = 1;
  } else if (isBothT) {
    // T tiles: no special path abilities, but purification happens after match
    canPassPollution = false;
    extraTurns = 0;
  } else if (isMixedSpecial) {
    // Mixed: use S's stronger ability
    canPassPollution = true;
    extraTurns = 1;
  }

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
