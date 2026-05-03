import type { BoardState } from '@/types/board';
import type { Point } from '@/types/common';
import type { PathResult } from '@/types/game';
import { isCellPassable } from '@/core/board/board-model';

export type PathFindOptions = {
  /** If true, pollution cells are treated as passable */
  canPassPollution?: boolean;
  /** Extra turns allowed beyond the default 2 */
  extraTurns?: number;
};

/**
 * Find a path between two points with at most maxTurns turns.
 * The start and end points are tiles (not passable), but the path between them
 * must go through passable cells only.
 */
export function findPath(board: BoardState, start: Point, end: Point, options?: PathFindOptions): PathResult {
  if (start.x === end.x && start.y === end.y) {
    return { found: false, reason: 'no_path' };
  }

  const baseMaxTurns = 2 + (options?.extraTurns ?? 0);
  const maxTurns = options?.canPassPollution ? Math.max(baseMaxTurns, 3) : baseMaxTurns;
  const isPassable = (x: number, y: number) => {
    if (options?.canPassPollution) {
      // Can pass through pollution cells
      const cell = board.cells[y]?.[x];
      if (!cell) return false;
      return cell.kind === 'empty' || cell.kind === 'pollution';
    }
    return isCellPassable(board, x, y);
  };

  // Try 0-turn (straight line)
  const straight = tryStraightLine(board, start, end, isPassable);
  if (straight) return { found: true, path: straight, turns: 0 };

  // Try 1-turn (L-shape)
  const oneTurn = tryOneTurnPath(board, start, end, isPassable);
  if (oneTurn) return { found: true, path: oneTurn, turns: 1 };

  // Try 2-turn (Z/U-shape)
  const twoTurn = tryTwoTurnPath(board, start, end, isPassable);
  if (twoTurn) return { found: true, path: twoTurn, turns: 2 };

  // Try 3-turn (only for special tiles with canPassPollution)
  if (maxTurns >= 3) {
    const threeTurn = tryThreeTurnPath(board, start, end, isPassable);
    if (threeTurn) return { found: true, path: threeTurn, turns: 3 };
  }

  return { found: false, reason: 'no_path' };
}

type PassableFn = (x: number, y: number) => boolean;

function tryStraightLine(_board: BoardState, start: Point, end: Point, isPassable: PassableFn): Point[] | null {
  if (start.x !== end.x && start.y !== end.y) return null;

  if (start.x === end.x) {
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    const path: Point[] = [];
    for (let y = minY + 1; y < maxY; y++) {
      if (!isPassable(start.x, y)) return null;
      path.push({ x: start.x, y });
    }
    return path;
  } else {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const path: Point[] = [];
    for (let x = minX + 1; x < maxX; x++) {
      if (!isPassable(x, start.y)) return null;
      path.push({ x, y: start.y });
    }
    return path;
  }
}

function tryOneTurnPath(board: BoardState, start: Point, end: Point, isPassable: PassableFn): Point[] | null {
  // Corner at (start.x, end.y)
  if (isPassable(start.x, end.y)) {
    const seg1 = tryStraightLine(board, start, { x: start.x, y: end.y }, isPassable);
    const seg2 = tryStraightLine(board, { x: start.x, y: end.y }, end, isPassable);
    if (seg1 !== null && seg2 !== null) {
      return [...seg1, { x: start.x, y: end.y }, ...seg2];
    }
  }

  // Corner at (end.x, start.y)
  if (isPassable(end.x, start.y)) {
    const seg1 = tryStraightLine(board, start, { x: end.x, y: start.y }, isPassable);
    const seg2 = tryStraightLine(board, { x: end.x, y: start.y }, end, isPassable);
    if (seg1 !== null && seg2 !== null) {
      return [...seg1, { x: end.x, y: start.y }, ...seg2];
    }
  }

  return null;
}

function tryTwoTurnPath(board: BoardState, start: Point, end: Point, isPassable: PassableFn): Point[] | null {
  // Scan horizontal from start
  for (let x = start.x - 1; x >= 0; x--) {
    if (!isPassable(x, start.y)) break;
    const corner1: Point = { x, y: start.y };
    const seg1 = tryStraightLine(board, start, corner1, isPassable);
    if (seg1 === null) break;
    const oneTurn = tryOneTurnFromPoint(board, corner1, end, isPassable);
    if (oneTurn) return [...seg1, corner1, ...oneTurn];
  }
  for (let x = start.x + 1; x < board.width; x++) {
    if (!isPassable(x, start.y)) break;
    const corner1: Point = { x, y: start.y };
    const seg1 = tryStraightLine(board, start, corner1, isPassable);
    if (seg1 === null) break;
    const oneTurn = tryOneTurnFromPoint(board, corner1, end, isPassable);
    if (oneTurn) return [...seg1, corner1, ...oneTurn];
  }

  // Scan vertical from start
  for (let y = start.y - 1; y >= 0; y--) {
    if (!isPassable(start.x, y)) break;
    const corner1: Point = { x: start.x, y };
    const seg1 = tryStraightLine(board, start, corner1, isPassable);
    if (seg1 === null) break;
    const oneTurn = tryOneTurnFromPoint(board, corner1, end, isPassable);
    if (oneTurn) return [...seg1, corner1, ...oneTurn];
  }
  for (let y = start.y + 1; y < board.height; y++) {
    if (!isPassable(start.x, y)) break;
    const corner1: Point = { x: start.x, y };
    const seg1 = tryStraightLine(board, start, corner1, isPassable);
    if (seg1 === null) break;
    const oneTurn = tryOneTurnFromPoint(board, corner1, end, isPassable);
    if (oneTurn) return [...seg1, corner1, ...oneTurn];
  }

  return null;
}

/**
 * Try 3-turn path for special tiles.
 * Strategy: from start, scan in 4 directions for corner1, then from corner1
 * try 2-turn to end (using tryTwoTurnFromPoint).
 */
function tryThreeTurnPath(board: BoardState, start: Point, end: Point, isPassable: PassableFn): Point[] | null {
  // Scan horizontal from start
  for (let x = start.x - 1; x >= 0; x--) {
    if (!isPassable(x, start.y)) break;
    const corner1: Point = { x, y: start.y };
    const seg1 = tryStraightLine(board, start, corner1, isPassable);
    if (seg1 === null) break;
    const twoTurn = tryTwoTurnFromPoint(board, corner1, end, isPassable);
    if (twoTurn) return [...seg1, corner1, ...twoTurn];
  }
  for (let x = start.x + 1; x < board.width; x++) {
    if (!isPassable(x, start.y)) break;
    const corner1: Point = { x, y: start.y };
    const seg1 = tryStraightLine(board, start, corner1, isPassable);
    if (seg1 === null) break;
    const twoTurn = tryTwoTurnFromPoint(board, corner1, end, isPassable);
    if (twoTurn) return [...seg1, corner1, ...twoTurn];
  }

  // Scan vertical from start
  for (let y = start.y - 1; y >= 0; y--) {
    if (!isPassable(start.x, y)) break;
    const corner1: Point = { x: start.x, y };
    const seg1 = tryStraightLine(board, start, corner1, isPassable);
    if (seg1 === null) break;
    const twoTurn = tryTwoTurnFromPoint(board, corner1, end, isPassable);
    if (twoTurn) return [...seg1, corner1, ...twoTurn];
  }
  for (let y = start.y + 1; y < board.height; y++) {
    if (!isPassable(start.x, y)) break;
    const corner1: Point = { x: start.x, y };
    const seg1 = tryStraightLine(board, start, corner1, isPassable);
    if (seg1 === null) break;
    const twoTurn = tryTwoTurnFromPoint(board, corner1, end, isPassable);
    if (twoTurn) return [...seg1, corner1, ...twoTurn];
  }

  return null;
}

function tryOneTurnFromPoint(board: BoardState, corner1: Point, end: Point, isPassable: PassableFn): Point[] | null {
  // corner2 at (corner1.x, end.y)
  if (isPassable(corner1.x, end.y)) {
    const seg1 = tryStraightLine(board, corner1, { x: corner1.x, y: end.y }, isPassable);
    const seg2 = tryStraightLine(board, { x: corner1.x, y: end.y }, end, isPassable);
    if (seg1 !== null && seg2 !== null) {
      return [{ x: corner1.x, y: end.y }, ...seg2];
    }
  }

  // corner2 at (end.x, corner1.y)
  if (isPassable(end.x, corner1.y)) {
    const seg1 = tryStraightLine(board, corner1, { x: end.x, y: corner1.y }, isPassable);
    const seg2 = tryStraightLine(board, { x: end.x, y: corner1.y }, end, isPassable);
    if (seg1 !== null && seg2 !== null) {
      return [{ x: end.x, y: corner1.y }, ...seg2];
    }
  }

  return null;
}

/** Try 2-turn path from a known passable starting corner */
function tryTwoTurnFromPoint(board: BoardState, corner1: Point, end: Point, isPassable: PassableFn): Point[] | null {
  // Scan from corner1 in 4 directions
  for (let x = corner1.x - 1; x >= 0; x--) {
    if (!isPassable(x, corner1.y)) break;
    const c2: Point = { x, y: corner1.y };
    const seg = tryStraightLine(board, corner1, c2, isPassable);
    if (seg === null) break;
    const oneTurn = tryOneTurnFromPoint(board, c2, end, isPassable);
    if (oneTurn) return [...seg, c2, ...oneTurn];
  }
  for (let x = corner1.x + 1; x < board.width; x++) {
    if (!isPassable(x, corner1.y)) break;
    const c2: Point = { x, y: corner1.y };
    const seg = tryStraightLine(board, corner1, c2, isPassable);
    if (seg === null) break;
    const oneTurn = tryOneTurnFromPoint(board, c2, end, isPassable);
    if (oneTurn) return [...seg, c2, ...oneTurn];
  }
  for (let y = corner1.y - 1; y >= 0; y--) {
    if (!isPassable(corner1.x, y)) break;
    const c2: Point = { x: corner1.x, y };
    const seg = tryStraightLine(board, corner1, c2, isPassable);
    if (seg === null) break;
    const oneTurn = tryOneTurnFromPoint(board, c2, end, isPassable);
    if (oneTurn) return [...seg, c2, ...oneTurn];
  }
  for (let y = corner1.y + 1; y < board.height; y++) {
    if (!isPassable(corner1.x, y)) break;
    const c2: Point = { x: corner1.x, y };
    const seg = tryStraightLine(board, corner1, c2, isPassable);
    if (seg === null) break;
    const oneTurn = tryOneTurnFromPoint(board, c2, end, isPassable);
    if (oneTurn) return [...seg, c2, ...oneTurn];
  }

  return null;
}
