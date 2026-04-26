import { describe, it, expect } from 'vitest';
import { shuffle } from '@/core/systems/shuffle-manager';
import { createSimpleBoard } from '@/tests/fixtures/boards';
import { getActiveTiles, setCell } from '@/core/board/board-model';
import { isDeadlocked } from '@/core/systems/deadlock-detector';

describe('ShuffleManager', () => {
  it('preserves active tile count', () => {
    const board = createSimpleBoard();
    const before = getActiveTiles(board).length;
    const shuffled = shuffle(board);
    expect(getActiveTiles(shuffled).length).toBe(before);
  });

  it('preserves tile type distribution', () => {
    const board = createSimpleBoard();
    const beforeTypes = getActiveTiles(board)
      .map((t) => t.type)
      .sort();
    const shuffled = shuffle(board);
    const afterTypes = getActiveTiles(shuffled)
      .map((t) => t.type)
      .sort();
    expect(afterTypes).toEqual(beforeTypes);
  });

  it('does not change obstacle positions', () => {
    const board = createSimpleBoard();
    const boardWithObs = setCell(board, 2, 2, { x: 2, y: 2, kind: 'obstacle', obstacleType: 'rock' });
    const shuffled = shuffle(boardWithObs);
    expect(shuffled.cells[2]![2]!.kind).toBe('obstacle');
  });

  it('result is not deadlocked', () => {
    const board = createSimpleBoard();
    const shuffled = shuffle(board);
    expect(isDeadlocked(shuffled)).toBe(false);
  });

  it('preserves tile ids', () => {
    const board = createSimpleBoard();
    const beforeIds = getActiveTiles(board).map((t) => t.id).sort();
    const shuffled = shuffle(board);
    const afterIds = getActiveTiles(shuffled).map((t) => t.id).sort();
    expect(afterIds).toEqual(beforeIds);
  });

  it('preserves tile positions', () => {
    const board = createSimpleBoard();
    const beforePositions = getActiveTiles(board).map((t) => `${t.x},${t.y}`).sort();
    const shuffled = shuffle(board);
    const afterPositions = getActiveTiles(shuffled).map((t) => `${t.x},${t.y}`).sort();
    expect(afterPositions).toEqual(beforePositions);
  });
});
