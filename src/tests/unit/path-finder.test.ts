import { describe, it, expect } from 'vitest';
import type { BoardState, Cell } from '@/types/board';
import { createEmptyBoard, setCell } from '@/core/board/board-model';
import { findPath } from '@/core/rules/path-finder';

function makeBoardWithTiles(
  width: number,
  height: number,
  tiles: Array<{ x: number; y: number; id: string }>,
  obstacles: Array<{ x: number; y: number }> = [],
  pollutions: Array<{ x: number; y: number }> = [],
): BoardState {
  let board = createEmptyBoard(width, height);
  for (const t of tiles) {
    const cell: Cell = { x: t.x, y: t.y, kind: 'tile', tileId: t.id };
    board = setCell(board, t.x, t.y, cell);
    board.tiles[t.id] = { id: t.id, type: 'A', x: t.x, y: t.y, state: 'active', special: false };
  }
  for (const o of obstacles) {
    board = setCell(board, o.x, o.y, { x: o.x, y: o.y, kind: 'obstacle', obstacleType: 'rock' });
  }
  for (const p of pollutions) {
    board = setCell(board, p.x, p.y, { x: p.x, y: p.y, kind: 'pollution', pollutionExpireTurn: 99 });
  }
  return board;
}

describe('PathFinder', () => {
  it('straight horizontal path', () => {
    const board = makeBoardWithTiles(4, 1, [
      { x: 0, y: 0, id: 'a' },
      { x: 3, y: 0, id: 'b' },
    ]);
    const result = findPath(board, { x: 0, y: 0 }, { x: 3, y: 0 });
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.turns).toBe(0);
      expect(result.path).toEqual([{ x: 1, y: 0 }, { x: 2, y: 0 }]);
    }
  });

  it('straight vertical path', () => {
    const board = makeBoardWithTiles(1, 4, [
      { x: 0, y: 0, id: 'a' },
      { x: 0, y: 3, id: 'b' },
    ]);
    const result = findPath(board, { x: 0, y: 0 }, { x: 0, y: 3 });
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.turns).toBe(0);
      expect(result.path).toEqual([{ x: 0, y: 1 }, { x: 0, y: 2 }]);
    }
  });

  it('one-turn path (L-shape)', () => {
    const board = makeBoardWithTiles(3, 3, [
      { x: 0, y: 0, id: 'a' },
      { x: 2, y: 2, id: 'b' },
    ]);
    const result = findPath(board, { x: 0, y: 0 }, { x: 2, y: 2 });
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.turns).toBe(1);
    }
  });

  it('two-turn path (Z-shape)', () => {
    // Board with obstacle blocking direct L-shape
    const board = makeBoardWithTiles(4, 4, [
      { x: 0, y: 0, id: 'a' },
      { x: 3, y: 3, id: 'b' },
    ], [{ x: 0, y: 3 }]); // block one corner
    const result = findPath(board, { x: 0, y: 0 }, { x: 3, y: 3 });
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.turns).toBeLessThanOrEqual(2);
    }
  });

  it('same point returns not found', () => {
    const board = makeBoardWithTiles(4, 4, [{ x: 0, y: 0, id: 'a' }]);
    const result = findPath(board, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(result.found).toBe(false);
  });

  it('obstacle blocks straight path', () => {
    const board = makeBoardWithTiles(4, 1, [
      { x: 0, y: 0, id: 'a' },
      { x: 3, y: 0, id: 'b' },
    ], [{ x: 1, y: 0 }]);
    const result = findPath(board, { x: 0, y: 0 }, { x: 3, y: 0 });
    expect(result.found).toBe(false);
  });

  it('active tile blocks path', () => {
    const board = makeBoardWithTiles(4, 1, [
      { x: 0, y: 0, id: 'a' },
      { x: 2, y: 0, id: 'c' },
      { x: 3, y: 0, id: 'b' },
    ]);
    const result = findPath(board, { x: 0, y: 0 }, { x: 3, y: 0 });
    expect(result.found).toBe(false);
  });

  it('pollution blocks path', () => {
    const board = makeBoardWithTiles(4, 1, [
      { x: 0, y: 0, id: 'a' },
      { x: 3, y: 0, id: 'b' },
    ], [], [{ x: 1, y: 0 }]);
    const result = findPath(board, { x: 0, y: 0 }, { x: 3, y: 0 });
    expect(result.found).toBe(false);
  });

  it('adjacent tiles connect directly', () => {
    const board = makeBoardWithTiles(2, 1, [
      { x: 0, y: 0, id: 'a' },
      { x: 1, y: 0, id: 'b' },
    ]);
    const result = findPath(board, { x: 0, y: 0 }, { x: 1, y: 0 });
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.turns).toBe(0);
      expect(result.path).toEqual([]);
    }
  });

  it('no path when completely surrounded', () => {
    // Tile at (1,1) surrounded by obstacles and other tiles
    const board = makeBoardWithTiles(3, 3, [
      { x: 1, y: 1, id: 'a' },
      { x: 2, y: 2, id: 'b' },
    ], [
      { x: 0, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 2 },
    ]);
    const result = findPath(board, { x: 1, y: 1 }, { x: 2, y: 2 });
    expect(result.found).toBe(false);
  });
});
