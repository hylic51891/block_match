import { describe, it, expect } from 'vitest';
import { checkWin, checkLose } from '@/core/systems/win-lose-checker';
import { createSimpleBoard, createClearedBoard, createDeadlockedBoard } from '@/tests/fixtures/boards';

describe('WinLoseChecker', () => {
  it('cleared board is a win', () => {
    const board = createClearedBoard();
    expect(checkWin(board)).toBe(true);
  });

  it('board with tiles is not a win', () => {
    const board = createSimpleBoard();
    expect(checkWin(board)).toBe(false);
  });

  it('deadlocked board with no shuffle is a loss', () => {
    const board = createDeadlockedBoard();
    const result = checkLose(board, 0);
    expect(result.lost).toBe(true);
    expect(result.reason).toBe('deadlock');
  });

  it('deadlocked board with shuffle remaining is not a loss', () => {
    const board = createDeadlockedBoard();
    const result = checkLose(board, 1);
    expect(result.lost).toBe(false);
  });

  it('normal board is not a loss', () => {
    const board = createSimpleBoard();
    const result = checkLose(board, 0);
    expect(result.lost).toBe(false);
  });
});
