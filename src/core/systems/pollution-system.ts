import type { BoardState, Cell } from '@/types/board';
import type { Point } from '@/types/common';
import { getCell, setCell } from '@/core/board/board-model';

/**
 * Apply pollution to empty cells along the match path.
 * Does NOT pollute the start/end tile cells.
 */
export function applyPollution(
  board: BoardState,
  path: Point[],
  currentTurn: number,
  durationTurns: number,
): BoardState {
  let newBoard = board;
  for (const point of path) {
    const cell = getCell(board, point.x, point.y);
    if (cell && cell.kind === 'empty') {
      const pollutedCell: Cell = {
        x: point.x,
        y: point.y,
        kind: 'pollution',
        pollutionExpireTurn: currentTurn + durationTurns,
      };
      newBoard = setCell(newBoard, point.x, point.y, pollutedCell);
    }
  }
  return newBoard;
}

/**
 * Apply spirit trail to empty cells along S-tile match path.
 * Spirit trail is a visual highlight that persists for a few turns.
 * Unlike pollution, spirit trail does NOT block pathfinding.
 */
export function applySpiritTrail(
  board: BoardState,
  path: Point[],
  currentTurn: number,
  durationTurns: number,
): BoardState {
  let newBoard = board;
  for (const point of path) {
    const cell = getCell(board, point.x, point.y);
    if (cell && cell.kind === 'empty') {
      const trailCell: Cell = {
        x: point.x,
        y: point.y,
        kind: 'spirit_trail',
        pollutionExpireTurn: currentTurn + durationTurns,
      };
      newBoard = setCell(newBoard, point.x, point.y, trailCell);
    }
  }
  return newBoard;
}

/**
 * Decay pollution and spirit trails: remove cells whose expire turn has passed.
 */
export function decayPollution(board: BoardState, currentTurn: number): BoardState {
  let newBoard = board;
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      const cell = board.cells[y]![x]!;
      if (
        (cell.kind === 'pollution' || cell.kind === 'spirit_trail') &&
        cell.pollutionExpireTurn !== undefined &&
        currentTurn >= cell.pollutionExpireTurn
      ) {
        newBoard = setCell(newBoard, x, y, { x, y, kind: 'empty' });
      }
    }
  }
  return newBoard;
}

/**
 * Count current pollution cells on the board.
 */
export function countPollution(board: BoardState): number {
  let count = 0;
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      if (board.cells[y]![x]!.kind === 'pollution') count++;
    }
  }
  return count;
}

/**
 * Clear all pollution and spirit trail cells from the board.
 */
export function clearAllPollution(board: BoardState): BoardState {
  let newBoard = board;
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      const kind = board.cells[y]![x]!.kind;
      if (kind === 'pollution' || kind === 'spirit_trail') {
        newBoard = setCell(newBoard, x, y, { x, y, kind: 'empty' });
      }
    }
  }
  return newBoard;
}

/**
 * Purify pollution around a match path (T tile ability).
 * For each point in the path, clear pollution in adjacent cells (radius 1).
 */
export function purifyAroundPath(board: BoardState, path: Point[]): BoardState {
  let newBoard = board;
  const visited = new Set<string>();

  /** Manhattan-distance offsets: up, down, left, right */
  const manhattanOffsets = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  for (const point of path) {
    for (const { dx, dy } of manhattanOffsets) {
      const nx = point.x + dx;
      const ny = point.y + dy;
      const key = `${nx},${ny}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const cell = getCell(board, nx, ny);
      if (cell && cell.kind === 'pollution') {
        newBoard = setCell(newBoard, nx, ny, { x: nx, y: ny, kind: 'empty' });
      }
    }
  }

  return newBoard;
}
