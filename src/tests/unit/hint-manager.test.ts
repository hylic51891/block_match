import { describe, it, expect } from 'vitest';
import { useHint, getHintPair } from '@/core/systems/hint-manager';
import { createSimpleBoard, createDeadlockedBoard } from '@/tests/fixtures/boards';

describe('hint-manager', () => {
  it('returns null pair when no hints remaining', () => {
    const result = useHint(createSimpleBoard(), 0);
    expect(result.pair).toBeNull();
    expect(result.hintRemaining).toBe(0);
  });

  it('returns valid pair and decrements hint count', () => {
    const board = createSimpleBoard();
    const result = useHint(board, 3);
    expect(result.pair).not.toBeNull();
    expect(result.hintRemaining).toBe(2);
  });

  it('returns null pair on deadlocked board without decrementing', () => {
    const result = useHint(createDeadlockedBoard(), 3);
    expect(result.pair).toBeNull();
    expect(result.hintRemaining).toBe(3);
  });

  it('getHintPair returns tile IDs for a solvable board', () => {
    const result = getHintPair(createSimpleBoard());
    expect(result).not.toBeNull();
    expect(result!.length).toBe(2);
  });

  it('getHintPair returns null on deadlocked board', () => {
    const result = getHintPair(createDeadlockedBoard());
    expect(result).toBeNull();
  });
});
