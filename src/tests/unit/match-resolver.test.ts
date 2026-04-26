import { describe, it, expect } from 'vitest';
import { resolveMatch } from '@/core/rules/match-resolver';
import { createSimpleBoard, createDeadlockedBoard } from '@/tests/fixtures/boards';
import type { Tile } from '@/types/board';

describe('MatchResolver', () => {
  it('same type with valid path succeeds', () => {
    const board = createSimpleBoard();
    const tileA = board.tiles['t1']!;
    const tileB = board.tiles['t2']!;
    const result = resolveMatch(board, tileA, tileB);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.tileAId).toBe('t1');
      expect(result.tileBId).toBe('t2');
    }
  });

  it('different types fails', () => {
    const board = createSimpleBoard();
    const tileA = board.tiles['t1']!; // type A
    const tileB = board.tiles['t3']!; // type B
    const result = resolveMatch(board, tileA, tileB);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('different_types');
    }
  });

  it('path blocked fails', () => {
    const board = createDeadlockedBoard();
    const tileA = board.tiles['t1']!;
    const tileB = board.tiles['t2']!;
    const result = resolveMatch(board, tileA, tileB);
    expect(result.success).toBe(false);
  });

  it('removed tile fails with not_active', () => {
    const board = createSimpleBoard();
    const removedTile: Tile = { ...board.tiles['t1']!, state: 'removed' };
    const result = resolveMatch(board, removedTile, board.tiles['t2']!);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('not_active');
    }
  });

  it('same tile to itself fails', () => {
    const board = createSimpleBoard();
    const tile = board.tiles['t1']!;
    const result = resolveMatch(board, tile, tile);
    expect(result.success).toBe(false);
  });
});
