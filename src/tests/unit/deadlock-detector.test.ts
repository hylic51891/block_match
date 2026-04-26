import { describe, it, expect } from 'vitest';
import { isDeadlocked, findAnyValidPair } from '@/core/systems/deadlock-detector';
import { createSimpleBoard, createDeadlockedBoard, createClearedBoard } from '@/tests/fixtures/boards';

describe('DeadlockDetector', () => {
  it('board with valid pair is not deadlocked', () => {
    const board = createSimpleBoard();
    expect(isDeadlocked(board)).toBe(false);
  });

  it('deadlocked board is detected', () => {
    const board = createDeadlockedBoard();
    expect(isDeadlocked(board)).toBe(true);
  });

  it('findAnyValidPair returns pair when available', () => {
    const board = createSimpleBoard();
    const pair = findAnyValidPair(board);
    expect(pair).not.toBeNull();
    if (pair) {
      expect(pair[0].type).toBe(pair[1].type);
    }
  });

  it('findAnyValidPair returns null when deadlocked', () => {
    const board = createDeadlockedBoard();
    const pair = findAnyValidPair(board);
    expect(pair).toBeNull();
  });

  it('empty board (cleared) is not deadlocked', () => {
    const board = createClearedBoard();
    expect(isDeadlocked(board)).toBe(false);
  });
});
