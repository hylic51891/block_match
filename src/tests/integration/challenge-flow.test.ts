import { describe, it, expect } from 'vitest';
import { createInitialState, startChallenge, selectTile, resetLevel, useHint } from '@/core/engine/game-engine';
import { findAnyValidPair } from '@/core/systems/deadlock-detector';

describe('Challenge Flow Integration', () => {
  it('can start a tutorial challenge', () => {
    const state = startChallenge(createInitialState(), 'tutorial');
    expect(state.status).toBe('playing');
    expect(state.mode).toBe('tutorial');
    expect(state.levelId).toBe('tutorial');
    expect(state.board.width).toBe(6);
    expect(state.board.height).toBe(6);
  });

  it('can start a daily challenge', () => {
    const state = startChallenge(createInitialState(), 'daily_challenge', '2025-06-15');
    expect(state.status).toBe('playing');
    expect(state.mode).toBe('daily_challenge');
    expect(state.challengeDate).toBe('2025-06-15');
    expect(state.board.width).toBeGreaterThanOrEqual(8);
  });

  it('can complete a match in tutorial mode', () => {
    let state = startChallenge(createInitialState(), 'tutorial');
    const pair = findAnyValidPair(state.board);
    expect(pair).not.toBeNull();
    if (!pair) return;

    state = selectTile(state, pair[0].id);
    expect(state.selectedTileId).toBe(pair[0].id);

    state = selectTile(state, pair[1].id);
    expect(state.selectedTileId).toBeNull();
    expect(state.matchCount).toBe(1);
  });

  it('can reset a daily challenge and get same config', () => {
    const state1 = startChallenge(createInitialState(), 'daily_challenge', '2025-06-15');
    const state2 = resetLevel(state1);
    expect(state2.mode).toBe('daily_challenge');
    expect(state2.challengeDate).toBe('2025-06-15');
    expect(state2.status).toBe('playing');
  });

  it('can reset a tutorial challenge', () => {
    const state1 = startChallenge(createInitialState(), 'tutorial');
    const state2 = resetLevel(state1);
    expect(state2.mode).toBe('tutorial');
    expect(state2.status).toBe('playing');
  });

  it('daily challenge has hintRemaining from config', () => {
    const state = startChallenge(createInitialState(), 'daily_challenge', '2025-06-15');
    expect(state.hintRemaining).toBe(0); // daily challenge default: 0 hints
  });

  it('tutorial has hintRemaining > 0', () => {
    const state = startChallenge(createInitialState(), 'tutorial');
    expect(state.hintRemaining).toBeGreaterThan(0);
  });

  it('useHint does nothing when hintRemaining is 0', () => {
    const state = startChallenge(createInitialState(), 'daily_challenge', '2025-06-15');
    const after = useHint(state);
    expect(after.hintRemaining).toBe(0);
  });
});
