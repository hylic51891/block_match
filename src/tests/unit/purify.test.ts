import { describe, it, expect } from 'vitest';
import { purifyAroundPath } from '@/core/systems/pollution-system';
import { createEmptyBoard, setCell } from '@/core/board/board-model';
import type { Cell } from '@/types/board';

function makeBoardWithPollution(): ReturnType<typeof createEmptyBoard> {
  let board = createEmptyBoard(6, 6);
  const layout = [
    { x: 0, y: 0, id: 't1', type: 'T' },
    { x: 5, y: 0, id: 't2', type: 'T' },
  ];
  for (const t of layout) {
    const cell: Cell = { x: t.x, y: t.y, kind: 'tile', tileId: t.id };
    board = setCell(board, t.x, t.y, cell);
    board.tiles[t.id] = { id: t.id, type: t.type, x: t.x, y: t.y, state: 'active', specialType: 'T' };
  }
  return board;
}

describe('purifyAroundPath', () => {
  it('clears pollution adjacent to path points', () => {
    let board = makeBoardWithPollution();
    const path = [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }];

    // Add pollution at (2,1) - below path point (2,0), Manhattan distance 1
    board = setCell(board, 2, 1, { x: 2, y: 1, kind: 'pollution', pollutionExpireTurn: 99 });

    const result = purifyAroundPath(board, path);
    expect(result.cells[1]![2]!.kind).toBe('empty');
  });

  it('does not clear pollution outside Manhattan distance 1', () => {
    let board = makeBoardWithPollution();
    const path = [{ x: 1, y: 0 }];

    // Add pollution at (1,2) - 2 cells away
    board = setCell(board, 1, 2, { x: 1, y: 2, kind: 'pollution', pollutionExpireTurn: 99 });

    const result = purifyAroundPath(board, path);
    expect(result.cells[2]![1]!.kind).toBe('pollution');
  });

  it('clears pollution in all 4 Manhattan directions', () => {
    let board = createEmptyBoard(6, 6);
    const path = [{ x: 3, y: 3 }];

    board = setCell(board, 3, 2, { x: 3, y: 2, kind: 'pollution', pollutionExpireTurn: 99 });
    board = setCell(board, 3, 4, { x: 3, y: 4, kind: 'pollution', pollutionExpireTurn: 99 });
    board = setCell(board, 2, 3, { x: 2, y: 3, kind: 'pollution', pollutionExpireTurn: 99 });
    board = setCell(board, 4, 3, { x: 4, y: 3, kind: 'pollution', pollutionExpireTurn: 99 });

    const result = purifyAroundPath(board, path);
    expect(result.cells[2]![3]!.kind).toBe('empty');
    expect(result.cells[4]![3]!.kind).toBe('empty');
    expect(result.cells[3]![2]!.kind).toBe('empty');
    expect(result.cells[3]![4]!.kind).toBe('empty');
  });

  it('does not clear diagonal pollution (Manhattan distance only)', () => {
    let board = createEmptyBoard(6, 6);
    const path = [{ x: 3, y: 3 }];

    // Diagonal positions - should NOT be cleared
    board = setCell(board, 2, 2, { x: 2, y: 2, kind: 'pollution', pollutionExpireTurn: 99 }); // top-left
    board = setCell(board, 4, 4, { x: 4, y: 4, kind: 'pollution', pollutionExpireTurn: 99 }); // bottom-right
    board = setCell(board, 2, 4, { x: 2, y: 4, kind: 'pollution', pollutionExpireTurn: 99 }); // bottom-left
    board = setCell(board, 4, 2, { x: 4, y: 2, kind: 'pollution', pollutionExpireTurn: 99 }); // top-right

    const result = purifyAroundPath(board, path);
    expect(result.cells[2]![2]!.kind).toBe('pollution');
    expect(result.cells[4]![4]!.kind).toBe('pollution');
    expect(result.cells[4]![2]!.kind).toBe('pollution');
    expect(result.cells[2]![4]!.kind).toBe('pollution');
  });
});
