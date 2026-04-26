import { describe, it, expect } from 'vitest';
import { createInitialState, startLevel, selectTile, useShuffle } from '@/core/engine/game-engine';
import { findAnyValidPair } from '@/core/systems/deadlock-detector';

describe('Battle Flow Integration', () => {
  it('can start a level and select tiles', () => {
    const state = startLevel(createInitialState(), 'level-001');
    expect(state.status).toBe('playing');
    expect(state.levelId).toBe('level-001');
    expect(state.board.width).toBe(6);
  });

  it('can complete a match sequence', () => {
    let state = startLevel(createInitialState(), 'level-001');
    expect(state.status).toBe('playing');

    // Find a valid pair
    const pair = findAnyValidPair(state.board);
    expect(pair).not.toBeNull();
    if (!pair) return;

    // Select first tile
    state = selectTile(state, pair[0].id);
    expect(state.selectedTileId).toBe(pair[0].id);

    // Select second tile -> should match
    state = selectTile(state, pair[1].id);
    expect(state.selectedTileId).toBeNull();
    expect(state.matchCount).toBe(1);
  });

  it('can use shuffle', () => {
    let state = startLevel(createInitialState(), 'level-001');
    const initialShuffle = state.shuffleRemaining;

    state = useShuffle(state);
    expect(state.shuffleRemaining).toBe(initialShuffle - 1);
  });

  it('tracks turn advancement on match', () => {
    let state = startLevel(createInitialState(), 'level-001');
    const pair = findAnyValidPair(state.board);
    if (!pair) return;

    const initialTurn = state.turn;
    state = selectTile(state, pair[0].id);
    state = selectTile(state, pair[1].id);
    expect(state.turn).toBe(initialTurn + 1);
  });
});
