import type { BoardState, Cell } from '@/types/board';
import { createEmptyBoard, setCell } from '@/core/board/board-model';

/**
 * Create a simple 4x4 board with 2 tile types (A, B), 4 of each.
 * No obstacles, no pollution. Used for basic tests.
 */
export function createSimpleBoard(): BoardState {
  let board = createEmptyBoard(4, 4);
  const layout: Array<{ x: number; y: number; id: string; type: string }> = [
    { x: 0, y: 0, id: 't1', type: 'A' },
    { x: 1, y: 0, id: 't2', type: 'A' },
    { x: 0, y: 1, id: 't3', type: 'B' },
    { x: 1, y: 1, id: 't4', type: 'B' },
    { x: 2, y: 0, id: 't5', type: 'A' },
    { x: 3, y: 0, id: 't6', type: 'A' },
    { x: 2, y: 1, id: 't7', type: 'B' },
    { x: 3, y: 1, id: 't8', type: 'B' },
  ];

  for (const t of layout) {
    const cell: Cell = { x: t.x, y: t.y, kind: 'tile', tileId: t.id };
    board = setCell(board, t.x, t.y, cell);
    board.tiles[t.id] = { id: t.id, type: t.type, x: t.x, y: t.y, state: 'active', special: false };
  }
  return board;
}

/**
 * Create a board with obstacles blocking direct paths.
 */
export function createBoardWithObstacles(): BoardState {
  let board = createEmptyBoard(4, 4);
  board = setCell(board, 1, 1, { x: 1, y: 1, kind: 'obstacle', obstacleType: 'rock' });
  board = setCell(board, 2, 1, { x: 2, y: 1, kind: 'obstacle', obstacleType: 'rock' });

  const layout = [
    { x: 0, y: 0, id: 't1', type: 'A' },
    { x: 3, y: 3, id: 't2', type: 'A' },
    { x: 0, y: 3, id: 't3', type: 'B' },
    { x: 3, y: 0, id: 't4', type: 'B' },
  ];
  for (const t of layout) {
    const cell: Cell = { x: t.x, y: t.y, kind: 'tile', tileId: t.id };
    board = setCell(board, t.x, t.y, cell);
    board.tiles[t.id] = { id: t.id, type: t.type, x: t.x, y: t.y, state: 'active', special: false };
  }
  return board;
}

/**
 * Create a board with pollution cells.
 */
export function createBoardWithPollution(): BoardState {
  let board = createEmptyBoard(4, 4);
  board = setCell(board, 1, 0, { x: 1, y: 0, kind: 'pollution', pollutionExpireTurn: 5 });
  board = setCell(board, 2, 0, { x: 2, y: 0, kind: 'pollution', pollutionExpireTurn: 5 });

  const layout = [
    { x: 0, y: 0, id: 't1', type: 'A' },
    { x: 3, y: 0, id: 't2', type: 'A' },
  ];
  for (const t of layout) {
    const cell: Cell = { x: t.x, y: t.y, kind: 'tile', tileId: t.id };
    board = setCell(board, t.x, t.y, cell);
    board.tiles[t.id] = { id: t.id, type: t.type, x: t.x, y: t.y, state: 'active', special: false };
  }
  return board;
}

/**
 * Create a deadlocked board: same type tiles but no valid path between them.
 */
export function createDeadlockedBoard(): BoardState {
  let board = createEmptyBoard(3, 3);
  board = setCell(board, 1, 0, { x: 1, y: 0, kind: 'obstacle', obstacleType: 'rock' });
  board = setCell(board, 1, 1, { x: 1, y: 1, kind: 'obstacle', obstacleType: 'rock' });
  board = setCell(board, 1, 2, { x: 1, y: 2, kind: 'obstacle', obstacleType: 'rock' });

  const layout = [
    { x: 0, y: 1, id: 't1', type: 'A' },
    { x: 2, y: 1, id: 't2', type: 'A' },
  ];
  for (const t of layout) {
    const cell: Cell = { x: t.x, y: t.y, kind: 'tile', tileId: t.id };
    board = setCell(board, t.x, t.y, cell);
    board.tiles[t.id] = { id: t.id, type: t.type, x: t.x, y: t.y, state: 'active', special: false };
  }
  return board;
}

/**
 * Create an empty board (all tiles removed = win state).
 */
export function createClearedBoard(): BoardState {
  return createEmptyBoard(4, 4);
}
