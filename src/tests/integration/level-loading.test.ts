import { describe, it, expect } from 'vitest';
import { loadLevel, loadAllLevels } from '@/core/level/level-loader';
import { generateBoard } from '@/core/board/board-generator';

describe('Level Loading', () => {
  it('can load a specific level', () => {
    const config = loadLevel('level-001');
    expect(config.id).toBe('level-001');
    expect(config.width).toBe(6);
    expect(config.height).toBe(6);
  });

  it('can load all 20 levels', () => {
    const levels = loadAllLevels();
    expect(levels.length).toBe(20);
  });

  it('throws for non-existent level', () => {
    expect(() => loadLevel('level-999')).toThrow();
  });

  it('each level can generate a valid board', () => {
    const levels = loadAllLevels();
    for (const config of levels) {
      const board = generateBoard(config);
      expect(board.width).toBe(config.width);
      expect(board.height).toBe(config.height);
      expect(Object.keys(board.tiles).length).toBeGreaterThan(0);
    }
  });
});
