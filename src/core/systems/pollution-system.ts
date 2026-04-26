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
 * Decay pollution: remove pollution cells whose expire turn has passed.
 */
export function decayPollution(board: BoardState, currentTurn: number): BoardState {
  let newBoard = board;
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      const cell = board.cells[y]![x]!;
      if (
        cell.kind === 'pollution' &&
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
 * Clear all pollution cells from the board (for debug).
 */
export function clearAllPollution(board: BoardState): BoardState {
  let newBoard = board;
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      if (board.cells[y]![x]!.kind === 'pollution') {
        newBoard = setCell(newBoard, x, y, { x, y, kind: 'empty' });
      }
    }
  }
  return newBoard;
}
