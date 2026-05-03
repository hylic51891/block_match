import { describe, it, expect } from 'vitest';
import { createInitialState, offerRevive, confirmRevive, declineRevive } from '@/core/engine/game-engine';

describe('offerRevive', () => {
  it('does not offer revive when status is not failed', () => {
    const state = { ...createInitialState(), status: 'playing' as const };
    const result = offerRevive(state);
    expect(result.reviveState).toBe('none');
  });

  it('does not offer revive when already used once', () => {
    const state = { ...createInitialState(), status: 'failed' as const, reviveUsed: 1 };
    const result = offerRevive(state);
    expect(result.reviveState).toBe('none');
  });

  it('does not offer revive for tutorial mode', () => {
    const state = { ...createInitialState(), status: 'failed' as const, mode: 'tutorial' as const };
    const result = offerRevive(state);
    expect(result.reviveState).toBe('none');
  });

  it('offers revive for failed daily_challenge', () => {
    const state = { ...createInitialState(), status: 'failed' as const, mode: 'daily_challenge' as const, failReason: 'deadlock' as const };
    const result = offerRevive(state);
    expect(result.reviveState).toBe('offered');
  });
});

describe('confirmRevive', () => {
  it('does not confirm when not in ad_watching state', () => {
    const state = { ...createInitialState(), reviveState: 'offered' as const };
    const result = confirmRevive(state);
    expect(result.reviveState).toBe('offered');
  });

  it('confirms revive from ad_watching state', () => {
    const state = {
      ...createInitialState(),
      status: 'failed' as const,
      reviveState: 'ad_watching' as const,
      mode: 'daily_challenge' as const,
      shuffleRemaining: 0,
      reviveUsed: 0,
    };
    const result = confirmRevive(state);
    expect(result.status).toBe('playing');
    expect(result.reviveState).toBe('revived');
    expect(result.reviveUsed).toBe(1);
    expect(result.shuffleRemaining).toBe(1);
    expect(result.timeLimit).toBe(60);
    expect(result.failReason).toBeUndefined();
  });
});

describe('declineRevive', () => {
  it('does not decline when not in offered state', () => {
    const state = { ...createInitialState(), reviveState: 'none' as const };
    const result = declineRevive(state);
    expect(result.reviveState).toBe('none');
  });

  it('declines revive from offered state', () => {
    const state = { ...createInitialState(), reviveState: 'offered' as const };
    const result = declineRevive(state);
    expect(result.reviveState).toBe('none');
  });
});
