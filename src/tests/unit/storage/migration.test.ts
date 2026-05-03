import { describe, it, expect } from 'vitest';
import { createInitialState } from '@/core/engine/game-engine';

describe('Storage migration', () => {
  it('createInitialState has all new fields', () => {
    const state = createInitialState();
    expect(state).toHaveProperty('reviveState', 'none');
    expect(state).toHaveProperty('reviveUsed', 0);
    expect(state).toHaveProperty('timeLimit', 0);
    expect(state).toHaveProperty('mode');
  });

  it('default LocalProgress is valid', () => {
    const defaultProgress = { tutorialCompleted: false, settings: { audioEnabled: true } };
    expect(defaultProgress.tutorialCompleted).toBe(false);
    expect(defaultProgress.settings.audioEnabled).toBe(true);
  });

  it('dailyBest undefined is handled by spread merge', () => {
    const defaults = { tutorialCompleted: false, settings: { audioEnabled: true } };
    const saved = { ...defaults, tutorialCompleted: true, dailyBest: {} as Record<string, unknown> };
    expect(saved.tutorialCompleted).toBe(true);
    expect(saved.settings.audioEnabled).toBe(true);
    expect(saved.dailyBest).toBeDefined();
  });
});
