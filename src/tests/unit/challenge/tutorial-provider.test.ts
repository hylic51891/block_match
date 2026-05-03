import { describe, it, expect } from 'vitest';
import { getTutorialLevelConfig } from '@/core/challenge/tutorial-provider';
import { generateBoard } from '@/core/board/board-generator';

describe('TutorialLevelProvider', () => {
  it('returns a fixed tutorial config', () => {
    const config = getTutorialLevelConfig();
    expect(config.id).toBe('tutorial');
    expect(config.name).toBe('教学关');
    expect(config.width).toBe(6);
    expect(config.height).toBe(6);
  });

  it('has small board and few types', () => {
    const config = getTutorialLevelConfig();
    expect(config.tileTypes.length).toBeLessThanOrEqual(4);
    expect(config.shuffleLimit).toBeGreaterThanOrEqual(3);
  });

  it('has at least one special type for demo', () => {
    const config = getTutorialLevelConfig();
    expect(config.specialTypes.length).toBeGreaterThanOrEqual(1);
  });

  it('can generate a valid board', () => {
    const config = getTutorialLevelConfig();
    const board = generateBoard(config);
    expect(board.width).toBe(6);
    expect(board.height).toBe(6);
    expect(Object.keys(board.tiles).length).toBeGreaterThan(0);
  });
});
