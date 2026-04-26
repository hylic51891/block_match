import { describe, it, expect } from 'vitest';
import { applyPollution, decayPollution, countPollution, clearAllPollution } from '@/core/systems/pollution-system';
import { createEmptyBoard, setCell } from '@/core/board/board-model';
import type { Cell } from '@/types/board';

function makeBoardWithTiles() {
  let board = createEmptyBoard(4, 4);
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

describe('PollutionSystem', () => {
  it('pollutes empty cells along path', () => {
    const board = makeBoardWithTiles();
    // Path between (0,0) and (3,0) goes through (1,0) and (2,0)
    const path = [{ x: 1, y: 0 }, { x: 2, y: 0 }];
    const result = applyPollution(board, path, 1, 2);
    expect(result.cells[0]![1]!.kind).toBe('pollution');
    expect(result.cells[0]![2]!.kind).toBe('pollution');
  });

  it('does not pollute start and end tile cells', () => {
    const board = makeBoardWithTiles();
    const path = [{ x: 1, y: 0 }, { x: 2, y: 0 }];
    const result = applyPollution(board, path, 1, 2);
    // Start tile cell should still be 'tile'
    expect(result.cells[0]![0]!.kind).toBe('tile');
    expect(result.cells[0]![3]!.kind).toBe('tile');
  });

  it('pollution decays after duration turns', () => {
    const board = makeBoardWithTiles();
    const path = [{ x: 1, y: 0 }, { x: 2, y: 0 }];
    const polluted = applyPollution(board, path, 1, 2);
    // Turn 2: not yet expired
    const notYet = decayPollution(polluted, 2);
    expect(notYet.cells[0]![1]!.kind).toBe('pollution');
    // Turn 3: expired (currentTurn >= expireTurn)
    const decayed = decayPollution(polluted, 3);
    expect(decayed.cells[0]![1]!.kind).toBe('empty');
    expect(decayed.cells[0]![2]!.kind).toBe('empty');
  });

  it('expired pollution auto-clears', () => {
    const board = makeBoardWithTiles();
    const path = [{ x: 1, y: 0 }];
    const polluted = applyPollution(board, path, 1, 1);
    expect(polluted.cells[0]![1]!.kind).toBe('pollution');
    const decayed = decayPollution(polluted, 2);
    expect(decayed.cells[0]![1]!.kind).toBe('empty');
  });

  it('countPollution returns correct count', () => {
    const board = makeBoardWithTiles();
    const path = [{ x: 1, y: 0 }, { x: 2, y: 0 }];
    const polluted = applyPollution(board, path, 1, 2);
    expect(countPollution(polluted)).toBe(2);
  });

  it('clearAllPollution removes all pollution', () => {
    const board = makeBoardWithTiles();
    const path = [{ x: 1, y: 0 }, { x: 2, y: 0 }];
    const polluted = applyPollution(board, path, 1, 2);
    const cleared = clearAllPollution(polluted);
    expect(countPollution(cleared)).toBe(0);
  });
});
